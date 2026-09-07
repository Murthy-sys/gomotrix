// Public GET requests only. A passing audit describes crawl eligibility, not indexing.
import { randomUUID } from 'node:crypto'
import { ORIGIN, parseSitemap, inspectPage, inspectRobots, inspectAsset, REQUIRED_ASSETS } from './seo-validation.mjs'
import {
  requestResource, mapConcurrent, readBuildExpectations, responseSummary,
  assertResponse, assetContentTypes, documentFingerprint, bytesFingerprint,
  DEFAULT_CONCURRENCY, parseNetworkArgs, isMain,
} from './seo-network.mjs'

export async function auditProduction({
  dist, expected = readBuildExpectations(dist), fetchImpl = globalThis.fetch,
  timeoutMs, concurrency = DEFAULT_CONCURRENCY,
  missingPath = `/__trimugo-seo-audit-missing-${randomUUID()}/`,
} = {}) {
  if (!missingPath.startsWith('/__trimugo-seo-audit-missing-')) throw new Error('Missing-page probe must use the reserved audit path prefix.')
  const network = { fetchImpl, timeoutMs }
  const report = {
    checkedAt: new Date().toISOString(), origin: ORIGIN,
    scope: 'Public HTTP responses; this does not establish search-engine indexing.',
    localBuild: { directory: expected.dist, urls: expected.urls },
    errors: [], warnings: [], buildDifferences: [], pages: [], assets: [], redirects: [],
  }
  const inspectResource = async (url, inspect, options = {}) => {
    try {
      const response = await requestResource(url, { ...network, ...options })
      return { ...responseSummary(response), ...inspect(response) }
    } catch (error) {
      return { requestedUrl: url, errors: [error.message] }
    }
  }
  const [sitemap, robots] = await Promise.all([
    inspectResource(`${ORIGIN}/sitemap.xml`, (response) => {
      const errors = assertResponse(response, `${ORIGIN}/sitemap.xml`, ['application/xml', 'text/xml'])
      let urls = []
      try { urls = parseSitemap(response.text) } catch (error) { errors.push(error.message) }
      if (urls.length > 10_000) {
        errors.push('Live sitemap exceeds this bounded audit limit of 10,000 URLs.')
        urls = []
      }
      return { errors, urls }
    }),
    inspectResource(`${ORIGIN}/robots.txt`, (response) => ({
      errors: assertResponse(response, `${ORIGIN}/robots.txt`, ['text/plain']), text: response.text,
    })),
  ])
  report.sitemap = sitemap
  report.robots = { ...robots }
  delete report.robots.text
  const liveUrls = sitemap.urls || []
  const urls = [...new Set([...liveUrls, ...expected.urls])]
  if (robots.text !== undefined) {
    report.robots.errors.push(...inspectRobots(robots.text, [...urls, ...expected.assets.keys()]).errors)
  }
  for (const url of expected.urls) if (!liveUrls.includes(url)) report.buildDifferences.push(`Intended URL absent from live sitemap: ${url}`)
  for (const url of liveUrls) if (!expected.pages.has(url)) report.buildDifferences.push(`Live sitemap URL absent from intended build: ${url}`)

  report.pages = await mapConcurrent(urls, concurrency, (url) => inspectResource(url, (response) => {
    const page = inspectPage(response.text, url)
    const fingerprint = documentFingerprint(response.text)
    return {
      errors: [...assertResponse(response, url, ['text/html'], { checkRobots: true }), ...page.errors],
      title: page.title, canonical: page.canonical, fingerprint,
      matchesBuild: expected.pages.has(url) ? fingerprint === expected.pages.get(url).fingerprint : null,
    }
  }))
  const homepage = report.pages.find((page) => page.requestedUrl === `${ORIGIN}/`)
  for (const page of report.pages) {
    if (page.requestedUrl !== `${ORIGIN}/` && page.fingerprint && page.fingerprint === homepage?.fingerprint) {
      page.errors.push('Static route serves the homepage document (fallback routing).')
    }
    if (page.matchesBuild === false) report.buildDifferences.push(`Live page differs from intended build: ${page.requestedUrl}`)
  }
  report.assets = await mapConcurrent([...expected.assets], concurrency, ([url, asset]) => inspectResource(url, (response) => {
    const errors = assertResponse(response, url, assetContentTypes(asset.name))
    if (REQUIRED_ASSETS.includes(asset.name)) errors.push(...inspectAsset(asset.name, response.bytes).errors)
    if (!response.bytes.length) errors.push('Empty asset response.')
    const matchesBuild = bytesFingerprint(response.bytes) === asset.fingerprint
    return { errors, matchesBuild }
  }))
  for (const asset of report.assets) if (asset.matchesBuild === false) report.buildDifferences.push(`Live asset differs from intended build: ${asset.requestedUrl}`)

  report.missingPage = await inspectResource(`${ORIGIN}${missingPath}`, (response) => {
    const errors = []
    if (![404, 410].includes(response.status)) {
      const isHomepage = documentFingerprint(response.text) === homepage?.fingerprint
      errors.push(`Missing URL returned HTTP ${response.status}${isHomepage ? ' with the homepage document' : ''}; expected 404 or 410 (possible soft 404).`)
    }
    if (response.redirects.length) errors.push('Missing URL redirects instead of returning its own 404 or 410 response.')
    return { errors }
  })
  const originVariants = ['https://trimugo.in/', 'http://trimugo.in/', 'http://www.trimugo.in/']
  report.redirects = await mapConcurrent(originVariants, concurrency, (url) => inspectResource(url, (response) => {
    const errors = assertResponse(response, `${ORIGIN}/`, ['text/html'], { checkRobots: true })
    if (!response.redirects.length) errors.push('Alternate origin does not redirect to the canonical HTTPS www origin.')
    if (response.redirects.some((redirect) => ![301, 308].includes(redirect.status))) errors.push('Canonical origin redirect is temporary; expected 301 or 308.')
    return { errors }
  }, { allowedOrigins: [ORIGIN, 'https://trimugo.in', 'http://trimugo.in', 'http://www.trimugo.in'] }))
  for (const observation of [report.sitemap, report.robots, ...report.pages, ...report.assets, report.missingPage, ...report.redirects]) {
    for (const error of observation.errors) report.errors.push(`${observation.requestedUrl}: ${error}`)
  }
  report.ok = report.errors.length === 0
  report.matchesBuild = report.ok && report.buildDifferences.length === 0
  return report
}

