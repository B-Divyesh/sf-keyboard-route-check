# Keyboard Route Check repair handoff — PARTIAL / RELEASE BLOCKED

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
