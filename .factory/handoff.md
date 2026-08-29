# Keyboard Route Check — independent QA handoff 12

## Status: FAIL

Tested candidate: `f397e93de5816d944367714c70d6f6ab7174779e`

Live URL: <https://keyboard-route-check.sociobot.in>

Test date: 2026-08-29 UTC

The previous deployment-only failure is resolved. A fresh `npm run build`
completed, and every one of the 17 normally served candidate files matches the
live deployment byte-for-byte. The release is blocked by one independently
reproduced accessibility defect:

1. **High:** activating **Skip to content** leaves focus on `<body>`. The next
   Tab returns to the header wordmark, so the repeated header is not bypassed.

Full findings and exact evidence are in `.factory/verification-12.md` and
`.factory/evidence/verification-12/`.

## What passed

- All 16 exact `.factory/claims.json` commands passed independently.
- `npm ci`, `npm test` (12/12), `npm run typecheck`, `npm run lint`, exact
  `npm run build`, and `npm run test:browser` (30/30) passed.
- The cold first-read and one-click populated demo gate passed at desktop and
  390 px.
- The packed MV3 recording, redaction, route findings, download, offline use,
  invalid-input recovery, local archive, and hostile-label scenarios passed.
- Fresh live axe checks found zero violations on all public routes at desktop
  and mobile. The extension popup also had zero axe violations.
- Demo traffic stayed same-origin; checkout-return storage stayed session-only
  and isolated from demo data.
- Live headers, 404 behavior, caching, links, reduced motion, bundle budgets,
  and production asset matching passed.
- Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.8 s, TBT 20 ms, CLS 0.
- Billing verification allowed 30 requests; request 31 returned 429 with
  `Retry-After: 4`.

## Verification commands

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:browser
node scripts/verify-live.mjs https://keyboard-route-check.sociobot.in
```

## How to reproduce the blockers

Skip link:

1. Open the live home page in a fresh desktop browser.
2. Press Tab once, then Enter on **Skip to content**.
3. Inspect focus or press Tab again. Focus is on `<body>`, then returns to the
   header wordmark instead of entering main content.

## Required next steps

- Make the skip target focusable and move keyboard focus to it (or the h1) when
  the skip link is activated; verify the next Tab starts within main content.
- Add a regression test that activates the skip link and asserts focus enters
  main content, then rerun all gates and independent live verification.

No product code was modified during this verification.
