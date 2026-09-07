import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { ORIGIN, REQUIRED_ASSETS, parseSitemap, inspectPage, inspectAsset } from './seo-validation.mjs'

export const DEFAULT_TIMEOUT_MS = 12_000
export const DEFAULT_CONCURRENCY = 4
const MAX_BODY_BYTES = 6 * 1024 * 1024
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])

// Manual redirects keep all public preflight reads on the intended host.
// The timeout covers redirects and response-body reading, not just headers.
export async function requestResource(url, {
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  allowedOrigins = [ORIGIN],
  maxRedirects = 5,
  maxBytes = MAX_BODY_BYTES,
  method = 'GET',
  headers = {},
  body,
} = {}) {
  const controller = new AbortController()
  let timer
  const operation = async () => {
    let current = new URL(url).href
    const redirects = []
    while (true) {
      const target = new URL(current)
      if (!allowedOrigins.includes(target.origin) || target.username || target.password || target.hash) {
        throw new Error(`Refused URL outside the allowed origin: ${current}`)
      }
      const response = await fetchImpl(current, {
        method, body, redirect: 'manual', signal: controller.signal,
        headers: { 'User-Agent': 'TrimugoSEOAudit/1.0', ...headers },
      })
      if (REDIRECT_STATUSES.has(response.status)) {
        await response.body?.cancel()
        const location = response.headers.get('location')
        if (!location) throw new Error(`HTTP ${response.status} without Location at ${current}`)
        if (redirects.length >= maxRedirects) throw new Error(`Redirect limit exceeded at ${current}`)
        const next = new URL(location, current)
        if (!allowedOrigins.includes(next.origin)) throw new Error(`Refused foreign-host redirect: ${current} -> ${next.href}`)
        if (target.protocol === 'https:' && next.protocol !== 'https:') throw new Error(`Refused HTTPS downgrade: ${current} -> ${next.href}`)
        redirects.push({ url: current, status: response.status, location: next.href })
        current = next.href
        continue
      }
      const chunks = []
      let size = 0
      const reader = response.body?.getReader()
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          size += value.byteLength
          if (size > maxBytes) {
            await reader.cancel()
            throw new Error(`Response exceeds ${maxBytes} bytes at ${current}`)
          }
          chunks.push(Buffer.from(value))
        }
      }
      const bytes = Buffer.concat(chunks)
      return {
        requestedUrl: url, url: current, status: response.status, redirects,
        contentType: (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase(),
        xRobotsTag: response.headers.get('x-robots-tag') || '',
        retryAfter: response.headers.get('retry-after') || '',
        bytes, text: bytes.toString('utf8'),
      }
    }
  }
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      reject(new Error(`Request timed out after ${timeoutMs}ms: ${url}`))
    }, timeoutMs)
  })
  try {
    return await Promise.race([operation(), deadline])
  } catch (error) {
    if (controller.signal.aborted) throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`)
    throw new Error(`${url}: ${error.message}`)
  } finally {
    clearTimeout(timer)
    controller.abort()
  }
}

export async function mapConcurrent(values, limit, callback) {
  const results = new Array(values.length)
  let cursor = 0
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (cursor < values.length) {
      const index = cursor++
      results[index] = await callback(values[index], index)
    }
  }))
  return results
}

export function documentFingerprint(html) {
  return createHash('sha256').update(html.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').trim()).digest('hex')
}

export function bytesFingerprint(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

export function readBuildExpectations(dist = path.resolve('dist')) {
  const sitemapFile = path.join(dist, 'sitemap.xml')
  if (!fs.existsSync(sitemapFile)) throw new Error(`${sitemapFile} missing; run npm run build first.`)
  const urls = parseSitemap(fs.readFileSync(sitemapFile, 'utf8'))
  if (urls.length > 10_000) throw new Error('Sitemap exceeds the IndexNow limit of 10,000 URLs per request.')
  const pages = new Map()
  for (const url of urls) {
    const pathname = new URL(url).pathname
    if (!/^\/(?:[a-z0-9-]+\/)*$/.test(pathname)) throw new Error(`Unsupported built page path: ${pathname}`)
    const file = path.join(dist, pathname.slice(1), 'index.html')
    if (!fs.existsSync(file)) throw new Error(`${file} missing for sitemap URL ${url}; rebuild first.`)
    const html = fs.readFileSync(file, 'utf8')
    const page = inspectPage(html, url)
    if (page.errors.length) throw new Error(`Intended build is invalid at ${url}: ${page.errors.join('; ')}`)
    pages.set(url, { ...page, fingerprint: documentFingerprint(html) })
  }
  const assets = new Map()
  const homeFile = path.join(dist, 'index.html')
  const home = fs.readFileSync(homeFile, 'utf8')
  // Include build-hashed entry JS/CSS so undeployed application changes are detected.
  const entryAssets = [...home.matchAll(/(?:src|href)\s*=\s*["'](\/assets\/[^"']+)["']/g)].map((match) => match[1].slice(1))
  for (const asset of new Set([...REQUIRED_ASSETS, ...entryAssets])) {
    if (asset.includes('..') || /[?#]/.test(asset)) throw new Error(`Invalid build asset path: ${asset}`)
    const file = path.join(dist, asset)
    if (!fs.existsSync(file)) throw new Error(`Required built asset missing: ${file}`)
    const bytes = fs.readFileSync(file)
    if (!bytes.length) throw new Error(`Required built asset is empty: ${file}`)
    if (REQUIRED_ASSETS.includes(asset)) {
      const { errors } = inspectAsset(asset, bytes)
      if (errors.length) throw new Error(`Intended build asset is invalid: ${errors.join('; ')}`)
    }
    assets.set(`${ORIGIN}/${asset}`, { name: asset, bytes, fingerprint: bytesFingerprint(bytes) })
  }
  const keys = REQUIRED_ASSETS.filter((name) => /^[a-zA-Z0-9-]{8,128}\.txt$/.test(name))
  if (keys.length !== 1) throw new Error('Expected exactly one IndexNow key file in required build assets.')
  const key = keys[0].slice(0, -4)
  const keyUrl = `${ORIGIN}/${keys[0]}`
  if (assets.get(keyUrl).bytes.toString('utf8').trim() !== key) throw new Error('Built IndexNow key file does not match its filename.')
  return { dist: path.resolve(dist), urls, pages, assets, key, keyUrl }
}

export function responseSummary(response) {
  const { requestedUrl, url, status, contentType, xRobotsTag, redirects } = response
  return { requestedUrl, url, status, contentType, xRobotsTag, redirects }
}

export function restrictiveDirectives(value) {
  return /\b(?:noindex|none|nofollow)\b/i.test(value)
}

export function assertResponse(response, expectedUrl, contentTypes, { checkRobots = false } = {}) {
  const errors = []
  if (response.status !== 200) errors.push(`Expected HTTP 200, received ${response.status}`)
  if (response.url !== expectedUrl) errors.push(`Final URL ${response.url} differs from ${expectedUrl}`)
  if (!contentTypes.includes(response.contentType)) errors.push(`Unexpected Content-Type ${response.contentType || '(missing)'}`)
  if (checkRobots && restrictiveDirectives(response.xRobotsTag)) errors.push(`Restrictive X-Robots-Tag: ${response.xRobotsTag}`)
  return errors
}

export function assetContentTypes(name) {
  if (name.endsWith('.png')) return ['image/png']
  if (name.endsWith('.svg')) return ['image/svg+xml']
  if (name.endsWith('.ico')) return ['image/x-icon', 'image/vnd.microsoft.icon', 'image/ico']
  if (name.endsWith('.txt')) return ['text/plain']
  if (name.endsWith('.html')) return ['text/html']
  if (name.endsWith('.webmanifest')) return ['application/manifest+json', 'application/json']
  if (name.endsWith('.js')) return ['application/javascript', 'text/javascript']
  if (name.endsWith('.css')) return ['text/css']
  throw new Error(`No expected Content-Type for asset ${name}`)
}

export function parseNetworkArgs(args, { submission = false } = {}) {
  const options = { dist: path.resolve('dist'), timeoutMs: DEFAULT_TIMEOUT_MS, concurrency: DEFAULT_CONCURRENCY, json: false, dryRun: false }
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]
    if (arg === '--json') options.json = true
    else if (arg === '--dry-run' && submission) options.dryRun = true
    else if (arg === '--dist') {
      const value = args[++index]
      if (!value || value.startsWith('--')) throw new Error('--dist requires a directory.')
      options.dist = path.resolve(value)
    } else if (arg === '--timeout-ms' || arg === '--concurrency') {
      const value = Number(args[++index])
      const [minimum, maximum] = arg === '--timeout-ms' ? [100, 60_000] : [1, 8]
      if (!Number.isInteger(value) || value < minimum || value > maximum) throw new Error(`${arg} requires an integer from ${minimum} to ${maximum}.`)
      options[arg === '--timeout-ms' ? 'timeoutMs' : 'concurrency'] = value
    } else throw new Error(`Unknown argument: ${arg}`)
  }
  return options
}

export function isMain(moduleUrl) {
  return Boolean(process.argv[1]) && moduleUrl === pathToFileURL(path.resolve(process.argv[1])).href
}
