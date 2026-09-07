import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { projects } from '../src/data/content.js'
import { checkBuild } from './check-seo.mjs'
import { ORIGIN, ORGANIZATION_ID, REQUIRED_ASSETS, REQUIRED_LINKS, inspectAsset, inspectPage, inspectRobots, parseSitemap } from './seo-validation.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const slug = (name) => name.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const projectPaths = projects.map((project) => `/work/${slug(project.name)}/`)
const paths = ['/', ...REQUIRED_LINKS, ...projectPaths]
const sitemap = (urls) => `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url}</loc></url>`).join('')}</urlset>`
const business = { '@type': 'ProfessionalService', '@id': ORGANIZATION_ID, name: 'Trimugo', url: `${ORIGIN}/`, email: 'murthy@trimugo.in', founder: { '@type': 'Person', name: 'Malisetti Obulamurthy' } }
const website = { '@type': 'WebSite', name: 'Trimugo', url: `${ORIGIN}/`, publisher: { '@id': ORGANIZATION_ID } }
const identity = { '@type': 'ProfessionalService', '@id': ORGANIZATION_ID, name: 'Trimugo' }
const crumbs = (pathname) => ({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Trimugo', item: `${ORIGIN}/` }, { '@type': 'ListItem', position: 2, name: pathname, item: `${ORIGIN}${pathname}` }] })

function pageFixture(pathname = '/', data) {
  const url = `${ORIGIN}${pathname}`
  const title = `Trimugo ${pathname === '/' ? 'product engineering' : pathname}`
  const h1 = pathname === '/' ? 'Trimugo product engineering' : pathname
  let schemas
  if (pathname === '/') schemas = [business, website]
  else if (pathname === '/about/') schemas = [crumbs(pathname), business, { '@type': 'AboutPage', mainEntity: { '@id': ORGANIZATION_ID } }]
  else if (pathname === '/work/') schemas = [crumbs(pathname), { '@type': 'CollectionPage', hasPart: projectPaths.map((entry) => ({ '@type': 'CreativeWork', url: `${ORIGIN}${entry}` })) }]
  else if (pathname.startsWith('/work/')) schemas = [crumbs(pathname), { '@type': 'CreativeWork', name: h1, creator: identity }]
  else schemas = [crumbs(pathname), { '@type': 'Service', name: title, provider: identity }]
  return `<!doctype html><html><head><title>${title}</title>
<meta content="Engineering description for ${pathname}" name="description">
<link href="${url}" rel="canonical"><meta name="robots" content="index, follow">
<meta property="og:site_name" content="Trimugo"><meta property="og:url" content="${url}">
<meta property="og:title" content="${title}"><meta name="twitter:title" content="${title}">
<meta property="og:image" content="${ORIGIN}/og-image.png"><meta name="twitter:image" content="${ORIGIN}/og-image.png">
<script data-schema="identity" type="application/ld+json">${JSON.stringify(data ?? { '@context': 'https://schema.org', '@graph': schemas })}</script>
</head><body><h1>${h1}</h1><p>Trimugo builds web and mobile applications, workflow automation and system integrations.</p>
${REQUIRED_LINKS.map((href) => `<a href="${href}">${href}</a>`).join('')}
</body></html>`
}

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'trimugo-seo-test-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  for (const pathname of paths) {
    const pageDir = path.join(dir, pathname)
    fs.mkdirSync(pageDir, { recursive: true })
    fs.writeFileSync(path.join(pageDir, 'index.html'), pageFixture(pathname))
  }
  fs.writeFileSync(path.join(dir, 'sitemap.xml'), sitemap(paths.map((pathname) => `${ORIGIN}${pathname}`)))
  fs.writeFileSync(path.join(dir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`)
  for (const asset of REQUIRED_ASSETS) fs.copyFileSync(path.join(root, 'public', asset), path.join(dir, asset))
  return dir
}

function edit(dir, name, transform) {
  const target = path.join(dir, name)
  fs.writeFileSync(target, transform(fs.readFileSync(target, 'utf8')))
}

const hasError = (errors, pattern) => assert.ok(errors.some((error) => pattern.test(error)), `Expected ${pattern} in ${JSON.stringify(errors)}`)

