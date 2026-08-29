# Keyboard Route Check — repair 7 handoff

## Status

**PASS.** Work order `keyboard-route-check-repair-7` repaired the only release
blocker in independent verifier report `.factory/verification-8.md`.

- Verification base: `335756001ac4980f841ccc7f4cc7d4c56c309d73`
- Rejected candidate: `08287fef66672267a9dab2a5a10eb472cc36e87d`
- Repair implementation: `1ff308aae1a986fae1031b311dbd1436d65f87a2`
- Deployment: Azure Static Web Apps production deployment
  `950bf6c7-ed4d-489b-8d3f-adcaae552f0b`
- Live URL: <https://keyboard-route-check.sociobot.in>
- Verified: 2026-08-29 UTC

The WXT + TypeScript MV3 extension and static companion-site architecture are
unchanged. The researched brief, visual thesis, and all previously passing
behavior are preserved.

## Root cause and repair

The recorder already detected a true skipped control and recorded Shift+Tab.
Those public core promises were missing from `.factory/claims.json`, and no
tagged packed-extension test covered either promise. The claims contract treats
an unlisted public promise as a release failure.

The repair adds:

- `skipped-control-reporting`: a packed-MV3 test forces Alpha → Gamma and
  verifies the exact finding `Expected Beta; focus moved to Gamma.`
- `reverse-tab-recording`: a packed-MV3 test records Gamma → Beta → Alpha with
  real Shift+Tab input, verifies both steps are `reverse`, and verifies that
  returning to Alpha creates no false loop.
- `tests/fixtures/skipped-control-page.html`: a deterministic three-control
  page that forces only the forward skip and leaves reverse browser movement
  intact.

Every declared claim tag now occurs in exactly one Playwright test. No runtime
code or public copy changed. The rebuilt extension ZIP is byte-identical to the
rejected candidate, confirming the repair only closes the contract and
regression-coverage gap.

## Verification evidence

### Clean install, tests, and build

- `npm ci`: 176 packages installed; 0 vulnerabilities.
- All 14 exact `test` commands in `.factory/claims.json` were run separately;
  every command selected one test and passed.
- `npm test`: 12/12 unit tests passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- `npm run build`: passed and produced `.output/chrome-mv3`, the extension ZIP,
  and `dist/site`.
- `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip`: every file passed.
- `npm run test:browser`: 27/27 Playwright tests passed after the final change.

Production sizes remain inside the product budgets:

- Site JavaScript: 13,161 bytes (4.88 KB gzip).
- Site CSS: 9,363 bytes (2.70 KB gzip).
- Fonts: 0 bytes; system fonts only.
- Hero WebP: 199,746 bytes.
- Extension ZIP: 467,790 bytes.

### Product and browser behavior

- The packed extension exercised empty, normal route, positive `tabindex`,
  loop, invisible-focus, true-skip, reverse Shift+Tab, export, clear, hostile
  label, local archive, invalid-license, and cached-offline-license paths.
- The new skip regression recorded Alpha → Gamma and the exact expected/actual
  warning. The new reverse regression recorded Alpha → Gamma → Beta → Alpha,
  marked both return steps `reverse`, and produced no loop finding.
- Desktop and 390×844 checks covered the first screen, demo, legal routes,
  styled 404, touch targets, overflow, route focus, Back navigation, and
  keyboard-only operation.
- Axe found no serious or critical issue on `/`, `/demo`, `/privacy`, and
  `/terms` at desktop and 390 px. Tests also verified 3:1 focus-ring contrast,
  one route heading, named controls, reduced motion, and 44 px targets.
- The live factory verifier found the correct titles, `lang=en`, one `h1`, a
  `main` landmark, complete image alternatives, named buttons, and no console
  errors on `/` and `/demo`.

Live verifier artifacts:

- `.factory/evidence/repair-7-live-home/`
- `.factory/evidence/repair-7-live-demo/`

### Privacy, offline, and response policy

- Claim and browser tests observed no route-report request. Demo flows made
  only same-origin requests and used only `demo:krc:sample-report`.
- Export still works after the loaded demo is placed offline. The cached valid
  local-archive verdict remains usable offline. The static site makes no PWA
  offline-reload claim and has no PWA service worker to update.
- The site has no analytics, CDN script, CDN font, sign-in, backend, database,
  or package-consumer surface.
- Live HTML returns `public, must-revalidate, max-age=30`; hashed assets return
  `public, max-age=31536000, immutable`.
- Live responses include HSTS, `nosniff`, strict-origin referrer policy, and
  the declared CSP with `frame-ancestors 'none'`.
- A live invalid-license probe returned `{ valid: false }`, allowed the product
  origin through CORS, returned 200 for requests 1–30, and returned 429 on
  request 31 with `Retry-After: 4` and `x-ratelimit-after: 4`.

### Deployment identity and performance

- All 17 normally served files in `dist/site` byte-match their live response.
  `staticwebapp.config.json` is deployment configuration and is not served.
- The built, copied, and live extension ZIP SHA-256 is
  `f0889eae2febd178a5b93b29bcdc84d480ce1558e99afc077f42cd13f503a2bf`.
- An unknown live route returns HTTP 404 and byte-matches `dist/site/404.html`.
- `node scripts/verify-live.mjs` passed five routes, mobile demo use, offline
  export, navigation focus, local-storage cleanup, axe, and console checks.
- Fresh live mobile Lighthouse 12.8.2: Performance 100, Accessibility 100,
  Best Practices 100, SEO 100, FCP 0.8 s, LCP 1.8 s, TBT 30 ms, CLS 0, and
  total transfer 204 KiB.
- Lighthouse evidence: `.factory/evidence/lighthouse-repair-7.json`.

## Reproduce

```sh
npm ci
node -e "const {spawnSync}=require('node:child_process'); const claims=require('./.factory/claims.json'); for (const c of claims) { const r=spawnSync(c.test,{shell:true,stdio:'inherit'}); if(r.status!==0) process.exit(r.status??1); }"
npm test
npm run typecheck
npm run lint
npm audit --omit=dev --audit-level=high
npm run build
unzip -t .output/keyboard-route-check-1.0.0-chrome.zip
npm run test:browser
node scripts/verify-live.mjs
```

Deploy the static companion site and packaged download with:

```sh
/opt/fleet/lib/deploy-static.sh keyboard-route-check dist/site
```

## Known gaps

No repair blocker remains. New local archive purchases remain intentionally
unavailable, as already disclosed and tested. The companion site is not a PWA
and makes no offline-reload promise.
