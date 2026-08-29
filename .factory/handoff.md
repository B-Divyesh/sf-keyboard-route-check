# Keyboard Route Check — adversarial review 4 handoff

## Status: FAIL (one minor finding)

Review-only work completed on 2026-08-29 UTC. Product code was not changed. The review and two cold live screenshots are committed with this handoff.

## What was verified

- Fresh live Chromium contexts at 390×844 and 1440×900 established that the first screen explains the job, audience, and first action before scrolling.
- The isolated demo was checked with normal entry and `?demo=1&license=...`: only `demo:krc:sample-report` was written, Reset recreated it, Start for real discarded it, and real storage remained untouched.
- Request logs stayed same-origin through the cold/demo flow; the sample exported while offline after load.
- A clean clone at `/tmp/krc-review4-clean` passed `npm ci`, `npm test` (12/12), typecheck, lint, all 16 exact declared claim commands, the complete browser suite (31/31), build, and ZIP integrity validation.
- The production verifier passed its route, mobile, offline, demo, focus, storage, console, and axe checks. All site links and the external footer link returned 200; unknown routes returned the designed HTTP 404.
- Every prior review finding F-1-1 through F-3-3 was verified fixed in both live behavior and implementation.

## Remaining finding

`F-4-1` in `.factory/review-4.md` is the only remaining issue. The landing states that phone Chrome cannot run the extension and the landing/README state that license checks need a connection, but neither has a `.factory/claims.json` entry with a tagged observable test. Add a license-offline failure claim or remove that sentence; replace the phone compatibility assertion with the actionable desktop-install instruction unless a supported-device test is added.

## Re-run

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:browser
node scripts/verify-live.mjs https://keyboard-route-check.sociobot.in
```

Also run each exact `test` command in `.factory/claims.json` separately from a clean profile.
