# Independent verification 3 — FAIL

**Candidate:** `5260b4c81bef84b335da5e4643d8b09047a45a86`

**Verified:** 2026-08-28 UTC

**Live URL:** https://keyboard-route-check.sociobot.in

## Decision

**FAIL.** The deployed static site and packaged extension match this candidate, and the repaired demo exit works. However, the advertised paid checkout remains unavailable and independent packed-extension checks found route-reporting and popup-rendering defects that undermine the product's core evidence artifact.

## Required cold first read

**PASS.** A fresh desktop visit plainly says it records “the route your keyboard takes,” names keyboard users and web teams, and shows **Try it with sample data** with “See a route report right away.” One click opens `/demo`, immediately shows a realistic five-stop booking-page report and its three findings, and presents the persistent **Demo — sample data, nothing is saved to your real data** banner with **Reset demo** and **Start for real**.

## Claim contract

After `npm ci`, every exact command in `.factory/claims.json` was run separately from the shipped demo entry point. All selected one test and exited 0.

| Claim | Exact command | Result |
| --- | --- | --- |
| `route-data-local` | `npm run test:claims -- --grep @claim:route-data-local` | PASS — 1 passed |
| `report-export` | `npm run test:claims -- --grep @claim:report-export` | PASS — 1 passed |
| `demo-isolated` | `npm run test:claims -- --grep @claim:demo-isolated` | PASS — 1 passed |
| `free-report-export` | `npm run test:claims -- --grep @claim:free-report-export` | PASS — 1 passed |
| `team-archive-price` | `npm run test:claims -- --grep @claim:team-archive-price` | PASS — 1 passed |
| `team-archive-local` | `npm run test:claims -- --grep @claim:team-archive-local` | PASS — 1 passed |

The commands emitted Node's `NO_COLOR`/`FORCE_COLOR` warning only. No claim command failed.

## Local build and automated checks

- `npm test`: **PASS**, 4/4 tests.
- `npm run typecheck`: **PASS**.
- `npm run lint`: **PASS**.
- `npm run test:browser`: **PASS**, 11/11 tests.
- `npm run build`: **PASS**. It produced `dist/site`, `.output/chrome-mv3`, and `.output/keyboard-route-check-1.0.0-chrome.zip`.
- `npm audit --omit=dev --audit-level=high`: **PASS**, 0 production vulnerabilities. (`npm ci` reports development-tree advisories.)

There is no `verify-url.sh` in this checkout, despite the prior handoff mentioning one. Equivalent fresh live checks for title, language, landmark, image alternatives, console/page errors, and HTTP status are listed below.

## Live deployment and product checks

- Candidate identity: rebuilt `index.html`, `demo.html`, JS, and CSS SHA-256 values exactly match the live responses. The live download zip has different archive-container bytes, but `diff -rq` of fresh unpacked live and candidate packages produced no differences.
- The live `/`, `/demo`, `/privacy`, and `/terms` routes returned 200; an unknown path returned the styled 404 page with HTTP 404.
- Fresh desktop and 390px checks found `lang=en`, one `h1`, one `main`, no missing image `alt`, no horizontal overflow, no undersized visible controls, and no page/console errors on valid routes. The expected unknown-route 404 generated Chromium's normal failed-resource console message.
- Keyboard-only traversal reached every visible control, began with the skip link, wrapped without a trap, and showed a 3px solid focus outline at each stop. Reduced-motion mobile `/demo` had no non-zero transition or animation.
- Fresh axe-core scans at desktop and 390px reported **zero serious or critical violations**. Axe reported one non-blocking `aria-allowed-role` *minor* on `/demo`.
- Demo normal flow: exported `sample-keyboard-route-report.json` (1,768 bytes), reset reseeded only `demo:krc:sample-report`, and **Start for real** returned home with localStorage empty. Empty license submission says “Paste your license token first”; an invalid token says it is not active.
- Privacy request log: landing and demo/export flow made only same-origin document, JS, CSS, and image requests. Deliberately verifying an invalid license made the documented request only to `https://api.sociobot.in/api/v1/products/keyboard-route-check/verify`.
- Live HTML has CSP limited to self plus the declared Sociobot API, `Referrer-Policy: strict-origin-when-cross-origin`, HSTS, and `nosniff`. The hashed JS has `Cache-Control: public, max-age=31536000, immutable`. Initial JS is 4.21 KB gzip, CSS 2.56 KB gzip, and the 199.75 KB hero WebP is within the static budgets.
- The documented unlock API allowance is enforced. A fresh single-client, 40-request invalid-license burst received **30 × 200** and **10 × 429**; the 429 responses included `Retry-After: 4` and `x-ratelimit-after: 4`. No sign-in, PWA service worker, library/CLI consumer package, or backend persistence surface applies to this browser-extension product.

## Defects

### High — release blocking

1. **The live paid checkout is unavailable.** On fresh verification, `GET https://api.sociobot.in/api/v1/products/keyboard-route-check/checkout` returned **HTTP 404** (no redirect). The landing page advertises “$29 one-time” and its **Buy team archive** link points to that endpoint. A user cannot obtain the optional license. Enable/register the Sociobot product so the URL redirects to hosted checkout, then make the claim test follow and assert that public result rather than only asserting the link destination.

2. **A real two-control cyclic Tab route receives no loop finding.** In a fresh packed MV3 profile, a test page moved focus `Alpha → Beta → Alpha → Beta → Alpha` on each Tab. The report captured all five stops but returned `findings: []`. This contradicts the brief's core promise to flag loops and leaves a common focus cycle absent from the exported review evidence. The current condition only identifies immediately repeated control IDs; it needs cycle detection beyond a one-stop repeat.

3. **Page-provided label text is rendered as active popup markup.** In a fresh packed MV3 profile, a control with the aria label `</span><button id="injected-control">Fake export</button><span>` produced an extra `#injected-control` button in the extension popup. Labels come from pages covered by the extension's `<all_urls>` content script and must be rendered as text, not interpolated into popup HTML. Escape all report and finding text before rendering, and add an automated regression that asserts markup-like labels cannot create popup controls.

### Medium

4. **Valid positive-`tabindex` order is reported as skipped.** The browser correctly focused `Beta (tabindex=1) → Alpha (tabindex=2) → Gamma`, but the route report added two skip findings: “Expected Gamma; focus moved to Alpha” and “Expected Beta; focus moved to Gamma.” The expected-next calculation uses DOM query order instead of browser Tab order. This creates misleading review evidence for pages using positive tabindex values.

5. **Claim coverage does not verify two live outcomes.** All listed claims pass, but `team-archive-price` verifies the price and href only; it did not detect the live checkout 404. The recorder claim coverage also does not exercise cyclic focus or valid positive-tabindex order. Add observable end-to-end cases for those conditions.

## Scope

No product source was changed during this verification. Evidence screenshots and scripts remain under `.factory/qa-artifacts/` as untracked QA artifacts.
