// ─────────────────────────────────────────────────────────────────────────────
// SEO output — validation.
//
// Generated pages are the easiest thing on a site to let rot: a template change
// silently drops a canonical, two pages end up with the same title, or a page
// ships 40 words and reads to a search engine as a doorway. This checks the
// built dist/ for the failures that actually cost rankings.
//
// Run after `npm run build`.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'fs'
import path from 'path'

const out = path.join(process.cwd(), 'dist')
const ORIGIN = 'https://www.trimugo.in'

let failed = 0
const ok = (cond, msg) => {
  if (!cond) {
    failed++
    console.log(`  FAIL  ${msg}`)
  }
}

if (!fs.existsSync(out)) {
  console.error('dist/ missing — run `npm run build` first.')
  process.exit(1)
}

// Walk dist for every index.html.
const htmlFiles = []
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === 'assets' || e.name === 'models' || e.name === 'draco') continue
      walk(full)
    } else if (e.name === 'index.html') htmlFiles.push(full)
  }
}
walk(out)

const text = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const titles = new Map()
const descriptions = new Map()

console.log(`\nChecking ${htmlFiles.length} pages in dist/\n`)

for (const file of htmlFiles) {
  const rel = '/' + path.relative(out, file).replace(/index\.html$/, '')
  const html = fs.readFileSync(file, 'utf8')
  const words = text(html).split(' ').filter(Boolean).length

  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1]
  const desc = (html.match(/<meta\s+name="description"\s+content="([^"]*)"/) || [])[1]
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1]
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)]

  console.log(`  ${String(words).padStart(4)}w  ${rel}`)

  ok(title, `${rel}: has a <title>`)
  ok(title && title.length <= 70, `${rel}: title is 70 chars or under (${title?.length})`)
  ok(desc, `${rel}: has a meta description`)
  ok(desc && desc.length >= 70 && desc.length <= 320, `${rel}: description length sane (${desc?.length})`)
  ok(canonical, `${rel}: has a canonical`)
  ok(canonical?.startsWith(ORIGIN), `${rel}: canonical points at the production origin`)
  ok(h1s.length === 1, `${rel}: exactly one <h1> (found ${h1s.length})`)

  // Thin content is the single biggest risk with generated pages: a search
  // engine reads a short, templated page as a doorway and discounts the lot.
  // 250 for a page that argues something; 150 is the floor for a portfolio
  // entry, which earns its place on a real product name and a live link rather
  // than on length. A project page below that is not carrying its own weight —
  // the fix is real copy about the project, never padding.
  const floor = rel.startsWith('/work/') && rel !== '/work/' ? 150 : 250
  ok(words >= floor, `${rel}: has enough content to stand on its own (${words} words, floor ${floor})`)

  if (title) {
    ok(!titles.has(title), `${rel}: title is unique (clashes with ${titles.get(title)})`)
    titles.set(title, rel)
  }
  if (desc) {
    ok(!descriptions.has(desc), `${rel}: description is unique (clashes with ${descriptions.get(desc)})`)
    descriptions.set(desc, rel)
  }

  for (const [, block] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(block)
    } catch (e) {
      ok(false, `${rel}: JSON-LD parses (${e.message})`)
    }
  }
}

// ── The sitemap must match what was actually emitted ────────────────────────
console.log('\nsitemap')
const sitemap = fs.readFileSync(path.join(out, 'sitemap.xml'), 'utf8')
const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
ok(listed.length === htmlFiles.length, `sitemap lists every page (${listed.length} listed, ${htmlFiles.length} built)`)
for (const file of htmlFiles) {
  const rel = '/' + path.relative(out, file).replace(/index\.html$/, '')
  ok(listed.includes(`${ORIGIN}${rel}`), `sitemap includes ${rel}`)
}
ok(!sitemap.includes('#/'), 'sitemap contains no fragment URLs (Google discards them)')

// ── The homepage must link into the generated pages ─────────────────────────
// A sitemap alone is a weak discovery signal; internal links are the strong one.
console.log('\ninternal linking')
const home = fs.readFileSync(path.join(out, 'index.html'), 'utf8')
for (const p of ['/hire-freelance-react-developer/', '/contract-developer-for-hire/', '/ai-agents-document-automation/', '/work/']) {
  ok(home.includes(`href="${p}"`), `homepage links to ${p}`)
}

console.log(failed ? `\n${failed} check(s) FAILED\n` : `\nAll SEO checks clear — ${htmlFiles.length} pages.\n`)
process.exit(failed ? 1 : 0)
