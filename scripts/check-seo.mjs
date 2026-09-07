// Validate local build output. Passing this check does not establish indexing.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { projects } from '../src/data/content.js'
import { ORIGIN, ORGANIZATION_ID, REQUIRED_ASSETS, REQUIRED_LINKS, attributes, inspectAsset, inspectPage, inspectRobots, parseSitemap } from './seo-validation.mjs'

const slug = (name) => name.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const expectedPaths = ['/', ...REQUIRED_LINKS, ...projects.map((project) => `/work/${slug(project.name)}/`)]

export function checkBuild(out = path.join(process.cwd(), 'dist')) {
  const errors = []
  const pages = []
  const fail = (message) => errors.push(message)
  const read = (name, encoding = 'utf8') => {
    try { return fs.readFileSync(path.join(out, name), encoding) }
    catch (error) { fail(`${name}: required file cannot be read (${error.code ?? error.message})`); return null }
  }
  if (!fs.existsSync(out)) return { errors: ['dist/ missing — run npm run build first'], pages }
  const htmlFiles = []
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && !['assets', 'models', 'draco'].includes(entry.name)) walk(path.join(dir, entry.name))
      else if (entry.isFile() && entry.name === 'index.html') htmlFiles.push(path.join(dir, entry.name))
    }
  }
  try { walk(out) } catch (error) { fail(`cannot inspect build directory: ${error.message}`) }
  const titleOwners = new Map()
  const descriptionOwners = new Map()
  const localReferences = new Set(REQUIRED_ASSETS)
  for (const file of htmlFiles) {
    const relative = path.relative(out, file).split(path.sep).join('/')
    const pathname = `/${relative.replace(/index\.html$/, '')}`
    const url = `${ORIGIN}${pathname}`
    const html = read(relative)
    if (html === null) continue
    const result = inspectPage(html, url)
    errors.push(...result.errors.map((error) => `${pathname}: ${error}`))
    pages.push({ pathname, url, ...result })
    for (const [value, owners, label] of [[result.title, titleOwners, 'title'], [result.description, descriptionOwners, 'description']]) {
      if (value && owners.has(value)) fail(`${pathname}: duplicate ${label} also used by ${owners.get(value)}`)
      if (value) owners.set(value, pathname)
    }
    for (const href of result.hrefs) {
      let destination
      try { destination = new URL(href, url) } catch { fail(`${pathname}: invalid link ${href}`); continue }
      if (destination.origin === ORIGIN && !destination.search && !destination.hash && destination.pathname.endsWith('/')) {
        const target = path.join(out, destination.pathname, 'index.html')
        if (!fs.existsSync(target)) fail(`${pathname}: internal link ${destination.pathname} has no built page`)
      }
    }
    // Resolve assets from their declarations and the required preservation list.
    const declarations = [...html.matchAll(/<(?:link|meta)\b[^>]*>/gi)].map(([tag]) => attributes(tag))
    const references = declarations.flatMap((tag) => {
      if (/(?:^|\s)(?:icon|apple-touch-icon|manifest)(?:\s|$)/i.test(tag.rel ?? '')) return [tag.href]
      if (['og:image', 'twitter:image'].includes(tag.property ?? tag.name)) return [tag.content]
      return []
    })
    references.push(...result.schemas.flatMap((node) => [node.logo, node.image]).filter((value) => typeof value === 'string'))
    for (const reference of references) {
      try {
        const destination = new URL(reference, url)
        if (destination.origin !== ORIGIN || destination.search || destination.hash) throw new Error('must use a local production URL')
        localReferences.add(decodeURIComponent(destination.pathname).replace(/^\//, ''))
      } catch (error) { fail(`${pathname}: invalid brand asset ${reference} (${error.message})`) }
    }
  }
  for (const pathname of expectedPaths) if (!pages.some((page) => page.pathname === pathname)) fail(`${pathname}: expected generated page is missing`)

  const sitemap = read('sitemap.xml')
  let listed = []
  if (sitemap !== null) {
    try { listed = parseSitemap(sitemap) } catch (error) { fail(`sitemap.xml: ${error.message}`) }
    if (/<lastmod\b/i.test(sitemap)) fail('sitemap.xml: lastmod requires a trustworthy per-page content source; omit build dates')
  }
  for (const page of pages) if (!listed.includes(page.url)) fail(`sitemap.xml: missing built page ${page.url}`)
  for (const url of listed) if (!pages.some((page) => page.url === url)) fail(`sitemap.xml: URL has no built canonical page: ${url}`)
  const robots = read('robots.txt')
  if (robots !== null) errors.push(...inspectRobots(robots, [...listed, ...REQUIRED_ASSETS.map((name) => `${ORIGIN}/${name}`)]).errors)

  for (const name of localReferences) {
    const resolved = path.resolve(out, name)
    if (!resolved.startsWith(`${path.resolve(out)}${path.sep}`)) { fail(`brand asset path escapes the build: ${name}`); continue }
    const content = read(name, null)
    if (content !== null) errors.push(...inspectAsset(name, content).errors)
    if (name === 'manifest.webmanifest' && content !== null) {
      try {
        const manifest = JSON.parse(content.toString('utf8'))
        for (const icon of Array.isArray(manifest.icons) ? manifest.icons : []) {
          const iconUrl = new URL(icon.src, `${ORIGIN}/`)
          if (iconUrl.origin !== ORIGIN || iconUrl.hash || iconUrl.search) fail(`manifest icon must use a local production URL: ${icon.src}`)
          else localReferences.add(iconUrl.pathname.slice(1))
        }
      } catch { /* inspectAsset reports invalid JSON. */ }
    }
  }
  const business = (page) => page?.schemas.find((node) => node['@id'] === ORGANIZATION_ID && node.name && node.url)
  const homeIdentity = business(pages.find((page) => page.pathname === '/'))
  const aboutIdentity = business(pages.find((page) => page.pathname === '/about/'))
  if (homeIdentity && aboutIdentity) {
    for (const field of ['name', 'email', 'telephone']) if (homeIdentity[field] !== aboutIdentity[field]) fail(`About/home business ${field} must agree`)
    for (const field of ['addressLocality', 'addressCountry']) if (homeIdentity.address?.[field] !== aboutIdentity.address?.[field]) fail(`About/home business address ${field} must agree`)
    if (homeIdentity.founder?.name !== aboutIdentity.founder?.name) fail('About/home founder name must agree')
  }
  return { errors, pages }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = checkBuild(process.argv[2] ? path.resolve(process.argv[2]) : undefined)
  console.log(`\nChecking ${result.pages.length} built pages (word counts are diagnostic only)\n`)
  for (const page of result.pages) console.log(`  ${String(page.words).padStart(4)}w  ${page.pathname}`)
  for (const error of result.errors) console.error(`  FAIL  ${error}`)
  console.log(result.errors.length ? `\n${result.errors.length} SEO check(s) failed.\n` : `\nLocal SEO checks passed for ${result.pages.length} pages. This does not establish deployment or indexing.\n`)
  process.exitCode = result.errors.length ? 1 : 0
}
