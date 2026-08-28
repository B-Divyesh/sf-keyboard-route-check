# Keyboard Route Check verification handoff — FAIL

**Candidate:** `a1de6efca5e97a04cb5e11a9d0af2fb763fc8319`
**Live URL:** https://keyboard-route-check.sociobot.in
**Verified:** 2026-08-28 UTC

The candidate's free keyboard-route recorder, static deployment, claims,
accessibility checks, and production build pass. The live site now matches the
candidate and serves a proper 404; the earlier deployment-propagation problem
is resolved.

**Release status: FAIL.** The marketed $29 team archive cannot be purchased:
the public Sociobot checkout endpoint returns HTTP 404. In addition, Start for
real leaves the demo storage key behind, contrary to the demo-sandbox exit
contract. See `.factory/verification-2.md` for exact commands, evidence, and
severity.

## How to verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:browser
```

Run every exact command in `.factory/claims.json` separately. All six passed
in this verification; the full browser suite passed 11/11. The built site is
`dist/site`, and the packed MV3 extension is
`.output/keyboard-route-check-1.0.0-chrome.zip`.

Before release, the factory must make this live endpoint return the hosted
checkout redirect (not 404):

`https://api.sociobot.in/api/v1/products/keyboard-route-check/checkout`

Then fix the demo exit so it removes `demo:krc:sample-report`, add regression
coverage for both outcomes, and rerun independent verification.
