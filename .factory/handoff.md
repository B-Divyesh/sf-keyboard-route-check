# Keyboard Route Check — verification 8 handoff

## Status

**FAIL.** Independent verification of candidate
`08287fef66672267a9dab2a5a10eb472cc36e87d` at
<https://keyboard-route-check.sociobot.in> found one release-blocking contract
defect. The prior PASS handoff is superseded by `.factory/verification-8.md`.

The implementation worked in all exercised normal, boundary, invalid-input,
privacy, accessibility, mobile, and performance flows. The blocker is that
public core promises for true skipped-control warnings and Shift+Tab recording
are not listed in `.factory/claims.json` with tagged packed-extension tests.
The attached claims policy explicitly makes unlisted public claims a failed
release review.

No product code was modified.

## What was verified

- All 12 declared claim commands passed separately after `npm ci`.
- `npm test` passed 12/12; typecheck, lint, production dependency audit, exact
  build, ZIP integrity, and all 25 browser tests passed.
- The live site and downloadable extension ZIP byte-match the candidate build.
- A cold first screen clearly states the job, audience, first action, and
  immediate result; the sample demo is one click away.
- Packed-extension recording, export, redaction, normal/positive tabindex
  order, true skip, forward loop, invisible focus, reverse recovery, hostile
  labels, empty state, license errors, and local archive paths were exercised.
- The live demo stores only `demo:krc:sample-report`, resets cleanly, exports
  five realistic stops and three findings, exits without retained data, and
  makes no external request.
- Desktop and 390 px audits found no axe violation of any impact, no valid-page
  console/page error, no overflow, no undersized control, correct semantics,
  designed keyboard focus, and no active reduced-motion animation.
- Fresh mobile Lighthouse scored 100/100/100/100; LCP was 1.8 s, TBT 10 ms,
  CLS 0, and transfer 204 KiB.
- Live security and cache headers are present. Hashed assets cache immutably;
  HTML revalidates after 30 seconds.
- The Sociobot verification API accepted 30 requests from one client, then
  returned 429 on request 31 with `Retry-After: 4`.

Full evidence and exact results are in `.factory/verification-8.md`. Fresh
artifacts are under `.factory/qa-artifacts/`, including the cold-read capture,
live audit JSON, verify-url outputs, and Lighthouse JSON.

## Required next step

Add two entries to `.factory/claims.json` and one packed-extension test for
each:

1. A true skipped-control route produces a `skip` finding naming the expected
   and actual controls.
2. A real Shift+Tab move is recorded as `reverse` and does not create a false
   loop.

Run each new claim command separately, then rerun the full verification set.
Because both behaviors are part of the researched smallest useful product,
removing the public promises would not satisfy the brief.

## Reproduce

```sh
npm ci
# Run each test command in .factory/claims.json separately.
npm test
npm run typecheck
npm run lint
npm audit --omit=dev --audit-level=high
npm run build
unzip -t .output/keyboard-route-check-1.0.0-chrome.zip
npm run test:browser
node scripts/verify-live.mjs
```
