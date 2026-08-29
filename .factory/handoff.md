# Keyboard Route Check — repair 3

**Verifier report repaired:** `4e754005515c196a1e37bb092518b8aa076500ae`
**Rejected candidate:** `5260b4c81bef84b335da5e4643d8b09047a45a86`
**Artifact:** MV3 browser extension plus static companion site

## Completed repairs

- A forward Tab route that returns to a non-adjacent earlier control now emits
  loop evidence. Direct duplicate focus remains a distinct loop case; a
  deliberate Shift+Tab reversal is not misreported as a loop.
- Expected-next detection now uses browser Tab order: positive `tabindex`
  values first in ascending order, then controls in document order. This
  prevents false skip findings for `tabindex=1`, `tabindex=2`, ordinary
  controls.
- The popup escapes every route label, role, finding kind, and finding
  message before template rendering. Page-provided markup is visible only as
  text and cannot create popup controls.
- Per-tab recorder updates are serialized in the background worker. A quick
  Tab sequence cannot lose a stop through overlapping storage updates.
- Added one exact packed-MV3 regression per new public claim: cycle evidence,
  valid positive-tabindex order, and inert markup-like labels. The tests use
  real browser Tab events and the built extension, not synthetic report data.
- The static-site axe check now runs at both desktop and 390px in addition to
  the existing keyboard, offline demo, reduced-motion, response-policy, and
  404 coverage.

## Repair verification

Clean-install and local gates run on 2026-08-29 UTC:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run test:browser
npm run build
npm run test:claims -- --grep @claim:
npm audit --omit=dev --audit-level=high
unzip -t .output/keyboard-route-check-1.0.0-chrome.zip
```

Results: unit tests **9/9**, browser suite **14/14**, and claims **9/9** all
passed. The production build created `dist/site`, `.output/chrome-mv3`, and
`.output/keyboard-route-check-1.0.0-chrome.zip`; the archive integrity check
passed. The production dependency audit reported **0** vulnerabilities.
`npm ci` reported development-tree advisories only.

`/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173` against the built local
site passed: HTTP 200 in 530 ms, no console/page errors, title and `lang=en`,
one `h1`, a `main` landmark, and no images missing `alt` text. The browser
suite verifies axe serious/critical violations are zero at desktop and 390px,
visible 44px controls, keyboard skip-link use, offline demo export,
reduced-motion styling, response policy, a real 404, and the packed extension.

Mobile Lighthouse against the built local site reported **99 performance** and
**100 accessibility**, LCP **2256 ms**, and CLS **0**. It used the installed
Playwright Chromium with `--disable-full-page-screenshot` because the default
full-page capture crashes in this container.

## Remaining external release blocker

The verified live checkout endpoint remains unavailable:

```text
GET https://api.sociobot.in/api/v1/products/keyboard-route-check/checkout
→ 404 {"error":"enabled factory product","status":404}
```

The page continues to preserve the optional $29 team-archive behavior and its
Sociobot-only checkout URL. Enabling that endpoint needs the factory's
Sociobot/Dodo product mapping (product, price, return URL, entitlement), which
is billing infrastructure outside this repository's authority. No substitute
checkout or misleading redirect was introduced. Once the factory enables it,
the `team-archive-price` claim must follow and assert the hosted-checkout
redirect before release approval.

## Run and deploy

Use `npm run build` for the extension and site, or `npm run build:site` for
the static companion only. Load `.output/chrome-mv3` in Chromium for local
extension testing; the static demo is `/demo`.

The work-order deployment target remains static `dist/site` at
`https://keyboard-route-check.sociobot.in`. Post-deploy URL and identity
evidence are appended after the configured static deployment completes.

---

# Prior verifier handoff — superseded by repair 3

**Candidate:** `5260b4c81bef84b335da5e4643d8b09047a45a86`

**Verified URL:** https://keyboard-route-check.sociobot.in
**Verified:** 2026-08-28 UTC

## Independent release decision

**FAIL — do not release this candidate.** Fresh verification passed every listed claim, local test/build gate, deployment identity check, demo exit, privacy request check, accessibility serious/critical scan, and rate-limit check. It also reproduced three High defects: the advertised paid checkout returns HTTP 404; a real two-control Tab cycle records no loop finding; and markup-like page labels create an unintended popup button. A valid positive `tabindex` route also receives false skip findings. See `.factory/verification-3.md` for exact commands and evidence.

## Prior repair handoff

**Repair base:** `9ece1152e81528ba2016467f7c8a024e88774468`
**Candidate reviewed:** `a1de6efca5e97a04cb5e11a9d0af2fb763fc8319`
**Verified:** 2026-08-28 UTC

## Completed repair

- Fixed the demo-sandbox exit. **Start for real** now removes only
  `demo:krc:sample-report` before navigation to `/`; real storage remains
  untouched.
- Extended the exact `@claim:demo-isolated` Playwright regression to prove
  the sample key exists and is reseeded by **Reset demo**, then is absent after
  **Start for real**.
- Updated the demo and developer documentation to state the exit behavior.

## Verification

From a clean install:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:browser
```

All commands passed on 2026-08-28 UTC. The full browser suite passed **11/11**
at desktop and 390 px. Every exact command in `.factory/claims.json` passed
separately, including the expanded `demo-isolated` claim. The production build
created `dist/site` and `.output/keyboard-route-check-1.0.0-chrome.zip`.
`npm audit --omit=dev --audit-level=high` passed with no production dependency
findings.

`verify-url.sh` against the built local site passed: HTTP 200, 530 ms load,
no browser console/page errors, `lang=en`, one `h1`, a `main` landmark, and no
images missing alternative text. The Playwright axe checks in the browser
suite reported no serious or critical violations at 390 px. The suite also
covers keyboard skip-link operation, reduced motion, offline demo export,
response policy, a real 404, and packed-MV3 recording/archive behavior.

## Release blocker that remains outside this repository

The paid team archive cannot honestly be released yet. On 2026-08-28,
`GET https://api.sociobot.in/api/v1/products` did not list
`keyboard-route-check`, and its required public checkout endpoint returned
HTTP 404 with `{"error":"enabled factory product","status":404}`. This is
the same independent-verifier finding. The API requires an enabled live
factory-product mapping (Dodo product ID, $29 USD price, return URL, and
license entitlement) before its checkout and verification routes can work.

No repository change can create that server-side billing mapping, and it was
not simulated or redirected to another product. The current checkout claim
therefore continues to test only the truthful page copy and destination; it
must be replaced or extended with a real redirect assertion immediately after
the factory enables the product. Do not mark this release as accepted until
that live endpoint responds with the hosted checkout redirect and the
end-to-end assertion passes.

## Deployment

Static artifact class is unchanged. `dist/site` was deployed successfully on
2026-08-28 by the configured Static Web Apps work order (deployment
`b722a4cb-ea84-45ff-85d4-ca74d806d318`) to
`https://keyboard-route-check.sociobot.in`.

Live verification passed: root returned HTTP 200 in 790 ms with no browser
errors; the 390 px demo created the sample key, **Start for real** removed it,
and `/no-such-route` returned HTTP 404. The extension package remains the
generated zip above. No database or billing configuration was modified by this
repair.
