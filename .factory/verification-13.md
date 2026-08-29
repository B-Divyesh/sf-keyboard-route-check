# Independent verification 13 — Keyboard Route Check

## Verdict: PASS

Candidate `7b056ef3ae6d3fe2ab5ae680860780058fae5db2` was independently verified
on 2026-08-29 UTC against <https://keyboard-route-check.sociobot.in>. The live
deployment byte-matches the fresh production build. No product code was
changed.

There are no defects: critical 0, high 0, medium 0, low 0.

## Mandatory first-read and demo gates

PASS at a cold 1440×900 desktop page and cold 390×844 mobile page.

- What it does: **“Record the route your keyboard takes.”**
- For whom: **“For keyboard users and web teams checking how focus moves
  through a page.”**
- What to click first: **“Try it with sample data”**, accompanied by **“See a
  route report right away.”**

The primary action was visible in the first viewport at both sizes. One click
opened an opinionated five-step sample report, with loop/skip/invisible-focus
findings and the persistent **“Demo — sample data, nothing is saved to your
real data”** banner. Reset demo retained only the demo storage key and Start
for real removed it. No horizontal overflow occurred.

## Claims gate

`.factory/claims.json` exists and has 16 entries. After fresh `npm ci`, every
declared command was run separately from its declared demo or packed-MV3 entry
point. All passed. A subsequent `npm run test:claims` passed 31/31 browser
tests.

| Claim | Result |
| --- | --- |
| `route-data-local` | PASS |
| `report-export` | PASS |
| `demo-isolated` | PASS |
| `checkout-token-session-only` | PASS |
| `free-report-export` | PASS |
| `offline-recording` | PASS |
| `team-archive-local` | PASS |
| `team-archive-unavailable` | PASS |
| `focus-cycle-reporting` | PASS |
| `invisible-focus-reporting` | PASS |
| `browser-tab-order` | PASS |
| `skipped-control-reporting` | PASS |
| `reverse-tab-recording` | PASS |
| `popup-label-safety` | PASS |
| `license-transfer-handoff` | PASS |
| `license-check-destination` | PASS |

The live landing, demo, privacy and terms pages plus README were checked
against the manifest. No material unlisted user-facing claim was found.

## Clean checkout gates

- `npm ci`: passed; 176 packages; audit reported 0 vulnerabilities.
- `npm test`: passed, 12/12.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- Exact `npm run build`: passed; produced `dist/site`, packed MV3 extension,
  and extension ZIP.
- `npm run test:browser`: passed, 31/31.
- `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip`: passed.
- `npm audit --omit=dev --audit-level=high`: passed, 0 vulnerabilities.
- `node scripts/verify-live.mjs https://keyboard-route-check.sociobot.in`:
  passed home, demo, legal routes, mobile, skip link, demo isolation/reset,
  offline export, browser errors, requests and axe checks.
- `/opt/fleet/lib/verify-url.sh` passed live `/` and `/demo` with HTTP 200,
  title, language, main landmark, one h1, complete image alternatives, named
  buttons and no console errors.

## End-to-end product behavior

The clean packed extension was exercised by the full browser suite against
real fixture pages. It recorded normal Alpha → Beta → Gamma routes, did not
misreport valid positive tabindex/radio/contenteditable or disabled/inert
controls, reported true skips and forward cycles, preserved reverse Tab as
reverse rather than a loop, and caught transparent focus rings. It handled
missing and invalid license input with recovery guidance, worked offline after
load, and exported a downloaded report. The report included labels, roles,
browser order and findings but no input values, page title, URL query, URL
fragment or external upload. Markup-like labels stayed text in the popup.

The live demo was keyboard-operated: Enter opened it, Space reset it, Enter
exported its JSON report, and Start for real removed demo data. The repaired
skip link was independently confirmed live: Tab focused Skip to content; Enter
moved focus to `main#main` and applied a visible 3px outline; the following
Tab remained inside main rather than returning to the wordmark.

## Privacy, requests, headers, deployment and rate limiting

A fresh Playwright request log for cold landing → demo → reset → export → exit
contained only the product origin (HTML, JS, CSS, hero); no analytics,
tracking, report upload, or other external request occurred. A returned
checkout token was removed from the URL and held only in that tab's
`sessionStorage`; demo entry ignored such a token and used only
`demo:krc:sample-report` storage.

All normally served artifacts from the fresh build matched live bytes. The
downloaded ZIP matched as well:
`8935373c457fdc9b9f13dcc1f3c0b6b74d5f2e48eb848fe07011376ec7d97bd1`.
`staticwebapp.config.json` correctly returns 404 because Azure consumes it as
deployment configuration rather than serving it. Live responses carry HSTS,
`X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, and CSP:
`default-src 'self'; connect-src 'self' https://api.sociobot.in; …;
frame-ancestors 'none'`. HTML and hero use `public, must-revalidate,
max-age=30`; hashed JS/CSS use `public, max-age=31536000, immutable`.

The billing verify endpoint is the only server-side product call. A fresh
single-client 35-request invalid-token burst accepted 30 requests; request 31
through 35 returned 429 with `Retry-After: 4` and `x-ratelimit-after: 4`.
Observed allowance: **30 rapid requests per client**.

## Accessibility and performance

Fresh axe 4.11 scans covered `/`, `/demo`, `/privacy`, `/terms` and `/404` at
1440×900 and 390×844: zero violations on all ten pages, therefore zero serious
or critical findings. Each route had exactly one h1 and a main landmark, no
console/page error, no overflow, complete image alternatives, and visible
keyboard focus. The browser suite also passed 44px target, focus contrast,
reduced-motion, semantic route/history focus and real HTTP-404 checks. All
crawled links returned 200.

Production JS is 13,693 bytes (5,030 bytes gzip); CSS 10,164 (2,850 gzip);
fonts 0; hero 199,746 bytes. These pass the 200 KB JS, 50 KB CSS, 120 KB font
and 300 KB hero budgets. A fresh Lighthouse 12.8.2 audit began successfully,
then Chromium crashed during full-page screenshot capture, so it produced no
reliable new score; this is noted rather than treated as a measurement.

## Applicability

This is an MV3 browser extension with a static companion site. It has no
sign-in, PWA service worker, product backend, persistent server state, CLI, or
consumer package; the corresponding special checks do not apply.
