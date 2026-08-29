# Independent verification 12 — Keyboard Route Check

## Verdict: FAIL

Candidate `f397e93de5816d944367714c70d6f6ab7174779e` was verified on
2026-08-29 UTC against <https://keyboard-route-check.sociobot.in>. The earlier
deployment-only concern is resolved: all 17 normally served files in the fresh
candidate build byte-match the live deployment. The release still fails the
keyboard acceptance requirement described below.

No product code was changed during verification.

## Release-blocking findings

### High — the skip link does not bypass the header

On the live home page at 1440×900:

1. Pressing Tab once focuses the visible **Skip to content** link with a 3 px
   focus outline.
2. Pressing Enter changes the URL to `/#main` and scrolls the main landmark to
   the top.
3. `document.activeElement` is `BODY`, not the main content or its heading.
4. Pressing Tab again focuses **KRC Keyboard Route Check home**, the first
   header control. The keyboard user has not bypassed the repeated header.

The target `<main id="main">` is not focusable and the same-page hash path does
not move focus. This fails the required functional skip link and WCAG 2.4.1 in
a product made specifically for keyboard-only users. Evidence is recorded in
`evidence/verification-12/live-summary.json`.

## Mandatory first-read result

PASS. A cold visit says:

- what it does: **“Record the route your keyboard takes.”**
- who it is for: **“For keyboard users and web teams checking how focus moves
  through a page.”**
- what to do first: **“Try it with sample data,”** followed by **“See a route
  report right away.”**

The action is in the first viewport at desktop and 390 px. One click opens a
populated five-control report with invisible-focus, skip, and loop findings,
plus the persistent **Demo — sample data, nothing is saved to your real data**
banner, **Reset demo**, and **Start for real**. Evidence:
`evidence/verification-12/first-read-desktop.png`,
`first-read-mobile.png`, and `demo-after-one-click-mobile.png`.

## Claims gate

`.factory/claims.json` exists with 16 entries. After `npm ci`, every manifest
command was run separately against its declared demo or packed-extension entry
point. Every command selected one test and passed.

| Claim | Result |
| --- | --- |
| `route-data-local` | PASS — 1 passed |
| `report-export` | PASS — 1 passed |
| `demo-isolated` | PASS — 1 passed |
| `checkout-token-session-only` | PASS — 1 passed |
| `free-report-export` | PASS — 1 passed |
| `offline-recording` | PASS — 1 passed |
| `team-archive-local` | PASS — 1 passed |
| `team-archive-unavailable` | PASS — 1 passed |
| `focus-cycle-reporting` | PASS — 1 passed |
| `invisible-focus-reporting` | PASS — 1 passed |
| `browser-tab-order` | PASS — 1 passed |
| `skipped-control-reporting` | PASS — 1 passed |
| `reverse-tab-recording` | PASS — 1 passed |
| `popup-label-safety` | PASS — 1 passed |
| `license-transfer-handoff` | PASS — 1 passed |
| `license-check-destination` | PASS — 1 passed |

The live landing, demo, privacy, and terms copy and README were cross-checked
against the manifest. No material unlisted product claim was found.

## Clean local gates

- `npm ci`: passed; 176 packages installed, audit reported 0 vulnerabilities.
- `npm test`: passed, 12/12 unit tests.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- Exact `npm run build`: passed and produced `dist/site`,
  `.output/chrome-mv3`, and the extension ZIP.
- `npm run test:browser`: passed, 30/30 Playwright tests.
- `npm audit --omit=dev --audit-level=high`: passed, 0 vulnerabilities.
- `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip`: passed.
- `node scripts/verify-live.mjs https://keyboard-route-check.sociobot.in`:
  passed five routes, mobile, demo, and offline export checks.
- `/opt/fleet/lib/verify-url.sh` passed the live home and demo URLs with one
  h1, `lang=en`, a main landmark, complete image alternatives, named buttons,
  and no console errors. Evidence is under `evidence/verification-12/verify-*`.

## End-to-end and boundary coverage

The freshly built MV3 extension was loaded in a clean Chromium profile. A
normal Alpha → Beta → Gamma route preserved browser order and labels without a
finding. Independent scenarios also confirmed:

