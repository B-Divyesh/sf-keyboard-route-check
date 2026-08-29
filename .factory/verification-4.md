# Independent verification 4 — FAIL

**Candidate:** `a70207eae3d8e1a78fb54873bb67b29456c19eb3`

**Live URL:** https://keyboard-route-check.sociobot.in

**Verified:** 2026-08-29 UTC

## Decision

**FAIL — do not release this candidate.** The live static files and unpacked
extension match the candidate, and the free sample and ordinary recorder flow
work. Four independent High defects remain: real invisible focus can be missed,
exports preserve sensitive URL query values, paid checkout is unavailable, and
the checkout-return license cannot reach the extension that owns the paid
archive.

## Required first read

**PASS.** A cold 1440×900 visit says “Record the route your keyboard takes,”
names keyboard users and web teams, and shows **Try it with sample data** with
“See a route report right away.” The action is above the fold. One click opens
`/demo`, where a realistic five-stop booking route and three findings are
already visible. The persistent banner says **Demo — sample data, nothing is
saved to your real data** and provides **Reset demo** and **Start for real**.

Evidence: `verification-artifacts/live-cold-desktop.png`,
`live-home-mobile.png`, and `live-demo-mobile.png`.

## Claim contract

The first claim command was invoked before any other repository check, as
required. Because this was a clean clone with no installed dependencies, the
runner could not import `@playwright/test`. After the required `npm ci`
bootstrap, every exact command in `.factory/claims.json` was run separately.
Each selected one test and exited 0:

| Claim | Exact command | Result |
| --- | --- | --- |
| `route-data-local` | `npm run test:claims -- --grep @claim:route-data-local` | PASS — 1 passed |
| `report-export` | `npm run test:claims -- --grep @claim:report-export` | PASS — 1 passed |
| `demo-isolated` | `npm run test:claims -- --grep @claim:demo-isolated` | PASS — 1 passed |
| `free-report-export` | `npm run test:claims -- --grep @claim:free-report-export` | PASS — 1 passed |
| `team-archive-price` | `npm run test:claims -- --grep @claim:team-archive-price` | PASS — 1 passed |
| `team-archive-local` | `npm run test:claims -- --grep @claim:team-archive-local` | PASS — 1 passed |
| `focus-cycle-reporting` | `npm run test:claims -- --grep @claim:focus-cycle-reporting` | PASS — 1 passed |
| `browser-tab-order` | `npm run test:claims -- --grep @claim:browser-tab-order` | PASS — 1 passed |
| `popup-label-safety` | `npm run test:claims -- --grep @claim:popup-label-safety` | PASS — 1 passed |

These green claim tests are insufficient to accept the product. The privacy
and report-export tests exercise the canned website demo instead of a real
extension recording. The team-price test checks only the link string, not the
404 live destination. No claim test gives the extension a visually transparent
focus outline. Those coverage gaps allowed the High findings below to pass the
claim suite.

## Clean install, tests, and build

| Gate | Result |
| --- | --- |
| `npm ci` | PASS — 401 packages installed from lockfile |
| `npm test` | PASS — 9/9 unit tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS; this script is another `tsc --noEmit` run |
| `npm run test:browser` | PASS — 14/14 browser tests |
| `npm run build` | PASS — MV3 directory, zip, and `dist/site` produced |
| `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip` | PASS |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 production vulnerabilities |

The full development tree reports 10 advisories: 1 low, 2 moderate, 4 high,
and 3 critical. They are build/test dependencies; the production audit is
clean. In particular, the direct `wxt` development dependency pulls the
affected `web-ext-run` chain.

## Candidate and deployment identity

`HEAD` and `origin/main` were both the requested candidate. Freshly built
`index.html`, `demo.html`, `privacy.html`, `terms.html`, `404.html`, JS, CSS,
hero image, `robots.txt`, and `sitemap.xml` had exact SHA-256 matches with the
live responses. The fresh and live zip container hashes differ because archive
timestamps are regenerated, but `diff -rq` of their unpacked contents produced
no differences.