test('valid temporary build covers all 12 routes, JSON-LD graphs and preserved assets without a word-count floor', (t) => {
  const result = checkBuild(fixture(t))
  assert.deepEqual(result.errors, [])
  assert.equal(result.pages.length, 12)
  assert.ok(result.pages.every((page) => page.words < 150))
})

test('missing homepage identity schemas fail for the intended reason', (t) => {
  const dir = fixture(t)
  fs.writeFileSync(path.join(dir, 'index.html'), pageFixture('/', { '@context': 'https://schema.org', '@graph': [] }))
  const errors = checkBuild(dir).errors
  hasError(errors, /required WebSite structured data is missing/)
  hasError(errors, /required complete Trimugo business identity is missing/)
})

test('JSON-LD arrays and @type arrays work, while wrong names, identifiers and publishers fail', () => {
  assert.deepEqual(inspectPage(pageFixture('/', [business, website]), `${ORIGIN}/`).errors, [])
  assert.deepEqual(inspectPage(pageFixture('/', [{ ...business, '@type': ['Organization', 'ProfessionalService'] }, website]), `${ORIGIN}/`).errors, [])
  const errors = inspectPage(pageFixture('/', [{ ...business, name: 'Wrong brand', '@id': `${ORIGIN}/wrong` }, { ...website, publisher: { '@id': `${ORIGIN}/wrong` } }]), `${ORIGIN}/`).errors
  hasError(errors, /business identity name must be Trimugo/)
  hasError(errors, /business identity @id/)
  hasError(errors, /WebSite publisher/)
})

