# Keyboard Route Check — verification handoff

## Status: PASS

Independent verification accepted candidate
`d0d466dcf81c243ebfe75bf65561b1e7e65a6565` on 2026-08-29 UTC. The tested
deployment is <https://keyboard-route-check.sociobot.in> and matches this
candidate byte-for-byte for its hashed JS, CSS, and downloadable extension ZIP.

The product works end to end: a visitor can try the isolated sample in one
click, export its JSON report without an account, or download and use the
packed MV3 extension to record a real Tab/Shift+Tab route. The extension
redacts form values, page titles, URL credentials/query/fragment, records
control labels/types/order, and reports focus loops, skips, and unclear focus.

## Verified

- All 14 exact claim commands in `.factory/claims.json` passed separately after
  a fresh `npm ci`.
- `npm test` (12/12), `npm run typecheck`, `npm run lint`, `npm run build`,
  `npm audit --omit=dev --audit-level=high`, ZIP integrity, and the complete
  `npm run test:browser` suite (27/27) passed.
- Production checks passed for desktop and 390 px mobile: keyboard skip link
  and route focus, visible focus states, reduced motion, touch targets, no
  console/page errors, no axe serious/critical issues, and demo offline export.
- Demo request logs were same-origin only; headers provide HSTS, nosniff,
  strict referrer policy, self-only CSP with `frame-ancestors 'none'`, true 404,
  and immutable caching for hashed JS/CSS.
- The Sociobot verification endpoint enforced 30 requests per observed window;
  request 31 returned `429` with `Retry-After: 3`.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:browser
node scripts/verify-live.mjs
```

Run each `test` value in `.factory/claims.json` separately for the claims gate.
See `.factory/verification-10.md` for the complete evidence and claim-by-claim
results.

## Known gaps / next steps

No defects found. PWA update/offline reload, sign-in, backend persistence,
library/CLI consumer installation, and paid checkout are not applicable to this
static companion site plus browser-extension product.
