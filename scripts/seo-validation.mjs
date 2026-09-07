// Pure checks shared by the built-output validator and production preflight.
export const ORIGIN = 'https://www.trimugo.in'
export const ORGANIZATION_ID = `${ORIGIN}/#organization`
export const REQUIRED_LINKS = [
  '/about/', '/hire-freelance-react-developer/', '/contract-developer-for-hire/',
  '/ai-agents-document-automation/', '/work/',
]
export const REQUIRED_ASSETS = [
  // These existing public ownership filenames are intentionally preserved.
  // If the owner rotates either token, update this list and public/ together.
  'googleac93e0ce4e6876ca.html', 'googlec627f886e2e14cd2.html',
  '4ac3802486e126cb72a9f2764942b1b5.txt', 'BingSiteAuth.xml',
  'favicon.svg', 'favicon.ico', 'favicon-16.png', 'favicon-32.png',
  'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'og-image.png',
  'manifest.webmanifest',
]

const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
const decode = (value) => value.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (whole, code) => {
  if (!code.startsWith('#')) return entities[code] ?? whole
  const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1))
  return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff)
    ? String.fromCodePoint(point) : whole
})

export const textContent = (html) => decode(html
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
  .replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()

export function attributes(tag) {
  const result = {}
  for (const match of tag.matchAll(/([^\s=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    result[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4])
  }
  return result
}

function canonicalUrl(raw) {
  let parsed
  try { parsed = new URL(raw) } catch { throw new Error(`invalid URL: ${raw}`) }
  if (parsed.origin !== ORIGIN || parsed.username || parsed.password) throw new Error(`URL must use ${ORIGIN}: ${raw}`)
  if (parsed.hash || raw.includes('#')) throw new Error(`fragment URL is not allowed: ${raw}`)
  if (parsed.search || raw.includes('?')) throw new Error(`query URL is not canonical: ${raw}`)
  if (parsed.href !== raw || /\s/.test(raw)) throw new Error(`URL is not in canonical form: ${raw}`)
  return parsed
}

// Read the sitemap URL-set format emitted by this project. Validate the XML
// structure before collecting loc elements; partial regex matches must not
// turn a truncated or unrelated document into an accepted submission list.
export function parseSitemap(xml) {
  if (typeof xml !== 'string' || !xml.trim()) throw new Error('sitemap is empty')
  const source = xml.replace(/^\uFEFF/, '').replace(/^\s*<\?xml\s[^?]*\?>/, '').replace(/<!--[\s\S]*?-->/g, '')
  const root = { name: '#document', children: [], text: '' }
  const stack = [root]
  const tokens = source.match(/<[^>]*>|[^<]+/g) ?? []
  if (tokens.join('') !== source) throw new Error('sitemap XML is malformed')
  for (const token of tokens) {
    if (!token.startsWith('<')) {
      if (/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);)/i.test(token)) throw new Error('sitemap contains an invalid XML entity')
      stack.at(-1).text += decode(token)
      continue
    }
    const close = token.match(/^<\/([\w:-]+)\s*>$/)
    if (close) {
      if (stack.length === 1 || stack.pop().name !== close[1]) throw new Error('sitemap XML has mismatched closing tags')
      continue
    }
    const open = token.match(/^<([\w:-]+)((?:\s+[\w:-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>$/)
    if (!open) throw new Error('sitemap XML contains malformed or unsupported markup')
    const node = { name: open[1], attrs: attributes(token), children: [], text: '' }
    stack.at(-1).children.push(node)
    if (!open[3]) stack.push(node)
  }
  if (stack.length !== 1 || root.children.length !== 1 || root.text.trim()) throw new Error('sitemap XML must contain one complete urlset')
  const set = root.children[0]
  if (set.name !== 'urlset' || set.attrs.xmlns !== 'http://www.sitemaps.org/schemas/sitemap/0.9' || set.text.trim()) {
    throw new Error('sitemap must have a urlset with the sitemap XML namespace')
  }
  const urls = set.children.map((entry) => {
    if (entry.name !== 'url' || entry.text.trim()) throw new Error('sitemap urlset contains an invalid entry')
    const names = entry.children.map((node) => node.name)
    if (new Set(names).size !== names.length || entry.children.some((node) => !['loc', 'lastmod', 'changefreq', 'priority'].includes(node.name) || node.children.length)) {
      throw new Error('sitemap url contains duplicate or unsupported fields')
    }
    const locations = entry.children.filter((node) => node.name === 'loc')
    if (locations.length !== 1 || locations[0].children.length) throw new Error('each sitemap url must have exactly one text loc')
    const value = locations[0].text.trim()
    if (!value) throw new Error('sitemap contains an empty loc')
    canonicalUrl(value)
    return value
  })
  if (!urls.length) throw new Error('sitemap contains no URLs')
  if (new Set(urls).size !== urls.length) throw new Error('sitemap contains duplicate URLs')
  return urls
}

const types = (node) => Array.isArray(node?.['@type']) ? node['@type'] : [node?.['@type']]
const hasType = (node, type) => types(node).includes(type)
const businessType = (node) => ['Organization', 'ProfessionalService'].some((type) => hasType(node, type))
const homeUrl = (url) => url === ORIGIN || url === `${ORIGIN}/`
const hasIdentity = (node) => node?.['@id'] === ORGANIZATION_ID
const flattenSchema = (value, output) => {
  if (Array.isArray(value)) value.forEach((node) => flattenSchema(node, output))
  else if (value && typeof value === 'object') {
    output.push(value)
    Object.values(value).forEach((node) => flattenSchema(node, output))
  }
}

export function inspectPage(html, expectedUrl) {
  const errors = []
  const check = (condition, message) => { if (!condition) errors.push(message) }
  let pathname = '/'
  try { pathname = canonicalUrl(expectedUrl).pathname } catch (error) { errors.push(`expected URL: ${error.message}`) }
  if (typeof html !== 'string' || !html.trim()) return { errors: [...errors, 'HTML is empty'], title: '', canonical: '', schemas: [], description: '', h1: '', hrefs: [], words: 0 }
  const markup = html.replace(/<!--[\s\S]*?-->/g, '')
  const tags = (name) => [...markup.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(([tag]) => attributes(tag))
  const meta = tags('meta')
  const metaValues = (name) => meta.filter((tag) => (tag.name ?? tag.property)?.toLowerCase() === name).map((tag) => tag.content ?? '')
  const titles = [...markup.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/gi)].map((match) => textContent(match[1]))
  const title = titles[0] ?? ''
  const description = metaValues('description')[0] ?? ''
  const links = tags('link')
  const canonicals = links.filter((tag) => tag.rel?.toLowerCase().split(/\s+/).includes('canonical'))
  const canonical = canonicals[0]?.href ?? ''
  const h1s = [...markup.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/gi)].map((match) => textContent(match[1]))
  check(titles.length === 1 && !!title, 'expected one nonempty title')
  check(/\bTrimugo\b/.test(title), 'title must include Trimugo')
  check(metaValues('description').length === 1 && !!description.trim(), 'expected one nonempty meta description')
  check(canonicals.length === 1 && canonical === expectedUrl, `canonical must be exactly ${expectedUrl} (found ${canonical || 'none'})`)
  check(h1s.length === 1 && !!h1s[0], `expected one meaningful h1 (found ${h1s.length})`)
  for (const tag of meta) {
    if (['robots', 'googlebot', 'bingbot'].includes(tag.name?.toLowerCase())) {
      check(!/\b(noindex|nofollow|none)\b/i.test(tag.content ?? ''), `meta ${tag.name} blocks indexing or link discovery`)
    }
    check(tag['http-equiv']?.toLowerCase() !== 'refresh', 'meta refresh redirects are not allowed on canonical pages')
  }
  check(metaValues('og:url').length === 1 && metaValues('og:url')[0] === expectedUrl, `og:url must be exactly ${expectedUrl}`)
  check(metaValues('og:site_name').length === 1 && metaValues('og:site_name')[0] === 'Trimugo', 'og:site_name must be Trimugo')
  for (const field of ['og:title', 'twitter:title']) check(metaValues(field)[0] === title, `${field} must match the title`)
  for (const field of ['og:image', 'twitter:image']) check(metaValues(field)[0] === `${ORIGIN}/og-image.png`, `${field} must reference the Trimugo social image`)

  const schemas = []
  for (const match of markup.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (attributes(match[1]).type?.toLowerCase() !== 'application/ld+json') continue
    try {
      const data = JSON.parse(match[2])
      check(data !== null && typeof data === 'object', 'JSON-LD must contain an object or array')
      flattenSchema(data, schemas)
    } catch (error) { errors.push(`JSON-LD does not parse: ${error.message}`) }
  }
  check(schemas.some((node) => node['@type']), 'required structured data is missing')
  for (const node of schemas.filter(businessType)) {
    check(hasIdentity(node), `business identity @id must be ${ORGANIZATION_ID}`)
    check(node.name === 'Trimugo', 'business identity name must be Trimugo')
    if (node.url !== undefined) check(homeUrl(node.url), 'business identity URL must be the Trimugo homepage')
  }
  const requireBusiness = () => check(schemas.some((node) => businessType(node) && hasIdentity(node) && node.name === 'Trimugo' && homeUrl(node.url)), 'required complete Trimugo business identity is missing')
  if (pathname === '/') {
    check(/\bTrimugo\b/.test(h1s[0] ?? ''), 'homepage h1 must include Trimugo')
    requireBusiness()
    const sites = schemas.filter((node) => hasType(node, 'WebSite'))
    check(sites.length > 0, 'required WebSite structured data is missing')
    for (const site of sites) {
      check(site.name === 'Trimugo' && homeUrl(site.url), 'WebSite name and URL must identify Trimugo')
      check(hasIdentity(site.publisher), 'WebSite publisher must reference the Trimugo business identity')
      if (site['@id'] !== undefined) check(site['@id'] === `${ORIGIN}/#website`, `WebSite @id must be ${ORIGIN}/#website`)
    }
  } else {
    const crumbs = schemas.filter((node) => hasType(node, 'BreadcrumbList'))
    check(crumbs.some((node) => Array.isArray(node.itemListElement) && node.itemListElement.at(-1)?.item === expectedUrl), 'BreadcrumbList must end at the canonical page URL')
    if (pathname === '/about/') {
      requireBusiness()
      check(schemas.some((node) => hasType(node, 'AboutPage') && hasIdentity(node.mainEntity)), 'AboutPage must reference the Trimugo business identity')
    } else if (pathname === '/work/') {
      check(schemas.some((node) => hasType(node, 'CollectionPage') && Array.isArray(node.hasPart) && node.hasPart.length), 'work index requires CollectionPage structured data with projects')
    } else if (pathname.startsWith('/work/')) {
      check(schemas.some((node) => hasType(node, 'CreativeWork') && node.name === h1s[0] && hasIdentity(node.creator)), 'project requires CreativeWork matching its heading and Trimugo creator')
    } else if (REQUIRED_LINKS.includes(pathname)) {
      check(schemas.some((node) => hasType(node, 'Service') && hasIdentity(node.provider)), 'service page requires Service structured data with Trimugo provider')
    }
  }
  const hrefs = tags('a').map((tag) => tag.href).filter(Boolean)
  for (const href of REQUIRED_LINKS) {
    check(hrefs.some((value) => { try { return new URL(value, expectedUrl).href === `${ORIGIN}${href}` } catch { return false } }), `missing normal HTML link to ${href}`)
  }
  return { errors, title, canonical, schemas, description, h1: h1s[0] ?? '', hrefs, words: textContent(markup).split(/\s+/).filter(Boolean).length }
}

export function inspectRobots(text, urls) {
  const errors = []
  if (typeof text !== 'string' || !text.trim() || /<html\b/i.test(text)) return { errors: ['robots.txt is empty or contains HTML'] }
  const groups = []
  const sitemaps = []
  let group
  for (const line of text.split(/\r?\n/)) {
    const directive = line.replace(/#.*/, '').trim().match(/^([\w-]+)\s*:\s*(.*)$/)
    if (!directive) continue
    const [, rawName, value] = directive
    const name = rawName.toLowerCase()
    if (name === 'sitemap') { sitemaps.push(value); continue }
    if (name === 'user-agent') {
      if (!group || group.rules.length) { group = { agents: [], rules: [] }; groups.push(group) }
      group.agents.push(value.toLowerCase())
    } else if (group && ['allow', 'disallow'].includes(name)) group.rules.push({ name, value })
  }
  if (!sitemaps.includes(`${ORIGIN}/sitemap.xml`)) errors.push(`robots.txt must reference ${ORIGIN}/sitemap.xml`)
  if (!groups.length) errors.push('robots.txt has no user-agent groups')
  for (const agent of ['*', 'googlebot', 'bingbot']) {
    const exact = groups.filter((entry) => entry.agents.includes(agent))
    const selected = exact.length ? exact : groups.filter((entry) => entry.agents.includes('*'))
    for (const url of urls) {
      let pathname
      try { pathname = new URL(url).pathname } catch { errors.push(`robots check received invalid URL: ${url}`); continue }
      const matching = selected.flatMap((entry) => entry.rules).filter((rule) => {
        if (!rule.value) return false
        const expression = rule.value.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$')
        return new RegExp(`^${expression}`).test(pathname)
      }).sort((a, b) => b.value.replace(/\*/g, '').length - a.value.replace(/\*/g, '').length || (a.name === 'allow' ? -1 : 1))
      if (matching[0]?.name === 'disallow') errors.push(`robots.txt blocks ${agent} from ${pathname}`)
    }
  }
  return { errors }
}

export function inspectAsset(name, bytes) {
  const errors = []
  const fail = (message) => errors.push(`${name}: ${message}`)
  const buffer = Buffer.from(bytes ?? [])
  if (!buffer.length) return { errors: [`${name}: file is empty`] }
  const text = buffer.toString('utf8').trim()
  if (/^google[\da-f]+\.html$/.test(name)) {
    if (text !== `google-site-verification: ${name}`) fail('Google verification content does not match its filename')
  } else if (name === 'BingSiteAuth.xml') {
    if (!/^(?:<\?xml\s+version="1\.0"\?>\s*)?<users>\s*(?:<user>[\da-f]{32}<\/user>\s*)+<\/users>$/i.test(text)) fail('expected the Bing ownership XML file with a valid user token')
  } else if (/^[\da-f]{32}\.txt$/.test(name)) {
    if (text !== name.slice(0, -4)) fail('IndexNow key content does not match its filename')
  } else if (name.endsWith('.png')) {
    const dimensions = { 'favicon-16.png': [16, 16], 'favicon-32.png': [32, 32], 'apple-touch-icon.png': [180, 180], 'icon-192.png': [192, 192], 'icon-512.png': [512, 512], 'og-image.png': [1200, 630] }
    if (buffer.length < 45 || buffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || buffer.toString('ascii', 12, 16) !== 'IHDR' || buffer.toString('ascii', buffer.length - 8, buffer.length - 4) !== 'IEND') fail('expected a complete PNG image')
    else if (dimensions[name] && (buffer.readUInt32BE(16) !== dimensions[name][0] || buffer.readUInt32BE(20) !== dimensions[name][1])) fail(`expected ${dimensions[name].join('×')} pixels`)
  } else if (name.endsWith('.ico')) {
    if (buffer.length < 22 || buffer.readUInt16LE(0) !== 0 || buffer.readUInt16LE(2) !== 1) fail('expected an ICO image')
    else {
      const count = buffer.readUInt16LE(4)
      if (!count || 6 + count * 16 > buffer.length) fail('invalid ICO directory')
      else {
        let has48 = false
        for (let i = 0; i < count; i++) {
          const offset = 6 + i * 16
          if (buffer[offset] === 48 && buffer[offset + 1] === 48) has48 = true
          const size = buffer.readUInt32LE(offset + 8)
          const start = buffer.readUInt32LE(offset + 12)
          if (!size || start < 6 + count * 16 || start + size > buffer.length) fail('truncated ICO image data')
        }
        if (!has48) fail('missing the advertised 48×48 icon')
      }
    }
  } else if (name.endsWith('.svg')) {
    if (!/<svg\b[^>]*xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["'][^>]*>/i.test(text) || !/<\/svg\s*>\s*$/i.test(text)) fail('expected an SVG image with its XML namespace')
  } else if (name === 'manifest.webmanifest') {
    try {
      const manifest = JSON.parse(text)
      if (manifest.name !== 'Trimugo' || manifest.short_name !== 'Trimugo' || manifest.start_url !== '/') fail('manifest must identify Trimugo and open the homepage')
      for (const icon of ['/favicon.svg', '/icon-192.png', '/icon-512.png']) {
        if (!Array.isArray(manifest.icons) || !manifest.icons.some((entry) => entry.src === icon)) fail(`manifest must include ${icon}`)
      }
    } catch (error) { fail(`manifest JSON does not parse: ${error.message}`) }
  }
  return { errors }
}
