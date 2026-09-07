# Trimugo search discovery task plan

Status: Implemented, deployed, and submissions completed on 2026-09-08; search-engine processing remains external
Date: 2026-09-08
Specification: [Approved search discovery specification](../specs/2026-09-08-trimugo-search-discovery-spec.md)
Approval record: User approved the specification with “Approve”, approved this task plan with “Approved”, and selected mode A on 2026-09-08.

## Execution constraints

Implementation starts only after this plan is approved and the user selects execution mode A or B. This document does not authorize silently advancing those gates.

Preserve pre-existing changes in `index.html` and `dist/index.html`. Do not migrate hosting, invent business facts, add keyword pages, or publish messages to other people. Deployment and authenticated search-console operations depend on available access. Complete local work and verification before any necessary release approval. Report unresolved external dependencies precisely.

## Tasks in dependency order

### T1 — Record baseline and confirm integration boundaries

Owner: integrator. Dependencies: execution-mode selection.

- Record repository status and preserve the existing source/output diff before rebuilding.
- Inspect homepage startup, lazy loading, preloader lifecycle, rendered overview, and relevant local instructions.
- Inspect available deployment configuration and authenticated account access without exposing credentials or altering accounts.
- Establish the baseline for production routes, robots, sitemap, verification assets, and canonical redirects. Use existing public evidence where still applicable.
- Agree on shared validator/audit interfaces before parallel file edits. Keep production origin fixed at `https://www.trimugo.in`.

Verification: baseline identifies existing user edits, build behavior, known live checks, and any account/release dependencies. No unsupported conclusion about index status.

Acceptance mapping: AC4, AC5, AC7; R8.

### T2 — Make branded homepage content readable and resilient

Owner: homepage workstream. Dependencies: T1.

Affected areas: `index.html`, `src/main.jsx`, `src/App.jsx`, `src/universe/Universe.jsx`, `src/universe/story/Story.jsx`, relevant universe styles, and `Preloader.jsx` only where startup integration requires it.

- Replace the permanently clipped initial copy with a compact, styled Trimugo introduction, business summary, and normal links to About, services, work, and contact.
- Keep this fallback usable when JavaScript is disabled, the entry bundle fails, or the lazy journey module fails. Coordinate its removal with a successful application handoff; avoid replacing useful content with an indefinitely blank Suspense screen. Provide an accessible error fallback where React otherwise clears the initial content on failure.
- Use critical styling consistent with the current dark design so initial content is styled on first paint. Ensure transition to the existing preloader does not expose an unstyled copy dump or duplicate visible introductions.
- Place a visible Trimugo heading and concise business description in the existing business overview. Move/remove the duplicate hidden heading as appropriate so the normal homepage has one meaningful main heading. Preserve the journey, skip action, privacy route, and existing footer links.
- Keep metadata and structured business facts consistent; change only observed inconsistencies. Retain working verification and brand assets.

Verification: inspect desktop and mobile startup, enter/skip, overview links, and privacy navigation; repeat with JavaScript disabled, blocked entry bundle, and failed lazy module. Check visible content, heading count, keyboard access, horizontal overflow, and console errors. Keep failure content accessible if startup had locked scrolling.

Acceptance mapping: AC1, AC2; R1–R3.

### T3 — Correct sitemap output and strengthen build validation

Owner: SEO build workstream. Dependencies: T1; final validation depends on T2.

Affected areas: `scripts/build-seo-pages.mjs`, `scripts/check-seo.mjs`, narrowly scoped shared SEO validation helpers and verification fixtures if needed. Do not edit homepage files or package commands in this workstream.

- Remove build-date `lastmod` output; retain a date only if a trustworthy source already exists. Preserve the current useful routes.
- Validate exact origin/path canonicals, unique sitemap membership, generated-page coverage, exclusion of fragments and invalid URLs, robots access, and required About/service/work links.
- Validate required homepage WebSite and business identity data, JSON-LD parsing including arrays/graphs, and consistency of identifiers and names. Apply page-specific schema expectations rather than requiring WebSite markup on every page.
- Verify Google ownership file, IndexNow key, icons, and social image are present and valid for their intended use in built output.
- Make missing or malformed required files fail with actionable errors. Treat word counts as diagnostics, not proof of quality or a reason to pad copy.
- Add focused negative validation checks using temporary fixtures, not modifications to the production build: missing identity schema, incorrect canonical, duplicate/invalid sitemap URL, and missing required assets.

Verification: valid built output passes; the named failure fixtures fail for the intended reason. Confirm all 12 existing routes remain represented unless a verified defect requires a documented adjustment.

Acceptance mapping: AC2, AC3, AC4; R4, R5.

### T4 — Add production audit and reliable IndexNow submission

Owner: discovery operations workstream. Dependencies: T1 and agreed validation interfaces; integration depends on T3.

Affected areas: new `scripts/audit-seo-live.mjs`, `scripts/submit-indexnow.mjs`, focused network/submission fixtures. No edits to T2/T3-owned files or package commands.

