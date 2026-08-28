# Independent verification 2 — FAIL

**Candidate:** `a1de6efca5e97a04cb5e11a9d0af2fb763fc8319`
**Verified:** 2026-08-28 UTC
**Live URL:** https://keyboard-route-check.sociobot.in

## Release decision

**FAIL.** The free recorder and companion site are deployable and the previous
static-deployment issue is resolved, but the advertised paid team archive is
not purchasable: its live Sociobot checkout URL returns HTTP 404. This is a
release-blocking end-to-end failure for a priced product feature. Demo exit
also retains sample data rather than discarding it as the demo-sandbox
contract requires.

## Required first-read result

**Pass.** A cold anonymous visit said, in plain words, that Keyboard Route
Check records the route a keyboard takes, names keyboard users and web teams
as the audience, and gives **Try it with sample data** as the first action,
with “See a route report right away.” The visible one-click action opened
`/demo`, showing a realistic five-stop booking-page report, findings, and the
Demo / Reset demo / Start for real controls.

## Claim contract — all commands passed

After a fresh `npm ci`, every exact command from `.factory/claims.json` was
run separately. Each exited 0 and selected one test:

| Claim | Command | Result |
| --- | --- | --- |
| `route-data-local` | `npm run test:claims -- --grep @claim:route-data-local` | PASS — 1 passed |
| `report-export` | `npm run test:claims -- --grep @claim:report-export` | PASS — 1 passed |
| `demo-isolated` | `npm run test:claims -- --grep @claim:demo-isolated` | PASS — 1 passed |
| `free-report-export` | `npm run test:claims -- --grep @claim:free-report-export` | PASS — 1 passed |
| `team-archive-price` | `npm run test:claims -- --grep @claim:team-archive-price` | PASS — 1 passed |
| `team-archive-local` | `npm run test:claims -- --grep @claim:team-archive-local` | PASS — 1 passed |

Several isolated claim invocations printed a child local-server `EADDRINUSE`
warning while another generated server was shutting down, but the selected
test itself completed successfully. A clean standalone `npm run test:browser`
subsequently passed 11/11 without that failure.

## Verification evidence

- Clean install succeeded (401 packages). `npm audit --omit=dev --audit-level=high` found 0 production vulnerabilities.
- `npm test`: 4/4 passed. `npm run typecheck` and `npm run lint`: passed.
  `npm run build`: passed, producing `dist/site`, the MV3 extension, and zip.
  `npm run test:browser`: 11/11 passed.
- A fresh packed-MV3 profile recorded normal Tab movement through real fixture
  controls (Verify license → Privacy → Terms), with unique IDs, no false
  findings, and no occurrence of the typed
  `do-not-record-this-secret` form value in the stored report.
- Live `/`, `/demo`, `/privacy`, `/terms`, and `/404` returned 200; an unknown
  route returned the styled 404 with HTTP 404. Built HTML and JS/CSS assets
  byte-match the candidate. The downloadable zip differs only in archive
  container metadata; every unzipped file hash matches the regenerated
  candidate package.
- Fresh live desktop and 390px mobile checks found one `h1`, `lang=en`, a
  `main` landmark, no horizontal overflow, no console/page errors, and all
  visible controls at least 44px high. Keyboard traversal showed a visible
  3px solid focus outline at every interactive stop; the route wraps without a
  trap. With reduced motion, zero elements had non-zero transitions or
  animations.
- Live axe-core scans at desktop `/` and mobile `/demo` reported **0 serious
  or critical** violations. A Lighthouse mobile run reported performance 100,
  accessibility 100, LCP 1.8 s, CLS 0; Chromium crashed during its final
  full-page screenshot artifact, so Lighthouse exited non-zero despite these
  completed audit scores. Browser-level accessibility checks above were clean.
- The live demo exported `sample-keyboard-route-report.json`, used only
  `demo:krc:sample-report` localStorage during the demo, and made only
  same-origin requests. Reset reseeded the sample. Empty license submission
  clearly announced “Paste your license token first.”
- Live responses have HSTS, `nosniff`, strict-origin referrer policy, and a
  CSP limited to self plus `https://api.sociobot.in`; hashed JS/CSS use
  `max-age=31536000, immutable`. Initial JS is 4.19 KB gzip, CSS 2.56 KB
  gzip, and the hero WebP is 199,746 bytes.
- The Sociobot verify API rate-limits invalid-license bursts. A 30-request
  15-concurrent burst returned 30×200; an immediate 80-request 20-concurrent
  burst returned 2×200 and 78×429, with `Retry-After: 1` and
  `x-ratelimit-after: 1`. Thus the observed rolling threshold was 32 accepted
  rapid requests before throttling. The endpoint subsequently returned a
  normal invalid verdict (200) after cooldown.

## Defects

### High — release blocking

1. **The live paid checkout is broken.**
   `GET https://api.sociobot.in/api/v1/products/keyboard-route-check/checkout`
   returned HTTP 404 with `{"error":"enabled factory product","status":404}`
   on 2026-08-28. The landing page promises “$29 one-time” and its **Buy team
   archive** control points to that URL. A customer cannot acquire the license
   needed for the optional archive. Register/enable the product and return the
   hosted Sociobot checkout redirect, then add an end-to-end check that follows
   the public buy URL rather than only asserting its href.

### High — demo-sandbox contract

2. **Start for real retains demo data.**
   From a fresh live `/demo` context, localStorage contained
   `demo:krc:sample-report`. Activating **Start for real** navigated to `/`,
   but the identical demo key remained. The data is namespaced and is not read
   by the real page, but the supplied demo contract requires that leaving demo
   mode discard it (or explicitly offer transfer). Remove it on this exit and
   add a regression that asserts the storage is absent after Start for real.

### Medium — coverage gap

3. **The claim tests did not catch either production-facing contract break.**
   `team-archive-price` checks the displayed price and href, not a successful
   hosted checkout response. `demo-isolated` exercises Reset demo, not Start
   for real. Keep the current observable assertions and extend them to cover
   these two outcomes.

## Scope notes

This is a browser extension with a static companion site, not a PWA or
backend; no service-worker/offline-update, consumer-package, sign-in, or
persistence-concurrency test applies. No product code was changed during this
verification.
