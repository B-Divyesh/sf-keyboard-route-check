# Keyboard Route Check — review 2 handoff

## Status: FAIL

Completed the adversarial first-read review against candidate
`7746b43d9988db800734189f10694fc2ec8269bd` and the live deployment at
<https://keyboard-route-check.sociobot.in>. The complete report is
`.factory/review-2.md`.

Two blocking findings remain: the live extension ZIP has no visible install
instructions, and prior finding F-1-2 was only reworded as an artwork claim in
the footer. Five minor plain-language and first-screen fact findings also
remain. Product code was not modified.

## Verification performed

- Fresh mobile and desktop cold reads, live screenshots, console/request logs,
  demo reset/exit, real-storage sentinel, offline export, route focus/Back,
  direct deep links, metadata, designed 404, and dead-link crawl.
- All 14 exact claim commands passed individually from a clean clone.
- `npm test` passed 12/12; `npm run test:browser` passed 27/27; typecheck and
  lint passed; the browser runs rebuilt the extension and `dist/site`.
- `/opt/fleet/lib/verify-url.sh` passed the live home and demo URLs.
- Independent live axe scans at 390 × 844 and 1440 × 900 found no serious or
  critical violations on `/`, `/demo`, `/privacy`, `/terms`, or `/404`.

## Next step

Resolve F-2-1, F-1-2, and F-2-2 through F-2-6 exactly as specified in the
review, add claim coverage for any new offline copy, deploy the repair, and run
a complete new adversarial review rather than a diff-only check.