export function printAudit(report, { json = false } = {}) {
  if (json) return console.log(JSON.stringify(report, null, 2))
  console.log(`Production SEO audit: ${report.origin} (${report.checkedAt})`)
  console.log(report.scope)
  for (const observation of [report.sitemap, report.robots, ...report.pages, ...report.assets, report.missingPage, ...report.redirects]) {
    console.log(`${observation.errors.length ? 'FAIL' : 'PASS'} ${observation.status ?? 'network-error'} ${observation.requestedUrl} ${observation.contentType || ''}`)
    for (const redirect of observation.redirects || []) console.log(`  ${redirect.status} -> ${redirect.location}`)
    for (const error of observation.errors) console.log(`  ${error}`)
  }
  console.log(`\nLive findings: ${report.errors.length} blocking issue(s).`)
  console.log(`Intended-build comparison: ${report.buildDifferences.length} difference(s) against ${report.localBuild.directory}.`)
  for (const difference of report.buildDifferences) console.log(`  ${difference}`)
}

if (isMain(import.meta.url)) {
  try {
    const options = parseNetworkArgs(process.argv.slice(2))
    const report = await auditProduction(options)
    printAudit(report, options)
    process.exitCode = report.ok ? 0 : 1
  } catch (error) {
    console.error(`SEO audit failed: ${error.message}`)
    process.exitCode = 1
  }
}