- Add a read-only audit of production sitemap URLs, redirects, response types, canonicals, robots directives, required identity, and verification/brand assets. Use request timeouts and bounded concurrency.
- Detect a static URL incorrectly returning homepage content, even with HTTP 200. Audit a deliberately missing URL to identify soft-404 routing. Record live findings separately from local expectations.
- Before submission, validate nonempty sitemap input, exact allowed origin, unique canonical URLs, live key content, and live page identity against the intended build. Refuse foreign-host redirects, invalid inputs, or missing/undeployed content.
- Add `--dry-run` with a reviewable URL list and preflight outcome that never posts. Report 200 acceptance, 202 pending key validation, and errors accurately; never claim indexing or predict crawl timing from acceptance.
- Remove unsupported existing assumptions about inbound links and crawl timing. Test malformed input, network timeout, unavailable page/key, wrong page identity, and response handling without repeated real submissions.

Verification: dry run makes no submission; controlled failure scenarios reject safely; live audit reports observed route/asset status and returns failure on crawl blockers. Actual submission belongs to T7.

Acceptance mapping: AC5, AC6; R5, R6, R8.

### T5 — Integrate, build, and verify the complete change

Owner: integrator. Dependencies: T2, T3, T4.

Affected areas: `package.json`, generated `dist/`, integration fixes coordinated with file owners, concise verification evidence.

- Wire package commands for live audit, SEO verification, and IndexNow dry run; retain existing commands where possible. Update lockfile only if a necessary dependency changes.
- Reconcile shared interfaces and source changes, then run `npm run build`, `npm run check:seo`, and focused validator/submission negative checks.
- Preview built output for the T2 visual and startup checks; verify static routes as built files, not merely the development server fallback.
- Review generated differences against preserved user edits. Run `git diff --check` and inspect final scope. Do not auto-commit or push as a substitute for confirming the release path.

Verification: AC1–AC6 local checks pass, failures are resolved, and remaining live/account limitations are identified. Repeat checks only when subsequent changes justify them.

Acceptance mapping: AC1–AC6.

### T6 — Write the indexing runbook

Owner: integrator. Dependencies: T4, T5 for final command names and findings.

Affected areas: new `docs/seo/trimugo-indexing.md`, a short README link if useful.

- Document `https://www.trimugo.in/sitemap.xml`, current ownership-file locations, and exact build/audit/dry-run/submission commands.
- Describe Search Console verification, sitemap submission, homepage/About URL Inspection, request indexing, and inspecting exclusion reasons and Google-selected canonical.
- Describe Bing Webmaster Tools verification or an available import path, sitemap submission, and IndexNow receipts. Clarify that IndexNow does not submit to Google.
- Separate completed local checks, production checks, account actions, and future monitoring. Include precise owner steps where access is unavailable and avoid asking for tokens already present.

Verification: commands match implementation, URLs are correct, no secrets are recorded, and guidance is checked against current official documentation.

Acceptance mapping: AC7; R7, R8.

### T7 — Release, submit, and report according to available access

Owner: integrator. Dependencies: T5, T6 and confirmed release/account access.

- Use the established release mechanism after completing any applicable release approval; do not migrate the site or change DNS to solve an assumed indexing problem.
- Re-run the production audit after a release and confirm the updated content is live before IndexNow submission. Record the actual endpoint response.
- Where authenticated access is available, inspect/submit the Google and Bing properties and capture the actual outcomes. If access is unavailable, finish the code and runbook and state exactly which owner action is still required.
- Report implemented changes, verification evidence, deployment status, submission status, and observed indexing separately. Do not mark an unavailable external step complete or promise branded-search ranking.

Verification: live checks and receipts support each claimed external action; remaining dependencies are explicit. Search appearance is monitored after submission and is not a prerequisite that can be guaranteed by this implementation.

Acceptance mapping: AC5, AC6, AC7.

## Ownership and safe parallelism

Execution record: T1–T7 completed in mode A. T2 integration additionally corrected an observed engine/snap handoff bug required for Skip to reach the new overview; five regression checks cover that behavior. Google and Bing ownership were verified with explicit user approval, both sitemaps were submitted, Google homepage/About indexing requests were queued, and Bing counted a homepage refresh request. IndexNow received 12 URLs with HTTP 202. Production matches the final build and Bing's live homepage audit reports no issues. Actual crawl completion and branded ranking remain external outcomes. See [verification evidence](../seo/2026-09-08-verification.md).

- Mode A: after T1, T2, T3, and T4 may run in parallel under three separate agents with the file boundaries above. The integrator owns package wiring, generated output, cross-workstream resolution, documentation, deployment, and submission. Shared helpers are owned by T3; T4 consumes the agreed interface without editing it. Agents do not run production builds or network submissions concurrently.
- Mode B: complete all tasks inline in dependency order with the same ownership boundaries used to organize edits.
- T5 waits for all implementation workstreams. T6 may be drafted once T4 interfaces settle but must be finalized against T5 results. T7 runs only after integration/verification and the relevant external prerequisites.
- No agent is spawned and no implementation begins at the task-plan stage.
