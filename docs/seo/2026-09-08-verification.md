# Search discovery verification — 2026-09-08

## Implemented

- Styled initial Trimugo HTML remains readable without JavaScript. Suspense and route-error recovery reuse that content.
- The business overview now has a visible Trimugo h1, accurate description, and ordinary links to About, services, and work.
- Browser testing exposed an existing scroll handoff defect: Skip reached the finale instead of the overview. The snap controller now allows programmatic navigation to cross into the overview and cancels competing snap animation, while retaining upward journey reentry.
- Generated sitemap no longer fabricates modification dates on every build.
- Built-output validation, production auditing, and IndexNow preflight now check actual identity, canonicals, routes, robots, assets, and deployment agreement. Notification receipts do not imply indexing.
- Existing ownership files, icons, public routes, and the meaning of the user's pre-existing audit-reader comment were preserved. The original source/output diff was recorded before rebuilding.

## Local verification

- Production build: passed; all 12 static/index pages retained. Existing large journey-chunk warning remains; no framework or rendering redesign was introduced.
- `npm run check:seo`: passed for 12 pages.
- `npm run test:seo`: 30 passed, 0 failed. Covers schema/canonical/sitemap/assets failures, robots, mocked network/IndexNow outcomes, and programmatic overview navigation.
- `npm run check:snap`: passed.
- `git diff --check`: passed before release.
- Chrome desktop and responsive 390 × 844 inspection: preloader renders, Skip reaches visible overview, brand heading and copy are readable, static About navigation works, and the privacy route loads.
- JavaScript-disabled desktop/mobile inspection: styled homepage content remains readable and About loads without JavaScript.
- Local failure simulation: deliberately returning HTTP 503 for the entry bundle leaves the initial content available; returning HTTP 503 for the lazy journey bundle shows recovery messaging, retry, and the readable introduction.
- Test-only JavaScript disabling was reversed. Failure simulation is confined to a temporary local preview, not production source.

## Production and account evidence

- Before release, public www homepage and About returned HTTP 200, apex redirected permanently to www, robots allowed crawling, and sitemap contained 12 routes. A missing route returned 404.
- The new audit correctly detected that the old homepage and new hashed entry assets did not match the intended build. No notification was sent for that mismatch.
- GitHub `main` matched the latest successful Vercel Production deployment at baseline (`d9df2e85e6699407c38c115dbfcc094bdaf09337`). Release retains that integration and the existing domain.
- The signed-in Trimugo Google account showed no Search Console properties and no pending verifications. A URL-prefix property for `https://www.trimugo.in/` was prepared; this is not proof of verification or submission.
- Source release `5c4ef94` was pushed to the existing production branch. Public audit at `2026-09-07T19:35:49Z` confirmed all 12 pages and 13 then-required assets matched the build, with no errors or differences. The GitHub deployment-status read was declined, so release confirmation relies on actual public content rather than a deployment dashboard claim.
- IndexNow dry run passed without posting. One actual notification for 12 URLs received HTTP **202** at `2026-09-07T19:36:31Z`: received, key validation pending. This is not an indexing confirmation; no repeat notification was made.
- After explicit account-access approval, the account-specific Google HTML and Bing XML files were downloaded from their verification UIs and released in `b96e43b`. The prior Google file remains. Final public audit at `2026-09-07T19:39:14Z` passed for 12 pages and 15 required assets, with the live site matching the intended build.
- Google displayed **Ownership verified** for the canonical URL-prefix property. Sitemap submission displayed **Sitemap submitted successfully**, then **Success** with **12 discovered pages**.
- Google homepage URL Inspection reported **URL is on Google / Page is indexed**. Last crawl was **Aug 21, 2026, 8:02:22 AM** as displayed in the account UI; crawler was Googlebot smartphone. Crawl/indexing were allowed, fetching succeeded, and Google-selected canonical was the inspected `https://www.trimugo.in/` URL. A referring page was `https://sureshyogalaya.in/`. This corrects the initial public-search uncertainty: the homepage was already indexed, although branded ranking/appearance is a separate issue.
- Google live tests for the homepage and `/about/` both reported **URL is available to Google**. Both request-indexing actions displayed **Indexing requested** and confirmed addition to the crawl queue. Before the request, About was **Discovered - currently not indexed**, with no prior crawl recorded. Requests are not repeated to try to accelerate that queue.
- Bing XML verification completed and the site dashboard became available after reloading. Sitemap submission confirmed **successfully submitted for processing**, with its row showing **Submitted / Processing**.
- Bing homepage index inspection reported **Indexed successfully / URL can appear on Bing**. Its stored audit still reported a missing H1 and description-length issue. A live test of the updated site reported **URL can be indexed by Bing** and only the description-length issue, confirming the heading issue was resolved.
- The homepage description and social descriptions were shortened to **151 characters** in response to Bing's displayed 25–160 character guidance. Release `c53c838` contains that correction and a validation guard. Build, 12-page validation, and all 30 focused tests passed after the change.
- Final public audit at `2026-09-07T19:47:11Z`: **12 pages, 15 required assets, zero errors, zero differences from the completed build**.
- Bing's refreshed live test, displayed as **Today at 01:17**, reported **URL can be indexed by Bing** and **No SEO/GEO issues found**. One homepage indexing request was submitted. The dialog closed and the daily quota decreased from 100 to 99, confirming it was counted. The dialog was reopened only to inspect the quota, then canceled without a second submission.

## Completion and remaining external processing

Implementation, local checks, release, ownership verification, sitemap submissions, and the described indexing requests are complete. The homepage was already in both indexes; Google About indexing, recrawling, snippet updates, and branded ranking remain search-engine processing outcomes. No ranking position, immediate appearance, or completion date is promised. Use the verified console reports to monitor progress rather than submitting the same URLs repeatedly.

The live site remains at **https://www.trimugo.in/** on its existing Vercel integration. No DNS or hosting migration was performed.

## Scope references

[Approved specification](../specs/2026-09-08-trimugo-search-discovery-spec.md) · [Approved task plan](../tasks/2026-09-08-trimugo-search-discovery-tasks.md) · [Indexing runbook](trimugo-indexing.md)
