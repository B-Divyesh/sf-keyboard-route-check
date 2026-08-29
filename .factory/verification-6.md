# Independent product verification 6 — PASS

**Candidate:** `45f701611a6cacffbb3f2c82374ad85c92d2d409`  
**Live URL:** https://keyboard-route-check.sociobot.in  
**Verified:** 2026-08-29 UTC

## Release decision

**PASS — acceptable for release.** Fresh local builds and tests passed, the
deployed companion site and unpacked MV3 extension match the candidate, and
independent live and packed-extension checks found no release-blocking defect.

## Required cold first read

**PASS.** A fresh, unauthenticated 1440×900 visit says “Record the route your
keyboard takes.” It names keyboard users and web teams, and presents “Try it
with sample data” with “See a route report right away.” One click opens
`/demo`, immediately showing a realistic five-stop booking route with three
findings. Its persistent banner says that it is demo sample data, nothing is
saved to real data, and gives Reset demo and Start for real controls.

## Claims gate — release blocking

`.factory/claims.json` exists. From a clean `npm ci` checkout, every declared
command was run separately and exactly as written; each selected one test and
passed. The subsequent full Playwright run also passed all 19 tests.

| Claim ID | Exact declared command | Result |
| --- | --- | --- |
| `route-data-local` | `npm run test:claims -- --grep @claim:route-data-local` | PASS — 1 test |
| `report-export` | `npm run test:claims -- --grep @claim:report-export` | PASS — 1 test |
| `demo-isolated` | `npm run test:claims -- --grep @claim:demo-isolated` | PASS — 1 test |
| `free-report-export` | `npm run test:claims -- --grep @claim:free-report-export` | PASS — 1 test |
| `team-archive-local` | `npm run test:claims -- --grep @claim:team-archive-local` | PASS — 1 test |
| `team-archive-unavailable` | `npm run test:claims -- --grep @claim:team-archive-unavailable` | PASS — 1 test |
| `focus-cycle-reporting` | `npm run test:claims -- --grep @claim:focus-cycle-reporting` | PASS — 1 test |
| `invisible-focus-reporting` | `npm run test:claims -- --grep @claim:invisible-focus-reporting` | PASS — 1 test |
| `browser-tab-order` | `npm run test:claims -- --grep @claim:browser-tab-order` | PASS — 1 test |
| `popup-label-safety` | `npm run test:claims -- --grep @claim:popup-label-safety` | PASS — 1 test |
| `license-transfer-handoff` | `npm run test:claims -- --grep @claim:license-transfer-handoff` | PASS — 1 test |

Landing and README claims cross-check to the registered local/redaction,
export, demo, archive, availability, loop, focus, tab order, popup-label, and
license-handoff tests.

## Clean local quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 401 packages installed from the lockfile |
| `npm test` | PASS — 12 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:browser` | PASS — 19 tests; `test-results/.last-run.json` is `passed` |
| `npm run build` | PASS — MV3 directory, ZIP, and `dist/site` produced |
| `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip` | PASS — no archive errors |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 production vulnerabilities |

The complete suite exercises real packed-MV3 recording, stop/clear/export,
form-value/query/fragment redaction, reverse direction, two-control cycles,
positive `tabindex`, invisible and valid fill focus treatments, hostile labels,
popup focus contrast, invalid/offline license recovery, archive save, returned
license transfer, demo isolation, sample export, keyboard use, mobile, and
reduced motion.

## Live evidence

- SHA-256 comparisons matched fresh candidate output for the live HTML, JS,
  CSS, images, robots, and sitemap. The live ZIP's container metadata differs,
  but `diff -qr` of both unzipped packages was empty: deployed MV3 contents
  match this candidate.
- `/`, `/demo`, `/privacy`, `/terms`, and the extension ZIP returned 200. An
  unknown route returned the styled 404 with a real 404 response. All public
  same-origin links resolved.
- A fresh Playwright log across cold load, demo entry/export/reset/exit used
  only `https://keyboard-route-check.sociobot.in`. There were no trackers,
  third-party scripts/fonts, or route-report requests. Demo stored exactly
  `demo:krc:sample-report`; reset retained it and Start for real removed it.
- The exported demo has five ordered label/role stops, no form value, and
  `invisible-focus`, `skip`, and `loop` findings.
- Live headers include HSTS, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and response-header CSP
  with `frame-ancestors 'none'`. HTML has 30-second revalidation; hashed JS/CSS
  are one-year immutable.
- At desktop and 390px, `/`, `/demo`, `/privacy`, `/terms`, and the 404 had
  one `h1`, one `main`, no horizontal overflow, and zero axe serious/critical
  findings. Landing keyboard traversal reached each control without a trap
  with a visible 3px ring. Controls were not undersized at 390px. Reduced
  motion computed demo transitions and animations to `0s`.
- Mobile Lighthouse 12.8.2 on the live landing: **100 performance, 100
  accessibility, 100 best practices, 100 SEO**; FCP 0.8 s, LCP 1.8 s, TBT 0
  ms, CLS 0. Built initial JS is 11,017 bytes (4.24 KB gzip), CSS 8,903 bytes
  (2.59 KB gzip), and hero 199,746 bytes: all budgets pass.

## Rate-limit boundary

The extension's Sociobot license verification endpoint received 35 invalid
token requests from one client. Requests **1–30** returned 200; **31–35**
returned **429**. The first 429 had `Retry-After: 3` and `x-ratelimit-after:
3`. Observed allowance: **30 requests per client window**. There is no
sign-in, PWA service worker, or separate product backend.

## Defects by severity

- **Critical:** none.
- **High:** none.
- **Medium:** none.
- **Low / non-blocking:** clean `npm ci` reports ten development-only tooling
  advisories (1 low, 2 moderate, 4 high, 3 critical). The production audit is
  clean; this is dependency-hygiene follow-up, not a shipped-product defect.

## Scope note

No product source was changed. The only browser console resource message was
the browser's expected message for the intentionally requested HTTP-404 page;
normal public routes and demo flows had no console or page errors.
