import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ORIGIN, REQUIRED_ASSETS, REQUIRED_LINKS } from './seo-validation.mjs'
import { requestResource, readBuildExpectations, assetContentTypes, parseNetworkArgs } from './seo-network.mjs'
import { auditProduction } from './audit-seo-live.mjs'
import { submitIndexNow, INDEXNOW_ENDPOINT } from './submit-indexnow.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const xml = (urls) => `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url}</loc></url>`).join('')}</urlset>`
function html(pathname) {
  const url = `${ORIGIN}${pathname}`
  const title = pathname === '/' ? 'Trimugo — software practice' : 'About Trimugo'
  const business = { '@type': 'ProfessionalService', '@id': `${ORIGIN}/#organization`, name: 'Trimugo', url: `${ORIGIN}/` }
  const identity = { '@id': business['@id'] }
  const schemas = [business, pathname === '/'
    ? { '@type': 'WebSite', name: 'Trimugo', url, publisher: identity }
    : { '@type': 'AboutPage', mainEntity: identity }]
  if (pathname !== '/') schemas.push({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: title, item: url }] })
  return `<!doctype html><html><head><title>${title}</title>
    <meta name="description" content="Trimugo builds useful software for businesses." />
    <link rel="canonical" href="${url}" /><meta name="robots" content="index, follow" />
    <meta property="og:url" content="${url}" /><meta property="og:site_name" content="Trimugo" />
    <meta property="og:title" content="${title}" /><meta name="twitter:title" content="${title}" />
    <meta property="og:image" content="${ORIGIN}/og-image.png" /><meta name="twitter:image" content="${ORIGIN}/og-image.png" />
    <script type="application/ld+json">${JSON.stringify(schemas)}</script>
    ${pathname === '/' ? '<script type="module" src="/assets/entry-deployed.js"></script>' : ''}
    </head><body><h1>${title}</h1><p>Intended deployed introduction.</p>
    ${REQUIRED_LINKS.map((href) => `<a href="${href}">${href}</a>`).join('')}
    </body></html>`
}

function fixture(t) {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'trimugo-network-test-'))
  t.after(() => fs.rmSync(dist, { recursive: true, force: true }))
  for (const asset of REQUIRED_ASSETS) fs.copyFileSync(path.join(root, 'public', asset), path.join(dist, asset))
  fs.mkdirSync(path.join(dist, 'about'))
  fs.mkdirSync(path.join(dist, 'assets'))
  fs.writeFileSync(path.join(dist, 'assets/entry-deployed.js'), 'window.trimugoFixture = true;')
  fs.writeFileSync(path.join(dist, 'index.html'), html('/'))
  fs.writeFileSync(path.join(dist, 'about/index.html'), html('/about/'))
  fs.writeFileSync(path.join(dist, 'sitemap.xml'), xml([`${ORIGIN}/`, `${ORIGIN}/about/`]))
  fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`)
  return dist
}

const response = (body, type = 'text/html', status = 200, headers = {}) => new Response(body, { status, headers: { 'content-type': type, ...headers } })
function mockSite(dist, override = () => undefined) {
  const calls = []
  const fetchImpl = async (url, options) => {
    calls.push({ url, method: options.method, body: options.body })
    const custom = await override(url, options)
    if (custom !== undefined) return custom
    if (url === INDEXNOW_ENDPOINT) return response('', 'text/plain', 200)
    const parsed = new URL(url)
    if (parsed.origin !== ORIGIN) return response('', 'text/html', 308, { location: `${ORIGIN}/` })
    if (parsed.pathname.startsWith('/__trimugo-seo-audit-missing-')) return response('Not found', 'text/html', 404)
    const name = parsed.pathname.slice(1)
    const file = path.join(dist, name.endsWith('/') || !name ? `${name}index.html` : name)
    if (!fs.existsSync(file)) return response('Not found', 'text/html', 404)
    const type = name === 'sitemap.xml' ? 'application/xml' : name.endsWith('/') || !name ? 'text/html' : assetContentTypes(name)[0]
    return response(fs.readFileSync(file), type)
  }
  return { fetchImpl, calls, posts: () => calls.filter((call) => call.method === 'POST') }
}

test('dry run reads all pages and assets, reports preflight, and never posts', async (t) => {
  const dist = fixture(t)
  const site = mockSite(dist)
  const result = await submitIndexNow({ dist, dryRun: true, fetchImpl: site.fetchImpl })
  assert.equal(result.ok, true, JSON.stringify(result.preflight))
  assert.equal(result.preflight.ok, true)
  assert.equal(result.attempted, false)
  assert.equal(result.submitted, false)
  assert.equal(result.receipt, null)
  assert.deepEqual(result.urls, [`${ORIGIN}/`, `${ORIGIN}/about/`])
  assert.equal(site.posts().length, 0)
  for (const name of REQUIRED_ASSETS) assert.ok(site.calls.some((call) => call.url === `${ORIGIN}/${name}`))
})

test('invalid or empty sitemap inputs fail before making any requests', async (t) => {
  const malformed = ['', '<urlset>', xml([]), xml([`${ORIGIN}/`, `${ORIGIN}/`]), xml(['https://other.example/']), xml([`${ORIGIN}/#about`])]
  for (const sitemap of malformed) {
    const dist = fixture(t)
    fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap)
    const site = mockSite(dist)
    await assert.rejects(submitIndexNow({ dist, dryRun: true, fetchImpl: site.fetchImpl }), /sitemap|URL|fragment/)
    assert.equal(site.calls.length, 0)
  }
})

