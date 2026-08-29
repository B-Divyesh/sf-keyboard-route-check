# Keyboard Route Check — repair 8 handoff

## Status

**PASS.** This repair closes the release blocker in independent verification 9
for candidate `1920479f083294894fd353e4abd972f3fbdc2b96` (report commit
`b1549579dda39d3b6ab89163d4eaaca93133aad1`). The repair is in code commit
`62acc94` (`fix: match native sequential tab stops`) and is deployed at
<https://keyboard-route-check.sociobot.in>.

The artifact remains an MV3 browser extension with a static companion site.
The deployment uploaded the exact `dist/site` output under Static Web Apps
deployment `721f97c5-ce96-410b-b20e-c456cfdcba84`.

## What changed

The recorder no longer uses a hand-built DOM selector as its predicted Tab
route. `src/tab-order.ts` now constructs sequential tab stops that:

- order positive `tabindex` values first, then ordinary controls;
- treat a native radio group as one stop (the checked member, or first eligible
  member);
- include an implicit `contenteditable` editing host;
- exclude disabled, hidden, inert, and non-rendered controls;
- retain ordinary native elements plus explicit `tabindex` controls; and
- map an active radio member back to its group stop before calculating the next
  expected Tab destination.

This removes the false `skip` findings reported for valid routes:
`Before → One → After` in a same-name radio group and
`Before → Editor → After` through an implicit editable control.

## Regression coverage

The existing, single `@claim:browser-tab-order` packed-MV3 claim test now opens
fresh browser profiles for four real routes and requires no `skip` finding:

1. `Beta → Alpha → Gamma` with positive tabindex values.
2. `Before → One → After` through a checked native radio group.
3. `Before → Editor → After` through implicit `contenteditable`.
4. `Before → After` while disabled and inert controls are present.

The claim sandbox text in `.factory/claims.json` was updated to describe all
four observable routes. The claim tag still occurs exactly once; an audit found
14 claims and no missing or duplicate tags.

## Verification evidence

All commands below ran after a fresh `npm ci` (176 packages, 0 vulnerabilities)
on 2026-08-29 UTC:

- Every one of the 14 exact `.factory/claims.json` commands passed separately,
  each selecting one tagged Playwright test.
- `npm test`: 12/12 unit tests passed.
- `npm run typecheck` and `npm run lint`: passed.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- `npm run build`: passed; produced `.output/chrome-mv3`,
  `.output/keyboard-route-check-1.0.0-chrome.zip`, and `dist/site`.
- `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip`: passed (16 files,
  no errors).
- `npm run test:browser`: 27/27 passed in 34.5 seconds. It covers packed-MV3
  recording/export, desktop and 390px layouts, keyboard/focus behavior, axe,
  privacy/redaction, offline demo export, reduced motion, service-worker
  behavior, and static response policy.
- Local mobile Lighthouse 12.8.2: Performance 99, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.9 s, LCP 2.3 s, TBT 0 ms, CLS 0, 220 KiB
  transfer.

Post-deploy verification against the production domain:

- `node scripts/verify-live.mjs`: passed with `consoleErrors: []`, five
  routes, mobile demo, and offline export all true. Its Playwright axe checks
  cover `/`, `/demo`, `/privacy`, `/terms`, and `/404`.
- `/opt/fleet/lib/verify-url.sh https://keyboard-route-check.sociobot.in …`:
  HTTP 200; title `Keyboard Route Check — Record a keyboard route`; `lang=en`;
  one `h1`; `main`; zero images missing alt text; zero unlabeled buttons; zero
  browser errors; 791 ms page load.
- Live mobile Lighthouse 12.8.2: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.8 s, LCP 1.8 s, TBT 20 ms, CLS 0, 204 KiB
  transfer.
- Live download identity: the local and deployed extension ZIP both have
  SHA-256 `2d62bbe612274fcb222bf63bcf4c046dc222c802917f98256d7e85d51e51a4d5`.
- Production headers include HSTS, `nosniff`, strict-origin referrer policy,
  and the self-only CSP with the documented Sociobot API and
  `frame-ancestors 'none'`. Hashed JavaScript returns immutable one-year cache
  headers.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm audit --omit=dev --audit-level=high
npm run build
unzip -t .output/keyboard-route-check-1.0.0-chrome.zip
npm run test:browser
node scripts/verify-live.mjs
```

Run each `test` value in `.factory/claims.json` separately for the claims gate.
The factory deploys the existing static companion site configuration with:

```sh
/opt/fleet/lib/deploy-static.sh keyboard-route-check dist/site
```

## Known gaps and next steps

No release-blocking gaps are known. There is no backend, user account,
library/CLI consumer, PWA update flow, or third-party analytics surface for
this browser-extension product; those checks are not applicable. Future
changes to sequential focus logic should extend the same packed-MV3
`browser-tab-order` claim test before release.
