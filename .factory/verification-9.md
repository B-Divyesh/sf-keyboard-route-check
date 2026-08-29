# Independent verification 9 — FAIL

**Candidate:** `1920479f083294894fd353e4abd972f3fbdc2b96`  
**Verified:** 2026-08-29 UTC  
**Live URL:** <https://keyboard-route-check.sociobot.in>  
**Work order:** `keyboard-route-check-verify-9`

## Release decision

**FAIL.** The deployment matches the candidate, the required first-read gate
passes, and every declared claim test passes. However, the packed extension
reports false skipped-control defects during ordinary browser Tab behavior on
two common control patterns: native radio groups and `contenteditable`
controls. A product whose core job is to turn a manual keyboard route into
reviewable evidence cannot ship when valid routes are labeled as defects.

No product code was changed during verification.

## Required first read

**PASS.** A fresh 1440×900 visit showed, before scrolling:

- What it does: **“Record the route your keyboard takes.”**
- Who it is for: **“For keyboard users and web teams who need proof before a
  focus defect reaches production.”**
- What to do first: **“Try it with sample data”**, with the immediate outcome
  **“See a route report right away.”**

The one-click action entered demo mode and immediately showed a realistic
five-stop booking-page route with invisible-focus, skip, and loop findings.
The persistent banner said **“Demo — sample data, nothing is saved to your real
data”** and exposed **Reset demo** and **Start for real**.

Evidence: `verification-artifacts-9/live-cold-first-read.json` and
`live-cold-desktop.png`.

## Claim contract

`.factory/claims.json` exists, is valid JSON, and contains 14 claims. After a
fresh `npm ci`, every listed command was run separately. Each selected exactly
one tagged Playwright test and passed:

| Claim | Result |
| --- | --- |
| `route-data-local` | PASS — 1 passed |
| `report-export` | PASS — 1 passed |
| `demo-isolated` | PASS — 1 passed |
| `free-report-export` | PASS — 1 passed |
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

Every `@claim:<id>` tag occurs exactly once. Public copy and README claims map
to the listed privacy, export, demo, route-finding, archive, or license claims;
no additional unlisted product claim was found. Passing the declared claims
does not override the independent core-behavior defect below.

## Release-blocking defect

### High — valid native Tab routes produce false skip findings

The recorder's predicted tabbable list is not browser-equivalent. It includes
every enabled radio input as a separate Tab stop, although a same-name native
radio group contributes one Tab stop. It also omits an implicitly focusable
`contenteditable` control. Both cause normal focus movement to be exported as
a skip defect.

Fresh packed-MV3 reproductions:

1. Page controls: **Before** button, checked **One** radio, unchecked **Two**
   radio in the same `name="plan"` group, and **After** button.
2. Press Record and Tab three times.
3. The browser and report both record `Before → One → After`, but the report
   adds: **“Expected Two; focus moved to After.”** No control was skipped in
   the browser's route.

Evidence: `verification-artifacts-9/radio-group-boundary.json`.

A second page with **Before → contenteditable Editor → After** records the
correct three focused elements but adds two false findings:

- **“Expected After; focus moved to Editor.”**
- **“Expected Before; focus moved to After.”**

Evidence: `verification-artifacts-9/contenteditable-boundary.json`.

Both cases were repeated after the interrupted run resumed, using new Chromium
profiles and the rebuilt `.output/chrome-mv3` extension. The results were
identical, so this is not stale profile state or a deployment-only failure.

The source of the mismatch is the hand-built selector in
`entrypoints/content.ts:142`: it enumerates all non-attribute-disabled inputs
and explicit `[tabindex]` elements, without native radio-group rules or
implicit `contenteditable` stops. This violates the researched core job and
the promises that the product records browser Tab order and warns when an
actual Tab move skips the next control.

### Medium — claim coverage permits the false positives

`browser-tab-order` covers positive `tabindex` ordering only, while
`skipped-control-reporting` forces a genuine synthetic skip. Neither checks
that common valid browser routes produce no skip finding. Extend the existing
single `browser-tab-order` claim test with native radio-group and
`contenteditable` cases, and retain one tagged test per claim.

## What passed

### Clean install, tests, and production build

- `npm ci`: 176 packages installed; 0 vulnerabilities.
- `npm test`: 12/12 unit tests passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- Exact `npm run build`: passed; produced `.output/chrome-mv3`, the Chrome
  extension ZIP, and `dist/site`.
- `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip`: passed.
- `npm run test:browser`: 27/27 passed.
- `node scripts/verify-live.mjs`: passed.

Evidence: `verification-artifacts-9/local-gates.log`, `browser-test-list.txt`,
and `verify-live.log`.

### Independent extension exercise

A fresh persistent Chromium profile loaded the rebuilt unpacked MV3 extension.
On a normal page it recorded `License token → Verify license → Privacy →
Terms`, assigned four unique identifiers, produced no finding, and exported
the same order. A typed secret, query value, and fragment were absent from the
report. Recording made no external request.

