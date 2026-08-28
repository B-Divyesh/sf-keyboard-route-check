# Keyboard Route Check handoff

## Delivered

- A WXT Manifest V3 extension that starts and stops a manual route recording on
  the active `http` or `https` tab.
- The recorder captures focused control labels, roles, order, Tab or Shift+Tab
  direction, likely loops/skips, and likely missing focus marks. It never reads
  input values.
- JSON export is available for every report. The paid $29 team archive stores
  up to 100 reports locally after an optimistically cached, daily Sociobot
  license verification. The popup also supports pasting a license.
- A cassette-era zine landing site, `/demo` sample sandbox, `/privacy`,
  `/terms`, and styled `404` page. The zip is copied to
  `dist/site/downloads/keyboard-route-check.zip` by the build.
- Original generated cassette artwork at `public/hero/cassette-route.webp`
  (196 KB). Prompt, review, and provenance are recorded in `design.md`.

## Run and verify

```sh
npm install
npm test
npm run build
```

`npm test` passed: 3 tests, including both claim-tagged tests.
`npm run build` passed and produced `.output/chrome-mv3`, its zip archive, and
`dist/site` with `index.html` at the deploy root.

Additional verification passed:

- TypeScript: `npx tsc --noEmit`
- Built manifest check: content script and `storage` permission present
- Sample URL check: `/`, `/demo`, and `/privacy` returned 200 from the Vite
  server
- Headless Chromium rendered `/demo` at a 390px screenshot size

Performance-class evidence from the production bundle: initial site JavaScript
is 4.18 KB gzip; CSS is 2.43 KB gzip; the only hero image is 196 KB WebP.
Lighthouse 12 could not attach to the container's preinstalled Chromium, so no
synthetic Lighthouse score is reported. That is the only unmeasured gate.

## Known gaps and next steps

- Route findings are heuristics. Complex widgets and intentionally managed
  focus can need human interpretation; the product does not claim certification.
- The extension archive is a self-hosted download. Publish it to the relevant
  extension store only if the factory later chooses that distribution path.
- Run Lighthouse in a standard Chrome environment before release to record the
  final performance and accessibility scores.
