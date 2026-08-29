# Independent verification 10 — Keyboard Route Check

## Verdict: PASS

Verified candidate commit `d0d466dcf81c243ebfe75bf65561b1e7e65a6565` against
<https://keyboard-route-check.sociobot.in> on 2026-08-29 UTC. This is an MV3
browser extension with a static companion site.

The deployed site and its downloadable extension match this candidate exactly:

- `assets/main-BDImKD60.js`: local/live SHA-256
  `e9f99a23a8a362f1fd561860830d011c0e1c068b9c8061bd237cfca59ca6dad9`
- `assets/main-BS7_Ez12.css`: local/live SHA-256
  `ec6a5de92a6b7d02a187a1ac13f7b829d79c9415b6ce57a727e40924ab8d79d5`
- `downloads/keyboard-route-check.zip`: local/live SHA-256
  `2d62bbe612274fcb222bf63bcf4c046dc222c802917f98256d7e85d51e51a4d5`

## Cold first-read result

PASS. A fresh desktop and 390 px visit says: **“Record the route your keyboard
takes.”** It identifies the audience as keyboard users and web teams needing
proof before a focus defect reaches production. The first action is the visible
one-click **“Try it with sample data”**, followed by **“See a route report
right away.”** The action opens the isolated report without an account.

## Claims gate

`.factory/claims.json` exists and contains 14 claims. After `npm ci`, I ran
every exact `test` command from it separately; all passed. Each test uses the
product's local demo or packed MV3 extension entry point. The command output
for every row reported `1 passed`.

| Claim ID | Result | Evidence |
| --- | --- | --- |
| `route-data-local` | PASS | `tests/browser/extension.spec.ts`, packed MV3 route/export privacy test |
| `report-export` | PASS | same packed-MV3 observable download test |
| `demo-isolated` | PASS | `tests/browser/site.spec.ts`, isolated `/?demo=1` storage/reset/exit test |
| `free-report-export` | PASS | same site suite, unauthenticated sample download |
| `team-archive-local` | PASS | packed-MV3 local archive test |
| `team-archive-unavailable` | PASS | landing and terms availability/no-checkout test |
| `focus-cycle-reporting` | PASS | packed-MV3 Alpha → Beta → Alpha route test |
| `invisible-focus-reporting` | PASS | packed-MV3 transparent-focus fixture test |
| `browser-tab-order` | PASS | packed-MV3 positive-tabindex, radio, editable, disabled/inert fixtures |
| `skipped-control-reporting` | PASS | packed-MV3 Alpha → Gamma expected-Beta test |
| `reverse-tab-recording` | PASS | packed-MV3 Shift+Tab recovery test |
| `popup-label-safety` | PASS | packed-MV3 markup-label text-safety test |
| `license-transfer-handoff` | PASS | returned-token to extension verification handoff test |
| `license-check-destination` | PASS | request-log assertion for only Sociobot verify endpoint |

The initial uninstalled checkout naturally could not import `@playwright/test`;
the required clean-install verification used `npm ci` and all 14 claim commands
then passed. No claim test failed after dependencies were installed.

## Local quality gates

- `npm ci`: 176 packages installed; 0 vulnerabilities reported.
- `npm test`: 12/12 unit tests passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed and produced `.output/chrome-mv3`, the extension ZIP,
  and `dist/site`.
- `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip`: 16 files, no
  errors.
- `npm run test:browser`: 27/27 passed in the final clean run. This exercises
  packed MV3 recording/export, normal routes, positive tabindex, radio-group,
  contenteditable, disabled/inert, cycle/skip/reverse invalid routes, privacy
  redaction, popup markup safety, license recovery, desktop/mobile accessibility,
  offline demo export, reduced motion, routes, and response policy.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.

## Live end-to-end, privacy, and accessibility checks

Fresh Playwright checks on both 1280 px and 390 px completed the one-click
demo flow: banner visible, only `demo:krc:sample-report` storage in demo,
Reset demo restores only that key, Start for real clears it, and the sample
JSON download contains ordered controls and the three expected findings.

- The live demo's request log contained only the companion-site origin:
  document, same-origin JS/CSS/hero, and intentional same-origin route loads.
  No analytics or report request occurred.
- No console errors or page errors occurred.
- Axe found zero serious or critical findings on `/`, `/demo`, `/privacy`, and
  `/terms` at desktop and 390 px.
- Keyboard-only smoke test: the first Tab focuses the visible skip link;
  route navigation moves focus to the destination h1. The browser suite also
  verifies every public focus ring reaches 3:1 contrast and controls meet the
  44 px target baseline at 390 px.
- With `prefers-reduced-motion: reduce`, report transition duration is `0s`.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, 605 ms load, title, `lang`,
  one h1, main landmark, zero images missing alt, zero unlabeled buttons, and
  zero browser errors. `node scripts/verify-live.mjs` also passed with five
  routes, mobile demo, and offline export.

## Deployment headers, caching, performance, and rate limiting

- `/` and `/demo` return 200; an unknown route returns a real 404.
- Production sends HSTS, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and a self-only CSP with
  `frame-ancestors 'none'`; the only permitted external connection is the
  documented Sociobot API.
- Hash-named JS and CSS use `Cache-Control: public, max-age=31536000,
  immutable`. Initial JS is 13,161 bytes (4.88 KB gzip); CSS is 9,363 bytes
  (2.70 KB gzip), within the static-product budgets. The 199,746-byte hero is
  below the 300 KB mobile image budget.
- The only server-side product endpoint is the Sociobot license verification
  API. From one client with an invalid token, requests 1–30 returned 200 with
  an invalid verdict; request 31 returned `429` with `Retry-After: 3` and
  `x-ratelimit-after: 3`. Observed allowance: 30 requests per active window.

## Defects by severity

No release-blocking, high, medium, or low defects found. The previously
reported deployment-only concern is not reproduced: live assets and the live
extension ZIP are byte-identical to this candidate's production build.

## Not applicable

This product has no sign-in, backend-owned persistence, PWA/service worker,
CLI/library consumer API, payment checkout, or external analytics surface.
