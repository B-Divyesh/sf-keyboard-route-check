# Independent verification — FAIL

**Candidate:** `f8554d58bee597f4b210c445d8543ead5e983b1b`  
**Verified:** 2026-08-28 UTC  
**Live URL:** https://keyboard-route-check.sociobot.in

## Release decision

**FAIL.** The two release-blocking claim commands in `.factory/claims.json`
are invalid for the shipped Vitest CLI. Independently, a normal recorded tab
path produces a false focus-loop finding because generic controls receive the
same route ID. The required claim/demo contract is not met.

## First read (cold live page)

Passed. The first screen says it records the route a keyboard takes; names
keyboard users and web teams as the audience; and presents **Try it with sample
data** with the immediate outcome “See a route report right away.” The click
opens `/demo`, which shows a realistic five-stop sample, findings, persistent
“Demo — sample data, nothing is saved” banner, Reset demo, and Start for real.

## Claim contract — release blocking

After `npm ci`, every command listed in `.factory/claims.json` was run exactly:

| Claim | Required command | Result |
| --- | --- | --- |
| `route-data-local` | `npm test -- --grep @claim:route-data-local` | **FAIL** — Vitest 3.2.7 exits 1: `CACError: Unknown option --grep`. |
| `report-export` | `npm test -- --grep @claim:report-export` | **FAIL** — same exit-1 CLI error. |

The tests use tagged unit assertions, not the documented demo entry point or
observable extension/download behavior, so even a corrected selector would not
meet the claims-sandbox requirement. The live/README also make unlisted,
unproven visitor claims: “Free single-page reports”, “It does not send route
data away”, “$29 one-time”, “Save report history on this device”, and the demo
banner’s “nothing is saved”. Privacy and demo claims need whole-flow network
and storage tests.

## Defects

### Critical

1. **Claim commands fail, and claims are not sandbox tests.**
   Reproduction above. The factory contract states any failing claim command is
   release-blocking.

2. **Normal keyboard routes create false loop defects.**
   In the packed MV3 extension on a real HTTP tab, record focus through the
   license input, Verify license, Privacy, and Terms. The captured last two
   steps both have `id: "a."`; the report emits `loop: Focus returned to Terms
   without moving on.` `elementId()` falls back to tag plus up to two classes,
   so adjacent unclassed anchors/buttons collide. This defeats the primary job:
   reviewable, trustworthy focus-route evidence.

### High

1. **There is no actual 404 response.**
   `GET /no-such-route` returns HTTP 200, landing-page title, and landing h1,
   rather than the declared styled 404. This violates the required real-404
   route and makes invalid deep links look valid.

2. **Required 44px touch targets are missing.**
   Measured on the rendered landing page: wordmark is 209×26; Download the
   extension 172×20; Open the sample report 150×17; Read the privacy details
   154×17; footer Privacy 59×16, Terms 42×16, and Built by Param Factory
   185×16. Mobile header links are explicitly reduced to 36px high. This fails
   the supplied accessibility/touch-target baseline.

### Medium

1. **Route selectors/IDs are not stable or unique for common controls.**
   The same fallback that causes false loops stores selectors such as `a.` and
   `button.`. Exports therefore cannot reliably identify the focused element.

2. **`npm ci` reports 10 dev dependency advisories** (1 low, 2 moderate, 4
   high, 3 critical). `npm audit --omit=dev` reports zero production advisories.

## What passed

- `npm ci` completed. `npm test` passed: 3/3 tests. `npx tsc --noEmit` passed.
  Exact `npm run build` passed and produced the MV3 build, zip, and `dist/site`.
- A fresh 390px and desktop demo run had one h1, language/main landmarks, no
  horizontal overflow at 390px, visible 3px keyboard focus, no console/page
  errors, and `prefers-reduced-motion: reduce` produced 0s transitions.
- `/demo` wrote only `demo:krc:sample-report`; its JSON export was
  `sample-keyboard-route-report.json` (1,768 bytes) containing the sample
  title and `invisible-focus` finding. Reset reseeded the sample as documented.
- Invalid/empty license recovery was clear: “Paste your license token first”
  and “This license is not active. You can buy a new team archive.”
- Playwright axe-core checks found **0 serious or critical findings** (in fact
  zero WCAG 2 A/AA violations) for local and live `/` and `/demo` at 390px.
  No repository `verify-url.sh` exists; the equivalent title/lang/main/alt/
  console checks were performed in browser.
- Live mobile Lighthouse 12.8.2: **99 performance, 100 accessibility**, LCP
  1,854 ms, and CLS 0. This is passing evidence, not an override for the
  functional and claims blockers above.
- Fresh live-page network capture made only same-origin requests during the
  normal landing/demo path. The extension recording test captured labels,
  roles, order, directions, and focus visibility; a typed
  `do-not-record-this-secret` did not appear in the stored report.
- The live deployment matches this candidate’s static artifacts: root and demo
  HTML byte-match `dist/site`; JS and CSS SHA-256 match; all unzipped extension
  file contents match. The zip container hash differs only from regenerated
  archive metadata. Initial JS is 4.18 KB gzip, CSS 2.52 KB gzip, and hero WebP
  199.75 KB, within stated budgets.
- Live headers include HSTS, CSP, `nosniff`, and strict-origin referrer policy.
  Hashed assets are `max-age=31536000, immutable`.
- Sociobot verify endpoint rate limit is present: a 20-way burst of 80 invalid
  verify requests first returned 429 at request 17; 29 requests returned 200
  and 51 returned 429. A 429 included `Retry-After: 2` and
  `x-ratelimit-after: 2`.

## Repair and rerun

1. Make control identities unique and durable before deriving loops/skips;
   add extension end-to-end cases for adjacent unclassed links/buttons.
2. Correct every `claims.json` command for the pinned Vitest version and add
   one observable demo-entry test per claim, including privacy/network and
   demo-storage isolation. List every remaining visitor claim or remove it.
3. Serve unknown routes as HTTP 404 with the styled 404 document, not the SPA
   landing fallback.
4. Bring every interactive target to at least 44×44 CSS px, then rerun mobile
   keyboard, axe, claim, extension, build, and live-artifact checks.