test('exact canonical comparison rejects another page, missing trailing slash and origin-prefix spoof', (t) => {
  const dir = fixture(t)
  for (const wrong of [`${ORIGIN}/work/`, ORIGIN, `${ORIGIN}.example.com/`]) {
    fs.writeFileSync(path.join(dir, 'index.html'), pageFixture().replace(`href="${ORIGIN}/" rel="canonical"`, `href="${wrong}" rel="canonical"`))
    hasError(checkBuild(dir).errors, /canonical must be exactly https:\/\/www\.trimugo\.in\//)
  }
})

test('malformed expected URL and malformed schema properties return diagnostics without crashing', () => {
  hasError(inspectPage(pageFixture(), 'not a url').errors, /expected URL: invalid URL/)
  const malformedCrumbs = { '@type': 'BreadcrumbList', itemListElement: {} }
  hasError(inspectPage(pageFixture('/about/', [business, malformedCrumbs]), `${ORIGIN}/about/`).errors, /BreadcrumbList must end/)
  hasError(inspectPage(pageFixture().replace('"@graph":', '"@graph" '), `${ORIGIN}/`).errors, /JSON-LD does not parse/)
})

test('page-specific schemas cannot be replaced by homepage markup', () => {
  const errors = inspectPage(pageFixture('/', [business, website]), `${ORIGIN}/work/lumo-rentals/`).errors
  hasError(errors, /canonical must be exactly/)
  hasError(errors, /project requires CreativeWork/)
  hasError(inspectPage(pageFixture('/about/', [business, website]), `${ORIGIN}/about/`).errors, /AboutPage must reference/)
})

test('duplicate sitemap URLs fail even when the total entry count is unchanged', (t) => {
  const dir = fixture(t)
  edit(dir, 'sitemap.xml', (xml) => xml.replace(`${ORIGIN}/about/`, `${ORIGIN}/`))
  hasError(checkBuild(dir).errors, /sitemap contains duplicate URLs/)
})

test('sitemap rejects empty, malformed, foreign, fragmented and noncanonical URLs', () => {
  for (const xml of ['', '<html>Not a sitemap</html>', '<urlset/>', sitemap([]), sitemap([`${ORIGIN}/`]).replace('</urlset>', ''), sitemap([`${ORIGIN}/`]).replace('<loc>', '<loc><nested>')]) {
    assert.throws(() => parseSitemap(xml), /sitemap/)
  }
  for (const url of ['not-a-url', 'https://example.com/', 'https://trimugo.in/', `${ORIGIN}/#contact`, `${ORIGIN}/work/#`, `${ORIGIN}/?q=test`, `${ORIGIN}/work/../about/`]) {
    assert.throws(() => parseSitemap(sitemap([url])), /URL/)
  }
  assert.deepEqual(parseSitemap(sitemap([`${ORIGIN}/`, `${ORIGIN}/about/`])), [`${ORIGIN}/`, `${ORIGIN}/about/`])
})

test('sitemap coverage and build-date lastmod regressions fail', (t) => {
  const dir = fixture(t)
  edit(dir, 'sitemap.xml', (xml) => xml.replace(`<url><loc>${ORIGIN}/about/</loc></url>`, '').replace('</loc>', '</loc><lastmod>2026-09-08</lastmod>'))
  const errors = checkBuild(dir).errors
  hasError(errors, /missing built page .*\/about\//)
  hasError(errors, /lastmod requires a trustworthy/)
})

test('missing required assets and required files produce actionable errors', (t) => {
  const dir = fixture(t)
  fs.unlinkSync(path.join(dir, 'og-image.png'))
  fs.unlinkSync(path.join(dir, 'robots.txt'))
  fs.unlinkSync(path.join(dir, 'about', 'index.html'))
  const errors = checkBuild(dir).errors
  hasError(errors, /og-image\.png: required file cannot be read/)
  hasError(errors, /robots\.txt: required file cannot be read/)
  hasError(errors, /\/about\/: expected generated page is missing/)
  hasError(errors, /URL has no built canonical page: .*\/about\//)
})

test('empty required HTML returns actionable errors without terminating the audit', (t) => {
  const dir = fixture(t)
  fs.writeFileSync(path.join(dir, 'about', 'index.html'), '')
  hasError(checkBuild(dir).errors, /\/about\/: HTML is empty/)
})

test('asset validation rejects HTML fallback, incorrect verification keys and broken manifest', () => {
  for (const asset of ['favicon.ico', 'favicon.svg', 'og-image.png']) hasError(inspectAsset(asset, Buffer.from('<html>fallback</html>')).errors, /expected/)
  hasError(inspectAsset(REQUIRED_ASSETS[0], Buffer.from('wrong token')).errors, /Google verification/)
  hasError(inspectAsset(REQUIRED_ASSETS[1], Buffer.from('wrong key')).errors, /IndexNow key/)
  hasError(inspectAsset('manifest.webmanifest', Buffer.from('{')).errors, /manifest JSON does not parse/)
})

test('robots allow precedence and crawler-specific blocks are checked', () => {
  const base = `Sitemap: ${ORIGIN}/sitemap.xml\n`
  assert.deepEqual(inspectRobots(`${base}User-agent: *\nDisallow: /\nAllow: /about/\n`, [`${ORIGIN}/about/`]).errors, [])
  hasError(inspectRobots(`${base}User-agent: *\nAllow: /\nUser-agent: Googlebot\nDisallow: /about/\n`, [`${ORIGIN}/about/`]).errors, /blocks googlebot from \/about\//)
  hasError(inspectRobots(`${base}User-agent: *\nDisallow: /*.png$\n`, [`${ORIGIN}/og-image.png`]).errors, /blocks .*og-image\.png/)
  assert.deepEqual(inspectRobots(`${base}User-agent: *\nDisallow: /work/$\n`, [`${ORIGIN}/work/lumo-rentals/`]).errors, [])
  hasError(inspectRobots('User-agent: *\nAllow: /', [`${ORIGIN}/`]).errors, /must reference/)
})

test('meta robots blocks, refresh redirects and missing About links fail', () => {
  hasError(inspectPage(pageFixture().replace('content="index, follow"', 'content="noindex, nofollow"'), `${ORIGIN}/`).errors, /blocks indexing/)
  hasError(inspectPage(pageFixture().replace('</head>', '<meta name="bingbot" content="none"><meta http-equiv="refresh" content="0;url=/about/"></head>'), `${ORIGIN}/`).errors, /meta refresh/)
  hasError(inspectPage(pageFixture().replace('<a href="/about/">/about/</a>', ''), `${ORIGIN}/`).errors, /missing normal HTML link to \/about\//)
})
