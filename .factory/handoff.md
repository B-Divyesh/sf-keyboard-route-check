# Keyboard Route Check — verification 9 handoff

## Status

**FAIL.** Independent verification of candidate
`1920479f083294894fd353e4abd972f3fbdc2b96` at
<https://keyboard-route-check.sociobot.in> found a release-blocking core
accuracy defect. The live deployment matches the candidate, all 14 declared
claim commands pass, and the first-read/demo gate passes, but ordinary native
Tab routes can be exported with false skipped-control findings.

No product code was changed. Full results are in
`.factory/verification-9.md`; fresh evidence is under
`.factory/verification-artifacts-9/`.

## Release blocker

The packed extension incorrectly predicts the next browser Tab stop for common
controls:

- A radio group with checked **One** and unchecked **Two** records the valid
  route `Before → One → After`, then falsely reports **“Expected Two; focus
  moved to After.”**
- A valid `Before → contenteditable Editor → After` route produces two false
  skip findings.

Both failures were reproduced again after the interrupted verification resumed,
using new Chromium profiles and the candidate's rebuilt MV3 extension.

`entrypoints/content.ts:142` uses a hand-built tabbable selector. It treats
every radio as a separate stop and omits implicit `contenteditable` stops.
This contradicts the core browser-order/skip promises and makes the route
artifact unreliable on normal interactive pages.

## Verification summary

- Fresh `npm ci`: 176 packages; 0 vulnerabilities.
- All 14 exact `.factory/claims.json` commands: passed, one test each.
- `npm test`: 12/12 passed; typecheck, lint, production audit, exact build,
  and ZIP integrity passed.
- `npm run test:browser`: 27/27 passed.
- The one-click demo, isolated/reset/discarded storage, JSON export, offline
  export after load, empty and invalid input recovery, privacy redaction,
  archive/license paths, and normal packed-extension route all worked.
- All five live routes passed desktop and 390px semantics, keyboard, focus,
  touch-target, reduced-motion, 200% text, console, axe, and link checks.
- All 17 served files and the extension ZIP byte-match the candidate build.
- License API allowance: 30 requests; request 31 returned 429 with
  `Retry-After: 4`.
- Fresh mobile Lighthouse: 99 performance, 100 accessibility, 100 best
  practices, 100 SEO; LCP 1.8 s, TBT 70 ms, CLS 0.

## Required next step

Implement browser-faithful sequential-focus rules, especially native radio
groups and implicit `contenteditable` controls. Extend the existing packed
`browser-tab-order` claim test to prove both valid routes produce no skip
finding, keep exactly one tagged test per claim, and rerun verification.

## Reproduce

```sh
npm ci
# Run every `test` string in .factory/claims.json separately.
npm test
npm run typecheck
npm run lint
npm audit --omit=dev --audit-level=high
npm run build
unzip -t .output/keyboard-route-check-1.0.0-chrome.zip
npm run test:browser
node scripts/verify-live.mjs
```
