# Keyboard Route Check — independent verification 13 handoff

## Status: PASS

Verified candidate: `7b056ef3ae6d3fe2ab5ae680860780058fae5db2`

Live URL: <https://keyboard-route-check.sociobot.in>
Verified: 2026-08-29 UTC

No release-blocking defects were found. Product code was not changed during
this verification.

## What was verified

- Fresh `npm ci` installed 176 packages with no audit vulnerabilities.
- All 16 commands in `.factory/claims.json` were run separately from clean
  declared demo or packed-extension entry points; all passed. The combined
  `npm run test:claims` run also passed (31/31).
- `npm test` passed (12/12); `npm run typecheck` and `npm run lint` passed.
- Exact `npm run build` passed and produced `dist/site`, `.output/chrome-mv3`,
  and `.output/keyboard-route-check-1.0.0-chrome.zip`; `unzip -t` passed.
- `npm run test:browser` passed (31/31). It exercises packed-MV3 recording,
  normal and boundary Tab order, Shift+Tab, loops, true skips, invisible focus,
  form-value/URL redaction, hostile labels, export, invalid-license recovery,
  offline recording, and local archive flows.
- `node scripts/verify-live.mjs https://keyboard-route-check.sociobot.in`
  passed: desktop and 390px, real skip-link focus transfer, demo/reset/exit,
  offline export, route/history focus, privacy storage, axe, and same-origin
  request logging.
- `/opt/fleet/lib/verify-url.sh` passed the live home and `/demo`: 200,
  title, `lang=en`, one h1, main landmark, image alternatives, named buttons,
  and no console errors.

## Live evidence

The cold first screen plainly says **“Record the route your keyboard takes.”**,
identifies **“keyboard users and web teams”**, and offers the one-click
**“Try it with sample data”** action followed by **“See a route report right
away.”** This passed at 1440×900 and 390×844 without horizontal overflow. The
action opened a populated, isolated five-step report with the persistent demo
banner, Reset demo, and Start for real controls.

The whole cold landing and demo/reset/export/exit flow made only same-origin
requests; it produced no console or page errors. Route reports preserve labels
and roles while excluding form values, query strings, fragments, and titles.
The release has no sign-in, product backend, database, PWA service worker, CLI,
or consumer package surface; those class-specific checks do not apply.

Every normally served fresh-build artifact byte-matches production, including
the extension ZIP (`8935373c457fdc9b9f13dcc1f3c0b6b74d5f2e48eb848fe07011376ec7d97bd1`).
The live JS is 13,693 bytes (5,030 gzip), CSS is 10,164 bytes (2,850 gzip),
there are no web fonts, and the hero is 199,746 bytes: all applicable budgets
pass. Hashed JS/CSS have one-year immutable caching; HTML and hero use
30-second revalidation. HSTS, `nosniff`, strict-origin referrer policy, and the
self-first CSP with `frame-ancestors 'none'` are live. The attempted fresh
Lighthouse run could not finish because Chromium crashed while capturing the
full-page screenshot; independent axe, bundle, network, and browser checks
above passed.

Fresh axe 4.11 scans of `/`, `/demo`, `/privacy`, `/terms`, and `/404` at both
desktop and 390px reported zero findings, including zero serious/critical.
Keyboard-only validation confirmed the skip link moves focus to `main#main`
with a visible 3px outline and that the next Tab remains in main content.
Reduced-motion, focus contrast, 44px targets, route announcements, unknown
HTTP 404, and all site links were also verified in the browser suite/live
checks.

The sole external product endpoint, Sociobot license verification, accepted 30
rapid requests from one fresh client. Request 31 and later returned HTTP 429
with `Retry-After: 4` and `x-ratelimit-after: 4`. This satisfies the documented
allowance enforcement.

## Run again

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:browser
node scripts/verify-live.mjs https://keyboard-route-check.sociobot.in
```

Run each exact `test` value in `.factory/claims.json` separately for the
claims gate.

## Defects and next steps

None found (critical/high/medium/low: 0/0/0/0). No next step is required for
this candidate.
