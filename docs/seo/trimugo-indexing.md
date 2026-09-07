# Trimugo search indexing

The official origin is **https://www.trimugo.in/**. Safari, Chrome, and Edge display results from the search engine the visitor chooses. Work on Google and Bing discovery; there is no separate Safari website-submission mechanism required for this task.

## Validate a release

Run from the project root with the existing dependencies installed:

```sh
npm run build
npm run check:seo
npm run test:seo
npm run seo:audit
npm run seo:dry-run
```

`seo:audit` reads the public production site. It checks the live sitemap, pages, redirects, robots directives, and brand/verification assets, and reports differences from the intended local build. It does not change search-engine state. `seo:dry-run` performs submission preflight without posting URLs. A production/build mismatch is expected before deployment and must be resolved before submission.

Deploy the verified source through the existing GitHub/Vercel integration. On 2026-09-08 the repository's `main` branch matched its latest successful Vercel Production deployment. Preserve this hosting arrangement and the www canonical domain. Deploy the full build, including generated static pages, sitemap, and public files.

After production matches the build, run:

```sh
npm run seo:audit
npm run seo:dry-run
npm run seo:submit
```

For machine-readable output, append `-- --json` to an audit, dry-run, or submit command. Record the result and timestamp. Do not submit repeatedly to try to force rankings.

## Google Search Console

1. Open [Google Search Console](https://search.google.com/search-console/) using the account that owns Trimugo. Select the existing `trimugo.in` domain property or `https://www.trimugo.in/` URL-prefix property.
2. If verification is needed, the repository already contains `public/googleac93e0ce4e6876ca.html`, served at [the production verification URL](https://www.trimugo.in/googleac93e0ce4e6876ca.html). Use it only if Search Console requests that exact file for the current account/property. A different account may require a different token. A domain property uses DNS verification; the HTML file applies to URL-prefix verification. Do not remove existing verification records.
3. In Sitemaps, submit **https://www.trimugo.in/sitemap.xml** and inspect the reported fetch/processing status.
4. Use URL Inspection for **https://www.trimugo.in/** and **https://www.trimugo.in/about/**. Inspect the indexed result and Google-selected canonical. Use the live test to confirm accessibility; then request indexing when available.
5. If excluded, record the exact reason and address it. For example, a live test succeeding does not resolve a different selected canonical or guarantee that a discovered URL will be indexed. Do not keep changing site copy without understanding the reported reason.
6. Monitor Page indexing and Performance for the query `trimugo`. Note the dates of submission, last crawl, indexed status, and first impressions. Public `site:` searches are useful spot checks, not a substitute for the property's reports.

Google requires property access for URL Inspection requests. Crawling may take days or weeks; requests do not guarantee inclusion. [Google recrawl guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)

## Bing and IndexNow

1. Open [Bing Webmaster Tools](https://www.bing.com/webmasters/) with the site owner's account. Select Trimugo if already verified. If offered, import the verified Google property; otherwise use Bing's displayed verification method. Do not invent a verification token.
2. Submit **https://www.trimugo.in/sitemap.xml** and inspect sitemap and URL indexing reports for the homepage and About page.
3. The existing IndexNow key is the hex-named `.txt` file in `public/`. The submission script uses the required-asset list in `scripts/seo-validation.mjs`, checks that the live file contains the matching key, and submits the validated production URL list. Keep the key file available after deployment. If ownership files are rotated, update that list together with the files.
4. Record the actual response: **200** means received; **202** means received with key validation pending. Neither means indexed. Investigate other responses, especially invalid key/host, malformed URLs, and throttling, before retrying.

IndexNow notifies participating search engines; it does not submit to Google. The protocol documents ownership checks, URL submission, and response meanings. [IndexNow documentation](https://www.indexnow.org/documentation), [IndexNow FAQ](https://www.indexnow.org/faq)

## Maintenance

- Keep Trimugo's visible business description, About page, title, social metadata, and structured identity consistent with real services and facts.
- Retain normal links to static pages. Avoid putting essential business information only inside animations or hidden text.
- The sitemap should list canonical public pages once each. Omit `lastmod` unless its date describes a real significant change to that page; rebuilding alone is not such a change. [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- Run build validation for SEO-affecting changes and production checks after release. Retain search-console verification files and the existing icons.
- Keep a release report that separates local verification, deployment, submissions, and actual indexing. Never label a submission receipt as a ranking result.

## Access needed for unfinished account actions

Google/Bing property inspection and manual requests need an authenticated owner/full-user session. If automated browser access is unavailable, the owner can complete the numbered account steps above. No password, session cookie, or private API token belongs in this repository or a chat message.

See [the specification](../specs/2026-09-08-trimugo-search-discovery-spec.md) and [the task plan](../tasks/2026-09-08-trimugo-search-discovery-tasks.md) for scope and acceptance criteria.
