# Keyboard Route Check — polish 1 handoff

## Status

**PASS.** All five findings in `.factory/review-1.md` are fixed. No earlier
review or polish report exists in repository history, and no known gap remains.
The repaired product source is committed in `4d3d5e6` and `a4d5a77` and pushed
to `origin/main`.

The static site and packaged MV3 extension preserve the cassette-zine visual
identity and original artifact class. Deployment `6e1c7323-7047-493f-abbf-299fa477ac84`
succeeded through the configured factory static deployer. The canonical site is
live at <https://keyboard-route-check.sociobot.in>.

## What changed

- Added real History API routing with destination-`h1` focus, a polite route
  announcement, Back/forward handling, and synchronized route metadata.
- Replaced all review-identified metaphor copy and unexplained specialist terms
  with literal section names and plain descriptions.
- Renamed the misleading team archive to a local report archive everywhere and
  stated that it does not sync or share reports.
- Made `/?demo=1` the landing-page sample action. Demo storage remains isolated
  under `demo:krc:sample-report`, with persistent reset and exit controls.
- Completed 404 canonical, Twitter metadata, apple-touch metadata, external-site
  disclosure, literal 404 copy, and legal-route text.
- Updated all claims and added request-destination assertions. Upgraded WXT to
  0.21.4, removing all reported npm vulnerabilities.
- Updated the README, copy audit, demo document, one-line catalog description,
  and the finding-by-finding `.factory/polish-1.md`.

## Verification evidence

Verification ran on 2026-08-29 UTC.

- Fresh clone plus `npm ci`: passed; npm reported 0 vulnerabilities.
- Every one of the 12 exact commands in `.factory/claims.json`: passed
  separately from the clean clone.
- Clean-clone `npm run typecheck`: passed.
- Clean-clone `npm test`: 12/12 passed.
- Final pushed clean-clone `npm run test:browser`: 23/23 passed.
- Clean-clone `npm run build`: passed and produced `.output/chrome-mv3`, the
  extension zip, and `dist/site`.
- Site bundle: 13.16 KB JavaScript (4.88 KB gzip) and 9.30 KB CSS (2.69 KB
  gzip). Hero WebP: 199.75 KB.
- Local worker URL verification: `/` and `/?demo=1` both returned 200 with no
  console errors, one `h1`, `lang=en`, `main`, complete alt text, and labeled
  buttons.
- Live worker URL verification: `/` and `/?demo=1` both returned 200 with the
  same accessibility checks and no console errors.
- Live cold script: all five routes, one-click demo/reset/exit/export, storage
  isolation, same-origin traffic, focus/announcement/Back, metadata, real 404,
  390px layout, reduced motion, offline export, and axe scans passed.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 1.8 s, CLS 0, total transfer 204 KiB.
- Screenshots: `.factory/evidence/live-home-mobile.png`,
  `.factory/evidence/live-route-focus.png`, and
  `.factory/evidence/live-footer.png`.

## Run and verify

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run test:browser
node scripts/verify-live.mjs
```

Run each `test` command in `.factory/claims.json` exactly to repeat individual
claim verification. Deploy only `dist/site` with the work-order static deployer.

## Known gaps and next steps

None. New local archive purchases remain intentionally unavailable and are
described that way; existing licenses still transfer and verify.
