# Independent verification 14 — Keyboard Route Check

## Verdict: PASS

Candidate commit `9c06aa5efd0373784ab238138654239419d68f2f` was independently verified on
2026-08-29 UTC against <https://keyboard-route-check.sociobot.in>. The deployed
website assets and downloadable MV3 ZIP byte-match a fresh production build of
this commit. No product code was changed during verification.

Defects: critical 0, high 0, medium 0, low 0.

## First-read and demo gate

PASS on a cold desktop page and a cold 390 × 844 page.

- What it does: “Record the route your keyboard takes.”
- For whom: “For keyboard users and web teams checking how focus moves through a page.”
- First action: “Try it with sample data”; adjacent text says “See a route report right away.”

The action is visible on the first screen and opens `/?demo=1` in one click.
It immediately shows a five-control booking-page route and loop, skip, and
invisible-focus findings. The persistent demo banner says that nothing is saved
to real data, exposes Reset demo and Start for real, and stays within the 390px
layout without horizontal overflow.

## Claims gate

`.factory/claims.json` is present with 17 entries. After fresh `npm ci`, every
exact declared `test` command was invoked separately against its stated demo or
packed-MV3 entry point. The complete browser suite then passed 32/32, including
all 17 tagged claim tests. Each claim tag appears exactly once in the browser
tests.

| Claim | Result |
| --- | --- |
| `route-data-local` | PASS |
| `report-export` | PASS |
| `demo-isolated` | PASS |
| `checkout-token-session-only` | PASS |
| `free-report-export` | PASS |
| `offline-recording` | PASS |
| `license-check-online` | PASS |
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

Landing, demo, privacy, terms, and README copy were cross-checked against this
manifest. The user-facing privacy, export, offline, archive, focus-warning, and
demo promises have matching claim coverage; no material unlisted claim was
found.

## Local quality gates

- `npm ci`: PASS; 176 packages installed, audit reported 0 vulnerabilities.
- `npm test`: PASS, 12/12.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; produced `dist/site`, `.output/chrome-mv3`, and
  `.output/keyboard-route-check-1.0.0-chrome.zip`.
- `npm run test:browser`: PASS, 32/32.
- `npm audit --omit=dev --audit-level=high`: PASS, 0 vulnerabilities.
- `unzip -t` on both local and live ZIP: PASS.

## End-to-end product and recovery checks

A newly built packed MV3 extension was loaded in a fresh Chromium profile and
used on a real local fixture page. It recorded focused input, button, and link
controls; retained labels, roles, order, and safe origin/path; removed a query
secret and page fragment; made no external report request; and showed the
expected “Paste your license token first.” recovery text for empty license
input. Clear route returned to its empty-state guidance. The complete browser
suite also passed normal, positive-tabindex, radio-group, contenteditable,
disabled/inert, cycle, true-skip, reverse-Tab, invisible-focus, offline, and
license-verification cases.

The live demo exported `sample-keyboard-route-report.json`, reset its demo-only
storage key, and removed it when Start for real was selected. The supplied live
verifier passed route history/focus, demo isolation, returned-token session
boundary, offline demo export, legal routes, mobile, and real HTTP 404.

## Privacy, deployment, headers, and performance

A fresh Playwright cold landing → sample-demo request log contained only the
product document, JS, CSS, and self-hosted hero image. No analytics, tracker,
report upload, third-party font, or other third-party request occurred.

Live response headers include HSTS, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, and a self-only CSP with
only `https://api.sociobot.in` allowed for license verification. HTML, hero,
and ZIP use a 30-second revalidation cache; hashed JS/CSS use
`max-age=31536000, immutable`.

The local and live extension ZIP SHA-256 values both equal
`31256c248ed67f1b626df6bfa9d5070e698dbcab227b73af376da5c718f84832`.
The live `main-C6MMMnku.js` matches the local fresh build with SHA-256
`49c481fc0c3888e42c63fa74e0b112693c82277d7328a6f75148738ec43c7ccc`.
Initial JS is 13,643 bytes (about 5.0 KB gzip); CSS is 10,164 bytes (about
2.85 KB gzip); no web fonts load; hero is 199,746 bytes. All stated budgets
pass.

Fresh mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
100, SEO 100; FCP 0.8 s, LCP 1.8 s, TBT 0 ms, CLS 0.

## Accessibility and special applicability checks

`/opt/fleet/lib/verify-url.sh` passed both live `/` and `/?demo=1`: HTTP 200,
title, `lang`, one h1, main landmark, complete image alternatives, named
buttons, and no console/page errors. Axe 4.11 scans at desktop and 390px mobile
for `/`, `/?demo=1`, `/privacy`, `/terms`, and `/404` found zero serious or
critical violations (ten scans). Keyboard Tab reached the skip link and every
site/demo control; the visible focus outline is 3px. Reduced motion sets
transitions to 0s and removes figure transforms.

All crawled local and external footer links returned 200. There is no sign-in,
PWA, backend persistence surface, CLI, or consumer package, so those checks do
not apply. This is an MV3 browser extension, not a PWA; its extension service
worker is exercised by the packed-extension browser tests.

The only server-side product call is license verification. A fresh single-client
35-request invalid-token burst received 30 × 200, then 5 × 429. Every 429 had
`Retry-After: 4` and `x-ratelimit-after: 4`. Observed allowance: **30 rapid
requests per client**.