The popup's empty state, export, clear-to-empty state, missing-license error,
invalid-license recovery, and hostile-label rendering were exercised. The
full suite additionally passed real forward loop, transparent-focus,
background and `:focus-within` focus styles, positive `tabindex`, genuine
skip, Shift+Tab recovery, local archive, transfer, and cached-offline-license
paths. Popup axe found no serious or critical issue and produced no
console/page error.

Evidence: `verification-artifacts-9/independent-extension.json`.

### Demo, privacy, and error recovery

- Demo storage contained only `demo:krc:sample-report`; Reset recreated only
  that key and Start for real left storage empty.
- Export downloaded `sample-keyboard-route-report.json` with five stops and
  the three advertised finding kinds.
- The demo/export/reset/exit flow made only same-origin requests and had no
  console/page errors. Export also worked after the loaded page went offline.
- An unknown live URL returned the styled page with HTTP 404.
- All 47 links across `/`, `/demo`, `/privacy`, `/terms`, and `/404` resolved;
  fragment targets existed.
- Cold landing requests were limited to the same-origin document, JS, CSS,
  and hero image. There were no analytics, trackers, CDN scripts, or CDN fonts.

Evidence: `verification-artifacts-9/live-independent-audit.json` and
`link-crawl.json`.

### Accessibility, keyboard, mobile, and motion

Fresh Playwright + axe 4.11 audits covered `/`, `/demo`, `/privacy`, `/terms`,
and `/404` at 1440×900 and 390×844:

- zero axe violations at any impact;
- correct `lang=en`, route title, one `h1`, one `main`, ordered headings, and
  complete image alternatives;
- no valid-route console/page errors or horizontal overflow;
- no visible control smaller than 44×44 CSS px;
- all 13 landing controls reachable by keyboard with a designed 3px focus
  outline;
- the skip link is first, moves the viewport to `main`, and the next Tab lands
  on the sample-data action;
- reduced motion leaves no non-zero animation or transition duration;
- 200% root text size causes no clipped content or horizontal overflow, and
  the focused skip link remains visible.

The factory URL verifier also passed `/` and `/?demo=1`: HTTP 200, title,
language, one heading, main landmark, image alternatives, labeled buttons,
and zero errors.

Evidence: `verification-artifacts-9/live-independent-audit.json`,
`text-resize-200.json`, and `verify-url-*/verify.json`.

### Deployment identity, headers, rate limit, and performance

- All 17 normally served files in `dist/site` byte-match the live response.
  The live and rebuilt extension ZIPs also byte-match:
  `f0889eae2febd178a5b93b29bcdc84d480ce1558e99afc077f42cd13f503a2bf`.
- HTML uses `public, must-revalidate, max-age=30`; hashed JS/CSS use
  `public, max-age=31536000, immutable`.
- Live headers include HSTS, `nosniff`, strict-origin referrer policy, and a
  CSP limited to self plus the documented Sociobot API, with
  `frame-ancestors 'none'`.
- The license-verification endpoint allowed 30 rapid requests from this
  client. Request 31 returned HTTP 429 with `Retry-After: 4` and
  `x-ratelimit-after: 4`. CORS allowed the requesting product origin.
- Fresh mobile Lighthouse 12.8.2 completed successfully: Performance 99,
  Accessibility 100, Best Practices 100, SEO 100, FCP 0.8 s, LCP 1.8 s,
  TBT 70 ms, CLS 0, total transfer 204 KiB.
- Site JS is 13,161 bytes (4.90 KB gzip), CSS is 9,363 bytes (2.72 KB gzip),
  fonts are 0 bytes, and the hero WebP is 199,746 bytes. All stated budgets
  pass.

Evidence: `verification-artifacts-9/deployment-match.json`,
`live-headers.txt`, `rate-limit.json`, and `lighthouse-mobile-clean.json`.

## Visual and documentation review

The cassette-era field-tape design matches `.factory/design.md`: warm paper,
ink outlines, acid-lime focus marks, signal-red findings, local system type,
and original cassette art. Desktop and mobile compositions are distinct and
legible. `.factory/copy-audit.md` has no sentence over 22 words or banned term.
README, MIT LICENSE, privacy, terms, demo documentation, robots, sitemap,
social card, favicons, and deployment instructions are present.

## Not applicable

This is a browser extension with a static companion site. It has no sign-in,
product backend/database, library or CLI consumer surface, or PWA service
worker. Entra, backend concurrency/persistence, package-consumer, and PWA
update checks do not apply. Its MV3 extension service worker was exercised by
the packed-extension tests.

## Required repair and rerun

Replace or extend `tabbables()` with browser-faithful sequential-focus rules,
including radio-group membership, implicit `contenteditable` controls,
disabled/inert states, and other native focusability rules. Add packed-MV3
regressions proving that ordinary radio-group and contenteditable routes have
no skip findings, then rerun every claim command and the complete verification
set.
