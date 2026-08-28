# Keyboard Route Check repair handoff — PASS

Repair for independent-verifier candidate
`f8554d58bee597f4b210c445d8543ead5e983b1b`, based on report commit
`04dd23c788129a3760e98ea7f69020ad18135c01`.

## What changed

- Fixed the recorder identity fallback. Every focused control now gets a unique,
  class-free selector (semantic attribute when unique, otherwise a structural
  `:nth-of-type` path). Adjacent generic links and buttons no longer collapse
  to `a.` or `button.` and cannot create a false loop finding.
- Added a packed-MV3 regression that records license input → Verify license →
  Privacy → Terms. It asserts four unique stored IDs, no loop warning, no
  captured form value, and a locally saved team archive.
- Replaced invalid Vitest `--grep` claim commands with working Playwright
  commands against the built demo and packed extension. Claims now cover local
  report data/no external requests, observable export, demo isolation/reset,
  free export, displayed team price, and local archive storage.
- Reworked Static Web Apps routing to rewrite only known pages. Unknown paths
  now reach `404.html` with HTTP 404 instead of the landing-page fallback.
- Raised all links and demo controls to 44 × 44 CSS px at desktop and 390px
  mobile, including header and footer links.
- Added regression coverage for keyboard focus, reduced motion, offline-after-
  load demo export, CSP/response policy, desktop/mobile routes, and axe.

## Verification

Run from a clean checkout:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:browser
```

All passed on 2026-08-28 UTC:

- Clean install completed (401 packages). `npm audit --omit=dev` reported
  **0 vulnerabilities**. `npm ci` still reports 10 development-only advisory
  findings inherited from the toolchain; none ship in the extension/site.
- Vitest: **4/4** tests passed. Typecheck and lint (TypeScript no-emit): pass.
- Production build: pass. `dist/site` is produced, with 4.19 KB gzip initial
  JS and 2.56 KB gzip CSS; the extension zip is produced at
  `.output/keyboard-route-check-1.0.0-chrome.zip`.
- Playwright: **11/11** passed. This covers desktop and 390px mobile,
  keyboard, packed-extension recording, no console/page errors in the offline
  demo flow, response policy, HTTP 404, 44px targets, and a fresh profile.
- axe at 390px found **0 serious or critical violations** on `/` and `/demo`.
- The demo exports successfully after the first load while offline; it uses
  only `demo:krc:sample-report` storage and has no external requests.
- Every exact command in `.factory/claims.json` passed, each selecting one
  observable regression test.

## Deployment

Static deployment remains the original `dist/site` artifact class. The repair
commit is `d950476`; push this branch to the configured `main` deployment
source. There is no repository-local deployment credential or separate deploy
script, and no infrastructure/DNS/billing was modified.

## Known gaps / next steps

No release-blocking gaps remain from the verifier report. The hosted static
site should be checked after the main-branch deployment completes for the
expected live artifact hash and real HTTP 404 behavior.
