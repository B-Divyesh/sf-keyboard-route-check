# Independent verification 11 — Keyboard Route Check

## Verdict: PASS

Verified candidate commit `63b710c8e02daf0581ece7d9c3d468e68231a113`
against <https://keyboard-route-check.sociobot.in> on 2026-08-29 UTC. This is
an MV3 browser extension with a static companion site. No product code was
changed during verification.

The earlier deployment-only concern is not present. All 17 normally served
files in the candidate's fresh production build byte-match the live site. The
hosting-only `staticwebapp.config.json` is consumed by the platform and is
correctly not public.

- JavaScript SHA-256: `bc7de74cf9e993d3f6b243b6c65c0cccaec585f7bfa941612f21ccc719442e44`
- CSS SHA-256: `811ea8324dc98b982f595cb4a3a34e640d436a6bf32071144cada0e457d2f549`
- Extension ZIP SHA-256: `8935373c457fdc9b9f13dcc1f3c0b6b74d5f2e48eb848fe07011376ec7d97bd1`

Evidence: `qa-evidence-11/deployment-match.json`.

## Mandatory first-read result

PASS. A cold desktop visit says **“Record the route your keyboard takes.”** It
names keyboard users and web teams checking focus movement. The visually
primary **“Try it with sample data”** action is in the first viewport, beside
**“See a route report right away.”** One click opens the populated isolated
demo without setup or an account. The three first-screen facts cover price,
privacy, and offline behavior in plain words.

Evidence: `qa-evidence-11/live-cold-desktop.png` and
`qa-evidence-11/live-mobile-home.png`.

## Claims gate

`.factory/claims.json` exists with 15 entries. After `npm ci`, I ran every
listed `test` command separately, from the repository's packed-extension or
site demo entry point. Each selected exactly one test and passed.

| Claim ID | Result |
| --- | --- |
| `route-data-local` | PASS — 1 passed |
| `report-export` | PASS — 1 passed |
| `demo-isolated` | PASS — 1 passed |
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

The live landing, privacy and terms pages and README were cross-checked against
the manifest. Their functional, privacy, offline, route-detection, export,
license, and archive statements are represented by these claims. No unlisted
product claim was found.

## Clean local release gates

- `npm ci`: passed; 176 packages installed and 0 vulnerabilities reported.
- `npm test`: passed, 12/12 unit tests.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- Exact `npm run build`: passed; produced `.output/chrome-mv3`, the extension
  ZIP, and `dist/site`.
- `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip`: passed, 16 files.
- `npm run test:browser`: passed, 29/29 tests.
- `npm audit --omit=dev --audit-level=high`: passed, 0 vulnerabilities.

The browser suite covers real packed-MV3 recording, rapid storage updates,
normal and positive-tabindex order, radio groups, contenteditable, disabled and
inert controls, forward cycles, skips, Shift+Tab recovery, visible and missing
focus treatments, label safety, local license recovery, offline recording,
downloads, desktop/mobile accessibility, demo isolation, routes and headers.

Evidence: `qa-evidence-11/local-gates.log`.

## Independent end-to-end checks

I downloaded the live ZIP, extracted it, and loaded it into a new Chromium
profile. A real keyboard route through input → button → Privacy → Terms
recorded four unique controls in browser order. The export matched storage and
contained the labels, roles, directions, focus state, and safe page path. It
contained no typed value, page title, query value, fragment, false loop/skip,
or external request.

The live one-click demo showed its persistent sandbox banner and five-stop
booking route. Its JSON export contained the expected invisible-focus, skip,
and loop findings. Reset recreated only `demo:krc:sample-report`; Start for real
removed it. The whole flow requested only the same-origin document, hashed JS,
CSS, and hero image. There were no analytics, tracker, console, or page errors.

Representative boundary and recovery coverage included positive `tabindex`,
native radio groups, implicit contenteditable, disabled/inert controls,
transparent focus outlines, wrapper `:focus-within`, forced skips, repeated
forward routes, ordinary reverse navigation, empty/invalid licenses, retained
licensed access while offline, markup-like labels, and demo reset/exit.

Evidence: `qa-evidence-11/live-extension.json` and
`qa-evidence-11/live-independent-audit.json`.

## Accessibility, responsive behavior, and privacy

Fresh Playwright and axe 4.11 checks covered `/`, `/demo`, `/privacy`,
`/terms`, and `/404` at 1440×900 and 390×844:

- zero serious or critical axe findings;
- one h1, `lang=en`, one main landmark, ordered headings, and complete image
  alternatives on every route;
- no horizontal overflow, missing labels, or visible control below 44×44 px;
- keyboard traversal reached every control, wrapped without a trap, and showed
  a designed 3 px focus outline; route navigation and Back focused the new h1;
- the first focused skip link was visible and skipped to the main sequence;
- reduced motion left no non-zero animation or transition;
- at 200% text size there was no horizontal overflow or clipped visible
  control, and the focused skip link remained fully visible;
- the live request log stayed same-origin throughout the complete demo flow.

`/opt/fleet/lib/verify-url.sh` passed both `/` and `/?demo=1`: HTTP 200,
route title, language, one h1, main landmark, image alternatives, button names,
and zero browser errors. `node scripts/verify-live.mjs` also passed five routes,
the demo lifecycle, mobile layout, offline export, and console checks.

Evidence: `qa-evidence-11/live-independent-audit.json`,
`qa-evidence-11/live-mobile-text-200.png`, and the `verify-home` / `verify-demo`
directories.

## Headers, caching, budgets, and rate limiting

- `/` and `/demo` return 200. An unknown URL returns the styled page with HTTP
  404. Every crawled internal and external link returned 200.
- Responses send HSTS, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and a self-only CSP with
  `frame-ancestors 'none'`; only the documented Sociobot API is allowed by
  `connect-src`.
- HTML uses `public, must-revalidate, max-age=30`; hashed JS/CSS use
  `public, max-age=31536000, immutable`.
- Initial JS is 13,582 bytes (5,043 gzip), CSS is 10,089 bytes (2,853 gzip),
  fonts are 0 bytes, and the hero is 199,746 bytes. All supplied budgets pass.
- Mobile Lighthouse 12.8.2: Performance 99, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.8 s, LCP 1.8 s, TBT 20 ms, CLS 0, total transfer 205 KiB.
- The Sociobot license verification endpoint allowed 30 rapid requests from
  one client. Request 31 returned 429 with `Retry-After: 4`,
  `x-ratelimit-after: 4`, and the correct product CORS origin.

Evidence: `qa-evidence-11/lighthouse-mobile.json` and
`qa-evidence-11/rate-limit.json`.

## Defects by severity

No critical, high, medium, or low defects were found.

## Not applicable

The product has no sign-in, product-owned backend/database, PWA service worker,
CLI, or library consumer API. Entra authentication, backend concurrency and
persistence, PWA update/offline reload, and consumer-package checks do not
apply. The extension's MV3 service worker and offline behavior were exercised.