test('missing or malformed built assets fail before making requests', async (t) => {
  const dist = fixture(t)
  fs.writeFileSync(path.join(dist, 'og-image.png'), '<html>wrong format</html>')
  const site = mockSite(dist)
  await assert.rejects(submitIndexNow({ dist, fetchImpl: site.fetchImpl }), /asset is invalid/)
  assert.equal(site.calls.length, 0)
  fs.unlinkSync(path.join(dist, 'og-image.png'))
  assert.throws(() => readBuildExpectations(dist), /asset missing/)
})

test('unavailable pages or key, wrong key, and wrong static identity never submit', async (t) => {
  const keyFile = REQUIRED_ASSETS.find((name) => /^[\da-f]+\.txt$/.test(name))
  const cases = [
    { url: `${ORIGIN}/about/`, body: 'Unavailable', status: 503 },
    { url: `${ORIGIN}/${keyFile}`, body: 'Not found', status: 404, type: 'text/plain' },
    { url: `${ORIGIN}/${keyFile}`, body: 'wrong-key', status: 200, type: 'text/plain' },
    { url: `${ORIGIN}/about/`, body: html('/'), status: 200 },
  ]
  for (const scenario of cases) {
    const dist = fixture(t)
    const site = mockSite(dist, (url) => url === scenario.url ? response(scenario.body, scenario.type, scenario.status) : undefined)
    const result = await submitIndexNow({ dist, fetchImpl: site.fetchImpl })
    assert.equal(result.ok, false)
    assert.equal(result.submitted, false)
    assert.ok(result.preflight.errors.length)
    assert.equal(site.posts().length, 0)
  }
})

test('unchanged metadata cannot disguise undeployed content or entry assets', async (t) => {
  for (const changedPath of ['/', '/assets/entry-deployed.js']) {
    const dist = fixture(t)
    const site = mockSite(dist, (url) => {
      if (url !== `${ORIGIN}${changedPath}`) return undefined
      return changedPath === '/' ? response(html('/').replace('Intended deployed introduction.', 'Old introduction.')) : response('window.oldBuild = true;', 'text/javascript')
    })
    const result = await submitIndexNow({ dist, dryRun: true, fetchImpl: site.fetchImpl })
    assert.equal(result.ok, false)
    assert.equal(result.preflight.errors.length, 0)
    assert.ok(result.preflight.buildDifferences.some((difference) => difference.includes(`${ORIGIN}${changedPath}`)))
    assert.equal(site.posts().length, 0)
  }
})

