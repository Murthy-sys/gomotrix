# Trimugo branded search discovery

Status: Approved by user on 2026-09-08
Date: 2026-09-08

## Goal

Make the official Trimugo website technically eligible and easier to discover when someone searches for `trimugo` in Google or a search engine used through Safari, Chrome, or Edge. Deliver targeted site improvements and a verifiable indexing handoff. Search engines control inclusion, ranking, snippets, and timing; appearing first or appearing immediately is not a deliverable that code can guarantee.

## Current behavior and evidence

- The project is a React/Vite website. Its configured canonical origin is `https://www.trimugo.in/`.
- Live HTTP checks returned 200 for the HTTPS www homepage and a permanent 308 redirect from the HTTPS apex homepage to www. Response headers identify Vercel. This does not establish access to its deployment account.
- Live `robots.txt` allows crawling and references the production sitemap. The live XML sitemap contains 12 URLs, including the homepage, About, service pages, and work pages. Individual live page responses remain to be verified.
- `index.html` already contains a Trimugo title, description, canonical URL, index/follow directive, social metadata, icons, and WebSite/ProfessionalService structured data. Adding duplicate tags is unnecessary.
- `scripts/build-seo-pages.mjs` creates 11 static pages and a sitemap during the build. `src/universe/story/Story.jsx` already links to these main sections, including About Trimugo.
- The initial homepage copy and links in `index.html` are clipped into a visually hidden 1px block, then replaced by React. `Universe.jsx` also hides its main heading and introductory description. This merits a content-accessibility and rendering fix; it is not evidence that Google has penalized the site.
- The sitemap assigns every page the build date as `lastmod`, even when content has not changed.
- `public/` already contains a Google HTML verification file and an IndexNow key file. Their presence does not prove successful account verification or prior submissions.
- `scripts/submit-indexnow.mjs` checks the live key, then submits URLs from the local build sitemap. Its comments/output promise crawl timing and assume no inbound links without evidence. It does not establish that every submitted page is live or that an accepted notification becomes indexed.
- The existing `npm run check:seo` passed for the current 12-page `dist/`. This was an inspection of existing output, not a fresh build. Its checks do not prove live accessibility, required structured-data presence, or indexing.
- A public search for the exact brand did not return the official website in the results exposed by the research tool. This is not a definitive Google or Bing index-status diagnosis; account-level inspection is needed.
- Pre-existing changes in `index.html` and `dist/index.html` must be preserved.

## Scope and non-goals

Scope: brand identity, useful crawlable homepage content, accurate sitemap metadata, stronger build/live SEO validation, reliable IndexNow submission, and Google/Bing indexing instructions and status reporting.

Non-goals: redesigning the 3D journey, migrating frameworks or hosts, changing the domain, broad keyword landing-page expansion, paid ads, backlink purchasing, publishing social posts, browser-setting changes, and promises of autocomplete suggestions or guaranteed ranking. No fabricated business facts or verification tokens.

## Requirements

R1. Keep `https://www.trimugo.in/` as the canonical origin unless live evidence demonstrates a configuration conflict. Keep Trimugo consistent in the homepage title, visible identity, WebSite data, About page, and social metadata. Correct verified inconsistencies without duplicating working SEO elements.

R2. Provide a useful, human-readable branded homepage introduction and links in initial HTML, including when JavaScript is unavailable or fails. The key business description must also be available visibly in the working experience. Do not rely on permanently clipped keyword copy for search discovery. Preserve screen-reader semantics, mobile usability, and the existing journey. Avoid a flash of unstyled content or duplicate visible introductions during startup.

R3. Retain the useful existing static pages and normal HTML links. Validate one meaningful main heading per page and agreement between visible business facts and structured data. Brand the homepage heading with Trimugo naturally.

R4. Keep a valid sitemap of unique canonical, indexable production pages. Remove build-time `lastmod` values unless trustworthy per-page modification dates can be supplied. Do not substitute arbitrary dates or word-count padding for content quality.

R5. Extend SEO checks to validate exact canonical URLs, required WebSite and business identity data, robots access, sitemap coverage/uniqueness, About discovery, and verification/icon asset availability. Add a read-only live audit for HTTP responses, redirects, content types, robots directives including X-Robots-Tag, and representative page identity; detect a homepage fallback served in place of a missing static page. Do not infer indexing from HTTP 200 alone.