Live status checks returned 200 for `/`, `/demo`, `/privacy`, `/terms`,
`/robots.txt`, `/sitemap.xml`, and the extension zip. An unknown route returned
the styled 404 document with HTTP 404. `/opt/fleet/lib/verify-url.sh` passed in
708 ms with one `h1`, `lang=en`, a `main`, no missing image alternative text,
and no console/page errors. Evidence is under
`verification-artifacts/verify-url/`.

## End-to-end behavior

### Free demo

- One click from the landing page opened `/demo`.
- Export produced `sample-keyboard-route-report.json` (1,768 bytes) with the
  expected five labels/roles and `invisible-focus`, `skip`, and `loop` findings.
  It contained no `value` field.
- With a seeded real key `krc:real-marker=keep-me`, demo entry added only
  `demo:krc:sample-report`; reset recreated only that demo record; exit removed
  the demo key and preserved the real marker.
- The demo flow made only same-origin requests. The sole external request in
  the extended flow occurred after explicitly verifying an invalid license and
  went to the documented Sociobot API.
- Empty and invalid license input on the website produced clear recovery text.

### Packed MV3 extension

- A fresh Chromium profile loaded the production MV3 directory successfully.
- A real route recorded input/button labels and roles, omitted the input value,
  exported valid JSON, and cleared back to the empty state.
- A forced skip produced `Expected No visible ring; focus moved to Visible
  ring.` Reverse traversal was recorded as `reverse` without a false skip.
- The repaired two-control loop, positive-`tabindex` order, rapid storage
  serialization, and markup-like label cases passed the repository suite.
- Recording generated no outgoing network requests. Extension popup axe scans
  before and after a report found no violations, and its reachable controls had
  visible 3 px focus outlines.

## Live accessibility, mobile, and performance

- Fresh live axe scans on `/`, `/demo`, `/privacy`, and `/terms` at 1440×900
  and 390×844 found **0 serious and 0 critical** violations. `/demo` has one
  minor `aria-allowed-role` finding because `role=status` is placed on `aside`.
- Every valid route had one `h1`, one `main`, `lang=en`, no missing image alt,
  no horizontal overflow, no console/page errors, and no visible control below
  44×44 px at 390 px.
- Keyboard traversal reached all 16 landing controls without a trap. Every
  control showed the designed 3 px signal-red focus outline. The skip link was
  first and moved the sequential navigation point to `#main`.
- With `prefers-reduced-motion: reduce`, no rendered element had a non-zero
  animation or transition duration.
- Mobile Lighthouse: performance **99**, accessibility **100**, best practices
  **100**, SEO **100**; FCP 0.9 s, LCP 1.9 s, TBT 100 ms, CLS 0. Evidence:
  `verification-artifacts/lighthouse-mobile.json`.
- Fresh build sizes: JS 11.28 KB raw / 4.30 KB gzip; CSS 8.68 KB raw / 2.56 KB
  gzip; hero WebP 199,746 bytes; no web fonts. All stated budgets pass.

Lighthouse also flagged an experimental serious accessible-name mismatch on
the wordmark: visible text is “KRC Keyboard Route Check,” while its explicit
name is “Keyboard Route Check home.” Regular axe did not include the
experimental rule. The popup body is 14 px (status/footer text is 11–12 px),
and the live report uses essential labels as small as 10 px; these miss the
attached 16 px body-text baseline.

## Headers, caching, and server boundaries

- HTML returns `Cache-Control: public, must-revalidate, max-age=30`.
- Hashed JS and CSS return `public, max-age=31536000, immutable`.
- CSP is limited to self plus `https://api.sociobot.in` for connections and
  forms; `frame-ancestors 'none'` is a response header. HSTS,
  `Referrer-Policy: strict-origin-when-cross-origin`, and `nosniff` are present.
- A 40-request single-client burst to the unlock verify endpoint produced
  **30 × 200** and **10 × 429**. Every sampled 429 included `Retry-After: 4`
  and `x-ratelimit-after: 4`. The observed allowance is 30 requests per burst.
- There is no sign-in, PWA/service worker, library/CLI consumer API, or product
  backend beyond the Sociobot billing calls, so those checks are not applicable.

## Defects by severity

### High — release blocking

