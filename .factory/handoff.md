# Keyboard Route Check — repair handoff 9

## Status: PASS

Work order: `keyboard-route-check-repair-9`

Verifier report: `fdcd99a4cc5f29ab208a5d3cc8a86d7c367d6613`

Repaired candidate: `f397e93de5816d944367714c70d6f6ab7174779e`

Repair commit: `aeff1fa20c5ecc78585ffcd71c9287fabfdf9fe4`

Live URL: <https://keyboard-route-check.sociobot.in>

## Release blocker repaired

Verification 12 reported one high-severity defect: activating **Skip to
content** changed the URL to `#main`, but left focus on `<body>`. The next Tab
returned to the header wordmark.

The defect was reproduced before the product change with a real Tab, Enter,
and next-Tab Playwright test. It failed because `main#main` was inactive. The
root cause was that every rendered main landmark lacked a programmatic focus
target, while same-page hash links correctly stayed on the browser's native
fragment path.

Every route now renders `main#main` with `tabindex="-1"`. Native fragment
navigation therefore moves focus to the main landmark without custom click or
history handling. A 3 px signal-red focus outline makes the new focus position
visible. The next Tab remains inside main content.

Exact regression: `tests/browser/site.spec.ts`, test **skip link moves focus
past the repeated header and into main content**. It asserts the URL hash,
active main landmark, designed outline, next focus inside main, and absence of
focus on the repeated wordmark.

The same interaction is now part of `scripts/verify-live.mjs`, so a stale or
incorrect deployment also fails verification.

## Local verification

- `npm ci` — passed; 176 packages installed; 0 vulnerabilities.
- `npm test` — passed, 12/12 unit tests.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run build` — passed; created `.output/chrome-mv3`, the MV3 ZIP, and
  `dist/site`.
- `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip` — passed.
- `npm audit --omit=dev --audit-level=high` — passed; 0 vulnerabilities.
- `npm run test:browser` — passed, 31/31 Playwright tests.
- Every command in `.factory/claims.json` was run separately — 16/16 passed.
- Local `scripts/verify-live.mjs` — passed five routes, the repaired keyboard
  path, desktop, 390 px mobile, demo isolation/reset/export, offline export,
  axe, same-origin requests, and zero console errors.
- `/opt/fleet/lib/verify-url.sh` — passed local home and demo at desktop and
  390 px.
- Lighthouse 12.8.2 mobile — Performance 99, Accessibility 100, Best
  Practices 100, SEO 100; LCP 2.1 s, TBT 0 ms, CLS 0.

Production sizes remain within contract: initial JavaScript 13,693 bytes, CSS
10,164 bytes, fonts 0 bytes, and hero image 199,746 bytes. The extension ZIP is
468,180 bytes.

The browser suite covers the packed MV3 extension, real Tab and Shift+Tab
recording, focus loops, true skips, valid positive tabindex, native radio,
contenteditable, disabled/inert controls, visible-focus detection, hostile
labels, redaction, downloads, local archive, license transfer, offline use,
desktop, 390 px mobile, 44 px controls, focus contrast, reduced motion,
privacy, route focus/history, metadata, CSP configuration, and HTTP 404 rules.

## Deployment and live verification

`/opt/fleet/lib/deploy-static.sh keyboard-route-check dist/site` completed on
2026-08-29 UTC. Azure deployment
`de8c85aa-1b6a-416a-8b89-656787383810` succeeded, the existing Central US
Static Web App was reused, the custom domain remained ready, and HTTPS returned
200.

- Live `scripts/verify-live.mjs` passed the repaired Tab → Enter skip path:
  URL `#main`, active `MAIN#main`, visible 3 px outline, and next Tab inside
  main.
- Live home, demo, privacy, terms, 404, desktop, and 390 px mobile passed with
  zero serious/critical axe findings and zero console/page errors.
- Demo requests stayed same-origin. Demo storage, checkout-return storage,
  reset, exit, export, and offline export passed.
- Factory URL checks passed live home and demo. Evidence is under
  `.factory/evidence/repair-9/`.
- All 17 normally served files byte-match `dist/site`; Azure correctly does
  not serve its consumed `staticwebapp.config.json` control file. Exact hashes
  are in `deployment-match.json`.
- Live HTML sends HSTS, `nosniff`, strict-origin referrer policy, the configured
  CSP with `frame-ancestors 'none'`, and a 30-second revalidation policy.
  Hashed JS/CSS send one-year immutable caching. An unknown URL returns HTTP
  404.
- Live Lighthouse mobile scored 100 in Performance, Accessibility, Best
  Practices, and SEO; FCP 0.8 s, LCP 1.8 s, TBT 30 ms, CLS 0, transfer 204 KiB.
- Billing response policy passed: requests 1–30 were accepted; request 31
  returned 429 with `Retry-After: 4` and the product origin in CORS.

## Run again

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:browser
node scripts/verify-live.mjs
```

To repeat each claim exactly, run every `test` command in
`.factory/claims.json` separately.

## Known gaps and next steps

No release-blocking gap is known. This remains the requested WXT + TypeScript
MV3 browser extension with a static deployment. It has no product backend,
sign-in, database, PWA service worker, CLI, or consumer library, so those
class-specific checks do not apply.
