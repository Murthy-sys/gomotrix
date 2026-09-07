// ─────────────────────────────────────────────────────────────────────────────
// IndexNow submission.
//
// Pushes every URL in the sitemap to the IndexNow endpoint, which fans out to
// Bing, Yandex, Seznam and Naver. Those engines then fetch the pages within
// hours instead of waiting to discover them by crawl — which matters here
// because nothing on the web links to trimugo.in yet, so there is no crawl path
// to discover.
//
// Google does NOT participate in IndexNow. Google discovery needs either a
// verified Search Console property (URL Inspection → Request indexing) or an
// inbound link from a site Google already crawls. No script can substitute.
//
// Requires the key file to be LIVE at https://www.trimugo.in/<key>.txt — the
// endpoint fetches it to prove you control the domain. Deploy before running.
//
//   npm run seo:submit
//
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'fs'
import path from 'path'

const ORIGIN = 'https://www.trimugo.in'
const HOST = 'www.trimugo.in'

// The key is whatever <key>.txt sits in public/ — single source of truth, so
// rotating the key is just replacing that file.
const keyFile = fs
  .readdirSync(path.join(process.cwd(), 'public'))
  .find((f) => /^[0-9a-f]{16,128}\.txt$/.test(f))

if (!keyFile) {
  console.error('No IndexNow key file found in public/. Expected <hex>.txt')
  process.exit(1)
}
const key = keyFile.replace(/\.txt$/, '')

// Read the generated sitemap rather than a hand-kept list, so this can never
// submit a URL that was not actually built.
const sitemapPath = path.join(process.cwd(), 'dist', 'sitemap.xml')
if (!fs.existsSync(sitemapPath)) {
  console.error('dist/sitemap.xml missing — run `npm run build` first.')
  process.exit(1)
}
const urlList = [...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])

// Refuse to submit if the key is not actually reachable — the endpoint returns
// 202 for almost everything, so a silent failure here is easy to miss.
const keyUrl = `${ORIGIN}/${key}.txt`
const probe = await fetch(keyUrl).catch(() => null)
if (!probe || !probe.ok) {
  console.error(`\nKey file is not live at ${keyUrl} (${probe ? probe.status : 'unreachable'}).`)
  console.error('Deploy first — IndexNow fetches this file to verify you own the domain.\n')
  process.exit(1)
}
const served = (await probe.text()).trim()
if (served !== key) {
  console.error(`\nKey file at ${keyUrl} contains "${served}", expected "${key}".\n`)
  process.exit(1)
}

console.log(`\nKey verified at ${keyUrl}`)
console.log(`Submitting ${urlList.length} URLs to IndexNow (Bing, Yandex, Seznam, Naver)...\n`)
for (const u of urlList) console.log(`  ${u}`)

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation: keyUrl, urlList }),
})

// 200 and 202 both mean accepted; 202 means "received, key validation pending".
console.log(`\nIndexNow responded ${res.status} ${res.statusText}`)
if (res.status === 200 || res.status === 202) {
  console.log('Accepted. Expect Bing to crawl within hours to a couple of days.\n')
} else {
  console.log(await res.text())
  console.log('\nNot accepted — check the key file and host above.\n')
  process.exit(1)
}
