// Notifications are not indexing guarantees. Google does not use IndexNow.
// Protocol and response meanings: https://www.indexnow.org/documentation
import { ORIGIN } from './seo-validation.mjs'
import { auditProduction } from './audit-seo-live.mjs'
import { requestResource, readBuildExpectations, parseNetworkArgs, isMain } from './seo-network.mjs'

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

export async function submitIndexNow({ dryRun = false, dist, fetchImpl = globalThis.fetch, timeoutMs, concurrency } = {}) {
  const expected = readBuildExpectations(dist)
  const preflight = await auditProduction({ expected, fetchImpl, timeoutMs, concurrency })
  const result = {
    mode: dryRun ? 'dry-run' : 'submission', checkedAt: preflight.checkedAt,
    endpoint: INDEXNOW_ENDPOINT, urls: expected.urls, keyLocation: expected.keyUrl,
    preflight: { ok: preflight.matchesBuild, errors: preflight.errors, buildDifferences: preflight.buildDifferences },
    attempted: false, submitted: false, ok: false, receipt: null,
  }
  if (!result.preflight.ok) {
    result.message = 'Preflight failed. No notification sent; resolve live blockers and deploy the intended build before submitting.'
    return result
  }
  if (dryRun) {
    result.ok = true
    result.message = 'Dry run passed. No POST request or indexing notification was sent.'
    return result
  }
  let response
  result.attempted = true
  try {
    response = await requestResource(INDEXNOW_ENDPOINT, {
      fetchImpl, timeoutMs, allowedOrigins: ['https://api.indexnow.org'], maxRedirects: 0,
      method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: new URL(ORIGIN).hostname, key: expected.key, keyLocation: expected.keyUrl, urlList: expected.urls }),
    })
  } catch (error) {
    result.message = `Submission attempted, but no confirmed endpoint receipt was obtained: ${error.message}. Do not assume acceptance; no automatic retry was made.`
    return result
  }
  result.submitted = true
  result.receipt = {
    receivedAt: new Date().toISOString(), status: response.status,
    body: response.text.slice(0, 2000), retryAfter: response.retryAfter || null,
  }
  if (response.status === 200) {
    result.ok = true
    result.message = 'IndexNow HTTP 200: URL notification accepted. This does not confirm crawling, indexing, or ranking.'
  } else if (response.status === 202) {
    result.ok = true
    result.message = 'IndexNow HTTP 202: notification received; key validation is pending. This does not confirm crawling, indexing, or ranking.'
  } else {
    const reasons = { 400: 'invalid request format', 403: 'key verification failed', 422: 'URL host or protocol validation failed', 429: 'rate limited' }
    result.message = `IndexNow HTTP ${response.status}: ${reasons[response.status] || 'notification not accepted'}. No automatic retry was made.`
  }
  return result
}

if (isMain(import.meta.url)) {
  try {
    const options = parseNetworkArgs(process.argv.slice(2), { submission: true })
    const result = await submitIndexNow(options)
    if (options.json) console.log(JSON.stringify(result, null, 2))
    else {
      console.log(`IndexNow ${result.mode}: ${result.urls.length} intended production URL(s)`)
      for (const url of result.urls) console.log(`  ${url}`)
      console.log(`Key location: ${result.keyLocation}`)
      console.log(`Preflight: ${result.preflight.ok ? 'passed' : 'failed'}`)
      for (const error of [...result.preflight.errors, ...result.preflight.buildDifferences]) console.log(`  ${error}`)
      if (result.receipt) console.log(`Receipt: ${JSON.stringify(result.receipt)}`)
      console.log(result.message)
    }
    process.exitCode = result.ok ? 0 : 1
  } catch (error) {
    console.error(`IndexNow preflight failed; no notification sent: ${error.message}`)
    process.exitCode = 1
  }
}