1. **Real invisible focus is reported as visible.** In the packed extension, a
   keyboard-focused button styled with `outline: 3px solid transparent` and no
   shadow was exported with `focusMark: true`; `findings` was empty. A
   transparent outline provides no visible focus indicator. The detector checks
   only whether an outline style/width or shadow exists, not whether it is
   perceptible. This contradicts the brief's core requirement to flag invisible
   focus. Test focus-indicator color/contrast and other visually absent states,
   and add a real packed-extension claim test rather than relying on canned demo
   data.

2. **Exports preserve sensitive URL query values and undisclosed page titles.**
   Recording `http://127.0.0.1:4174/?session_token=secret-query-value` stored
   that full value verbatim in `report.url`; the JSON exporter preserves it.
   The privacy page says the extension records labels, roles, order, and route
   warnings, but does not disclose URL/title collection. Shared reports can
   therefore expose tokens, record IDs, search terms, or names even though form
   values are redacted. Strip query and fragment data by default, minimize the
   title, and disclose every retained field.

3. **The advertised paid checkout is dead.** A fresh GET to
   `https://api.sociobot.in/api/v1/products/keyboard-route-check/checkout`
   returned HTTP 404 with `{"error":"enabled factory product","status":404}`.
   It did not redirect to hosted checkout. The only dead link in the site crawl
   was **Buy team archive**, so a visitor cannot purchase the advertised $29
   archive or verify its actual price.

4. **A checkout-return license does not unlock the extension.** Opening the
   live site with `?license=verification-transfer-token` removed the token from
   the address bar and stored it in the website's localStorage. In the same
   fresh profile, extension `chrome.storage.local` remained empty. The team
   archive exists only in the extension, so even a working checkout return does
   not unlock the purchased feature. Implement an explicit, safe transfer into
   the extension or a clear copy/paste handoff that retains and exposes the
   returned token.

### Medium

5. **Offline revalidation destroys a previously valid archive verdict.** With
   an old cached `{valid:true}` verdict and token, opening the popup offline
   replaced it with `{valid:false, reason:"offline", checkedAt:<now>}` and
   hid **Save to team archive**. Because the failure is timestamped, retry is
   suppressed for a day. Preserve the last valid verdict when the network
   cannot answer and reconcile later.

6. **The extension license form gives no invalid-input feedback.** Submitting
   an empty token made no UI change. Submitting an invalid token stored the
   invalid verdict, hid the form, and returned to **Team archive license** with
   no error or recovery instruction. Add an announced status/error message as
   the website form already does.

7. **Core popup/report text is below the supplied readability baseline.** The
   popup body computes to 14 px, controls to 13 px, status to 12 px, and footer
   to 11 px. The mobile report uses 10–13 px for labels and focus states. Raise
   task text to at least the attached 16 px web baseline while retaining the
   product-specific visual system.

8. **Claim tests do not exercise the real surfaces for several public claims.**
   Privacy and export claims use a canned static sample; the price claim checks
   an `href`; archive unlock writes a valid verdict directly. They do not prove
   live checkout, return-to-extension transfer, real focus visibility, or the
   real extension's complete exported data. Extend the claims so the High
   regressions above fail in the sandbox.

### Low

9. **Two accessibility polish findings remain.** The demo banner's
   `aside[role=status]` produces axe's minor `aria-allowed-role` finding, and
   Lighthouse reports the wordmark's visible/accessible-name mismatch under
   the experimental WCAG 2.5.3 check.

10. **Development dependencies carry known advisories.** The shipped artifact
    has no production dependency findings, but the clean install reports three
    critical, four high, two moderate, and one low development-tree advisories.

11. **Route social metadata is incomplete.** Only the landing document includes
    Open Graph/Twitter-card metadata, and its social image is the 1200×800 hero
    rather than the required product-specific 1200×630 card. Demo, privacy, and
    terms omit the social fields.

## Final acceptance result

The deployment-only failure reported by the builder is real but is not the only
blocker. Candidate `a70207eae3d8e1a78fb54873bb67b29456c19eb3` is **FAIL** at the
tested live URL until all High findings are repaired and the strengthened claim
tests pass from a clean install.
