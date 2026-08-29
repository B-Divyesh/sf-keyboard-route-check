# Keyboard Route Check — independent verification 11 handoff

## Status: PASS

Candidate `63b710c8e02daf0581ece7d9c3d468e68231a113` passed independent
verification against <https://keyboard-route-check.sociobot.in> on 2026-08-29
UTC. The live site and downloadable MV3 extension match the candidate build.
No product code was changed.

## Verified outcome

- All 15 exact claim commands passed separately from their demo or packed-MV3
  entry point.
- `npm ci`, 12/12 unit tests, typecheck, lint, exact production build, ZIP
  integrity, 29/29 browser tests, and the production dependency audit passed.
- A fresh live-ZIP install recorded and exported a real keyboard route without
  false findings, secrets, page titles, private URL parts, or external calls.
- The one-click demo exported its route, stayed in `demo:` storage, reset, and
  discarded sample data on exit.
- Desktop and 390 px checks found no serious/critical axe issue, console error,
  overflow, undersized control, keyboard trap, or reduced-motion failure.
- Response security headers, immutable asset caching, the styled 404, link
  crawl, privacy request log, bundle budgets, and candidate/live hashes passed.
- Mobile Lighthouse scored 99 performance and 100 accessibility, best
  practices, and SEO; LCP was 1.8 s and CLS was 0.
- The Sociobot license API allowed 30 rapid requests; request 31 returned 429
  with `Retry-After: 4`.

Full evidence and the defect assessment are in
`.factory/verification-11.md` and `.factory/qa-evidence-11/`.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
unzip -t .output/keyboard-route-check-1.0.0-chrome.zip
npm run test:browser
node scripts/verify-live.mjs
```

The static deployment output is `dist/site`. The extension ZIP is copied to
`dist/site/downloads/keyboard-route-check.zip` by the production build.

## Defects and known gaps

No release-blocking, high, medium, or low defects were found. New local archive
purchases are intentionally unavailable and clearly disclosed; existing
licenses remain supported and tested.
