# Keyboard Route Check — polish 3 handoff

## Status: PASS

Repair implementation: `558a2ad4e1d64e0c34ce3f04791ffebee91d26ff`
(`fix: isolate demo checkout returns`). It is pushed to `origin/main` and was
deployed as static deployment `f54b0648-ddae-4c4d-b495-672347334411` to
<https://keyboard-route-check.sociobot.in> on 2026-08-29 UTC.

## What changed

- Demo mode now identifies its route before checkout-return handling. A
  `license` parameter on `/?demo=1` or `/demo` is removed from the URL and
  ignored without reading or writing real storage.
- Website checkout-return tokens now use `sessionStorage` only. They are shown
  only in the return tab and are never persisted in website local storage.
- Added the `checkout-token-session-only` claim and strengthened
  `demo-isolated` with the exact combined-query adversarial case.
- Replaced every remaining public “companion site” use with “website.” The
  first-screen ZIP action now says **Download desktop Chrome extension ZIP**.
- Kept the cassette-zine visual system, existing real installation path,
  routing, legal pages, demo banner/reset/exit controls, and extension
  packaging intact.

## Verification

Fresh clone: `/tmp/krc-clean-VDGs2q`, cloned from `558a2ad` before testing.

- `npm ci`, `npm run typecheck`, `npm test` — passed (12 unit tests).
- `npm run build` — passed; produced `dist/site` and the MV3 ZIP.
- Every exact command in `.factory/claims.json` ran separately and passed:
  all 16 claims, including `@claim:demo-isolated` and
  `@claim:checkout-token-session-only`.
- `npx playwright test tests/browser/site.spec.ts --reporter=list` — 17/17
  passed; includes mobile fit, route focus/Back, metadata/404, serious/critical
  axe checks, privacy storage, and offline demo export.
- `npx playwright test tests/browser/extension.spec.ts --reporter=list` —
  13/13 passed against the packed MV3 extension.
- `npm audit --omit=dev --audit-level=high` — 0 vulnerabilities.
- `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip` — passed; the ZIP
  contains root `manifest.json`.
- Local production-artifact check:
  `KRC_LIVE_URL=http://127.0.0.1:4173 node scripts/verify-live.mjs` — passed.
- Cold live check: `node scripts/verify-live.mjs` — passed routes, demo
  reset/exit, combined demo-token isolation, session-only return, route focus,
  metadata, mobile fit, offline sample export, request privacy, console, and
  axe. Live screenshots: `evidence/polish-3-live-home-mobile.png`,
  `evidence/polish-3-live-route-focus.png`, and
  `evidence/polish-3-live-footer.png`.
- `/opt/fleet/lib/verify-url.sh` passed both the [home page](https://keyboard-route-check.sociobot.in)
  and [demo](https://keyboard-route-check.sociobot.in/?demo=1); output and
  screenshots are under `evidence/polish-3-verify-home/` and
  `evidence/polish-3-verify-demo/`.
- Lighthouse mobile, live: Performance 99, Accessibility 100, Best Practices
  100, SEO 100; LCP 1.81 s and CLS 0. Report:
  `evidence/polish-3-lighthouse-mobile.json`.
- Live headers include CSP with `frame-ancestors 'none'`, HSTS,
  `Referrer-Policy: strict-origin-when-cross-origin`, and `nosniff`; an
  unknown URL returned HTTP 404.

## How to run

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run test:browser
node scripts/verify-live.mjs
```

Open `/?demo=1` for the isolated sample. Opening
`/?demo=1&license=anything` keeps the demo sandbox isolated. A normal
`/?license=token` return displays that token only in the current tab so it can
be copied into the extension.

## Known gaps and next steps

None. New local-report-archive purchases remain intentionally unavailable,
which is disclosed on the landing page and terms page.