test('audit detects missing-page homepage fallback, robots blocks, and X-Robots-Tag', async (t) => {
  const dist = fixture(t)
  const site = mockSite(dist, (url) => {
    if (url.includes('/__trimugo-seo-audit-missing-')) return response(html('/'))
    if (url === `${ORIGIN}/about/`) return response(html('/about/'), 'text/html', 200, { 'x-robots-tag': 'googlebot: noindex' })
    if (url === `${ORIGIN}/robots.txt`) return response(`User-agent: bingbot\nDisallow: /about/\nSitemap: ${ORIGIN}/sitemap.xml`, 'text/plain')
  })
  const report = await auditProduction({ dist, fetchImpl: site.fetchImpl })
  assert.equal(report.ok, false)
  assert.ok(report.errors.some((error) => error.includes('soft 404')))
  assert.ok(report.errors.some((error) => error.includes('X-Robots-Tag')))
  assert.ok(report.errors.some((error) => error.includes('blocks bingbot')))
  assert.equal(site.posts().length, 0)
})

test('foreign-host redirects are refused before fetching that host', async () => {
  const calls = []
  await assert.rejects(requestResource(`${ORIGIN}/about/`, {
    fetchImpl: async (url) => { calls.push(url); return response('', 'text/html', 302, { location: 'https://other.example/' }) },
  }), /foreign-host redirect/)
  assert.deepEqual(calls, [`${ORIGIN}/about/`])
})

test('timeouts include header and body waits and prevent preflight submission', async (t) => {
  await assert.rejects(requestResource(`${ORIGIN}/`, { timeoutMs: 10, fetchImpl: () => new Promise(() => {}) }), /timed out/)
  await assert.rejects(requestResource(`${ORIGIN}/`, {
    timeoutMs: 10,
    fetchImpl: async () => new Response(new ReadableStream({ start() {} }), { headers: { 'content-type': 'text/html' } }),
  }), /timed out/)
  const dist = fixture(t)
  const site = mockSite(dist, (url) => url === `${ORIGIN}/about/` ? new Promise(() => {}) : undefined)
  const result = await submitIndexNow({ dist, fetchImpl: site.fetchImpl, timeoutMs: 20 })
  assert.equal(result.ok, false)
  assert.ok(result.preflight.errors.some((error) => error.includes('timed out')))
  assert.equal(site.posts().length, 0)
})

test('200 acceptance, 202 pending validation, and failures have truthful receipts', async (t) => {
  for (const status of [200, 202, 400, 403, 422, 429, 500]) {
    const dist = fixture(t)
    const site = mockSite(dist, (url) => url === INDEXNOW_ENDPOINT ? response('endpoint receipt', 'text/plain', status, status === 429 ? { 'retry-after': '120' } : {}) : undefined)
    const result = await submitIndexNow({ dist, fetchImpl: site.fetchImpl })
    assert.equal(result.submitted, true)
    assert.equal(result.ok, [200, 202].includes(status))
    assert.equal(result.receipt.status, status)
    assert.equal(site.posts().length, 1)
    const payload = JSON.parse(site.posts()[0].body)
    assert.equal(payload.host, 'www.trimugo.in')
    assert.deepEqual(payload.urlList, result.urls)
    if (status === 200) assert.match(result.message, /notification accepted.*does not confirm/)
    if (status === 202) assert.match(result.message, /key validation is pending/)
    if (status === 429) assert.equal(result.receipt.retryAfter, '120')
  }
})

test('POST timeout has no confirmed receipt and does not retry', async (t) => {
  const dist = fixture(t)
  const site = mockSite(dist, (url) => url === INDEXNOW_ENDPOINT ? new Promise(() => {}) : undefined)
  const result = await submitIndexNow({ dist, fetchImpl: site.fetchImpl, timeoutMs: 20 })
  assert.equal(result.ok, false)
  assert.equal(result.attempted, true)
  assert.equal(result.submitted, false)
  assert.equal(result.receipt, null)
  assert.match(result.message, /no confirmed endpoint receipt/)
  assert.equal(site.posts().length, 1)
})

test('CLI rejects unknown switches and unbounded network settings', () => {
  assert.throws(() => parseNetworkArgs(['--dryrun'], { submission: true }), /Unknown argument/)
  assert.throws(() => parseNetworkArgs(['--concurrency', '0']), /requires an integer/)
  assert.throws(() => parseNetworkArgs(['--timeout-ms', 'Infinity']), /requires an integer/)
  assert.equal(parseNetworkArgs(['--dry-run'], { submission: true }).dryRun, true)
})
