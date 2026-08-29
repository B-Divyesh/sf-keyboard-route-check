# Keyboard Route Check — review 3 handoff

## Status: FAIL

Completed adversarial first-read review 3 against candidate
`fcbc238273b9e0986cffd5cd39cce31823e16e76` and the live deployment on
2026-08-29 UTC. No product code was changed. The complete findings and copy
audit are in `.factory/review-3.md`.

## Verified

- The cold first screen passes at 390 × 844 and 1440 × 900.
- The ordinary one-click demo is populated, resets, exports offline, preserves
  a pre-existing real-data sentinel, and makes same-origin requests only.
- All 15 exact `.factory/claims.json` commands passed separately from a clean
  clone.
- `npm test` passed 12/12, typecheck passed, the build produced `dist/site`,
  and `npm run test:browser` passed 29/29.
- Live titles, metadata, 404 behavior, links, focus/Back behavior, accessibility,
  security headers, mobile fit, and the distinct visual system passed.

## Blocking work left

- F-3-1: `/?demo=1&license=...` writes the token to real local/session storage
  while the demo isolation banner is visible.
- F-3-2: `/privacy` says the returned token lasts for the current session, but
  the site also persists it in localStorage; that retention claim is unlisted.
- F-2-6: the earlier “companion site” jargon finding remains in README and the
  live privacy page.

F-3-3 is minor: the phone first screen should label the extension ZIP as
desktop-only beside the download link.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run test:browser
node scripts/verify-live.mjs
```

For the isolation failure, open
`https://keyboard-route-check.sociobot.in/?demo=1&license=review-token` in a
fresh context and inspect localStorage while the demo banner is visible. Both
`demo:krc:sample-report` and the real
`sb_license:keyboard-route-check` key are present; Reset does not clear the
real key.