- a repeated forward route reports loop evidence;
- valid positive `tabindex` order does not create a false skip;
- controls without a visible focus treatment get an invisible-focus finding;
- markup-like accessible names remain text and do not inject popup controls;
- native radio, contenteditable, disabled/inert, true skip, and Shift+Tab
  boundaries pass in the full browser suite;
- empty and invalid license input produces specific recovery messages;
- recording and export work offline after loading;
- export excludes form values, page titles, URL credentials, queries, and
  fragments.

The popup had zero axe violations before and after recording, no console/page
errors, 44 px controls, and designed 3:1-or-better focus rings.

The live demo was operated using only the keyboard. Enter opened the demo,
Space reset it, Enter exported a five-step JSON report, and Enter on **Start for
real** removed demo storage and focused the home h1. Route navigation and Back
also focused the new h1. The separate skip-link defect remains as documented.

## Privacy and deployment evidence

The complete live landing → demo → reset → export → exit flow requested only
the same-origin HTML, JavaScript, CSS, and hero image. It made no analytics,
tracking, report-upload, or other external request and produced no console or
page error.

A fresh live checkout-return check removed the token from the URL, kept it only
in that tab's `sessionStorage`, wrote nothing to `localStorage`, and did not
show it in a second tab. `/?demo=1&license=...` discarded the token and created
only `demo:krc:sample-report`.

All 17 public candidate artifacts match live bytes. Key SHA-256 values:

- JavaScript: `7d254558e78390d508dce87a7378d03927ed698901a272f91e33ad9913afd5e7`
- CSS: `811ea8324dc98b982f595cb4a3a34e640d436a6bf32071144cada0e457d2f549`
- Extension ZIP: `8935373c457fdc9b9f13dcc1f3c0b6b74d5f2e48eb848fe07011376ec7d97bd1`

Evidence: `evidence/verification-12/deployment-match.json`.

## Accessibility, headers, caching, and budgets

Fresh axe 4.11 checks covered `/`, `/demo`, `/privacy`, `/terms`, and an
unknown route at 1440×900 and 390×844. There were zero serious or critical
findings and, in fact, zero axe findings of any impact. Normal layouts had no
horizontal overflow or sub-44 px visible control. All pages had one h1, one
main landmark, `lang=en`, ordered headings, and complete image alternatives.
Reduced motion left no active animation or transition. All crawled links
returned 200. At 200% text size, required copy remained readable and reflowed;
the unbreakable `chrome://extensions` token reached the viewport edge but
remained legible. The unknown URL returned the styled 404 with HTTP 404.

Home and legal responses send HSTS, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, and a self-first CSP with
`frame-ancestors 'none'`. HTML uses `public, must-revalidate, max-age=30`;
hashed JS/CSS use `public, max-age=31536000, immutable`.

Production payloads are 13,637 bytes JS (5,074-byte live transfer), 10,089
bytes CSS (2,922-byte transfer), 0 font bytes, and a 199,746-byte hero. They
pass the 200 KB JS, 50 KB CSS, 120 KB font, and 300 KB hero budgets.

Fresh mobile Lighthouse 12.8.2 scored Performance 100, Accessibility 100,
Best Practices 100, and SEO 100. FCP was 0.8 s, LCP 1.8 s, TBT 20 ms, CLS 0,
and total transfer 205 KiB. Evidence:
`evidence/verification-12/lighthouse-mobile.json`.

## Rate limiting

The Sociobot license verification endpoint accepted 30 rapid requests from
one client. Request 31 returned HTTP 429 with `Retry-After: 4`,
`x-ratelimit-after: 4`, and the correct product CORS origin. Evidence:
`evidence/verification-12/rate-limit.json`.

## Defects by severity

- Critical: none.
- High: functional skip link does not bypass repeated header content.
- Medium: none.
- Low: none.

## Not applicable

The product has no sign-in, product-owned backend/database, PWA service worker,
CLI, or library API. Entra authentication, backend concurrency/persistence,
PWA update/offline reload, and clean consumer-package checks do not apply. The
extension's MV3 service worker and offline recording were exercised.