R6. Make IndexNow submission bounded and truthful: validate the live key and intended production URLs, support a reviewable dry run, handle malformed/empty sitemap data and request failures, and distinguish acceptance from indexing. Remove unsupported claims about backlinks and guaranteed crawl timing. Submit only after the corresponding content is live.

R7. Document the exact production sitemap URL, Google Search Console property verification and URL Inspection process, and Bing Webmaster Tools/IndexNow process. Preserve current verification files. Use existing authorized account access if available during execution; otherwise identify the specific owner action still required. No credentials belong in repository files.

R8. Report local verification, deployment, submission receipts, and observed index status separately. Local improvements alone must not be described as deployed or indexed. Hosting configuration changes should address observed issues only.

## Data, API, and UX impacts

- No application database or customer-data changes.
- Public SEO metadata and existing business content may be made consistent; business facts remain sourced from the repository.
- The homepage receives a readable branded introduction/fallback compatible with its existing design and startup sequence.
- Live auditing performs public reads. IndexNow submission sends public URLs and the existing public ownership key to its endpoint after deployment checks.
- Google/Bing account operations depend on actual authenticated access. This specification does not assume that access exists.

## Assumptions and constraints

- `Trimugo` and the existing production origin are the intended brand and domain.
- Preserve existing user edits and keep implementation changes focused.
- Current project workflow requires specification approval, separate task-plan approval, and execution-mode selection before implementation. This stage creates only this specification.
- No existing specification/task files were found; use `docs/specs/` and `docs/tasks/` for these durable documents. The task plan will be created only after approval.

## Risks

- Existing SEO work may simply await discovery, or there may be an account-reported exclusion that public checks cannot diagnose.
- Altering initial content can affect the preloader, layout, accessibility, and animation; verify desktop/mobile startup with and without JavaScript.
- Rebuilding changes generated `dist/` files; preserve and account for the existing dirty output.
- Search engines can choose another canonical, decline indexing, or rewrite names/snippets despite valid markup.
- Deployment and verified account access are external dependencies; unresolved dependencies must remain explicit.

## Acceptance criteria

- AC1: Initial and rendered homepages contain accurate, readable Trimugo identity and useful navigation; no essential branded description depends solely on a permanently hidden block. Startup and journey remain usable on desktop/mobile and the fallback works without JavaScript.
- AC2: Built pages have valid, consistent identity metadata, exact canonical URLs, appropriate headings, and discoverable internal links. Required structured data is present and parses.
- AC3: Sitemap and robots files agree with generated indexable URLs, with no duplicate URLs, fragment URLs, or fabricated modification dates. Existing verification and brand assets survive the build.
- AC4: `npm run build` and the strengthened SEO checks pass. Targeted negative checks demonstrate that missing identity data, incorrect canonicals, and invalid sitemap entries fail validation.
- AC5: A read-only production audit records real responses for sitemap URLs and key assets, identifies any routing/crawl blockers, and distinguishes production findings from local build results.
- AC6: IndexNow dry run is reviewable; submission rejects invalid or undeployed inputs and accurately reports endpoint acceptance/failure. A real submission receipt is recorded when production prerequisites are met.
- AC7: A concise indexing runbook and completion report identify Google/Bing actions completed and any owner/account/deployment steps outstanding. Actual branded-search appearance remains a monitored external outcome.

## Open decisions

- Search Console and Bing property verification, indexing exclusions, selected canonical, and prior submissions: inspect during execution if account access is available; otherwise request only the missing account action.
- Production release mechanism/access: determine from available project/account evidence before attempting deployment.
- Initial-content presentation: use the smallest styled fallback and visible brand introduction that meet AC1 without changing the journey; detail this in the task plan.

## References

- [Google: getting a site into Search](https://developers.google.com/search/docs/fundamentals/get-on-google)
- [Google: site names and WebSite structured data](https://developers.google.com/search/docs/appearance/site-names)
- [Google: requesting recrawling and indexing limitations](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- [Google: sitemap construction and accurate lastmod](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: hidden text policies and accessibility exceptions](https://developers.google.com/search/docs/essentials/spam-policies#hidden-text-and-link-abuse)
- [IndexNow: verification, submission, and response codes](https://www.indexnow.org/documentation)
