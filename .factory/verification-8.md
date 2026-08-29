# Keyboard Route Check — independent verification 8

## Verdict

**FAIL — release-blocking claims-contract defect.**

Candidate `08287fef66672267a9dab2a5a10eb472cc36e87d` was tested on
2026-08-29 UTC at <https://keyboard-route-check.sociobot.in>. The live product
and packed extension work well in the tested flows, all 12 declared claim
commands pass, and the live deployment byte-matches the candidate build.
However, two public core-product promises are absent from
`.factory/claims.json`. The attached claims contract says an unlisted public
claim fails verification even when an independent one-off probe happens to
pass.

No product code was changed during this verification.

## Release blocker

### High — advertised skip and Shift+Tab behavior is missing from the claims registry

- `README.md:5-7` says the extension records a manual Tab and Shift+Tab route
  and flags focus problems. `README.md:23` again directs the user to use Tab
  and Shift+Tab.
- The live sample visibly reports a `SKIP` finding, and skip detection is part
  of the researched smallest useful product.
- `.factory/claims.json` has claims for forward loops, invisible focus, and
  positive-tabindex order, but no claim for a true skipped-control warning and
  no claim for recording a real reverse Shift+Tab move.
- `@claim:browser-tab-order` checks only a forward route through positive
  tabindex controls. `@claim:report-export` checks report fields and a
  download, not a reverse move or a true skip. The untagged unit test for
  `addStep(... expected ...)` does not meet the packed-extension claim sandbox
  requirement.
- Fresh independent packed-extension evidence showed the implementation works
  today: Alpha → Gamma produced `Expected Beta; focus moved to Gamma.`, then
  Shift+Tab recorded Beta with direction `reverse` and no false loop. This does
  not repair the missing mandatory regression claims.

Required resolution: add separate claims and tagged packed-extension tests for
true skip reporting and reverse Shift+Tab recording. Removing the promises is
not an honest alternative because both belong to the researched core job.

No other release-blocking, moderate, or low defects were found.

## Mandatory first-read result

**PASS.** A cold 1440×900 live load, with a fresh browser context, showed:

- What: **“Record the route your keyboard takes.”**
- For whom: **“For keyboard users and web teams who need proof before a focus
  defect reaches production.”**
- First action: **“Try it with sample data”**, beside **“See a route report
  right away.”**
- The one-click action was fully visible at `y=515` in the first viewport and
  opened `/?demo=1`.

The cold load made four requests, all same-origin: HTML, one 13.2 KB script,
one 9.4 KB stylesheet, and the hero WebP. There were no console or page errors.
Evidence:

- `.factory/qa-artifacts/live-first-read.json`
- `.factory/qa-artifacts/live-first-read-desktop.png`

## Declared claim gate

The checkout initially had no dependencies, as expected. After `npm ci`, every
exact `test` value in `.factory/claims.json` was run separately from the
configured built demo/packed-extension entry points. Each command selected one
test and exited 0.

| Claim | Result |
| --- | --- |
| `route-data-local` | PASS |
| `report-export` | PASS |
| `demo-isolated` | PASS |
| `free-report-export` | PASS |
| `team-archive-local` | PASS |
| `team-archive-unavailable` | PASS |
| `focus-cycle-reporting` | PASS |
| `invisible-focus-reporting` | PASS |
| `browser-tab-order` | PASS |
| `popup-label-safety` | PASS |
| `license-transfer-handoff` | PASS |
| `license-check-destination` | PASS |

Summary: **12/12 declared claims passed; 0 declared claim failures.** The final
FAIL is caused by unlisted public claims, not a failure of a listed claim.

## Clean install, tests, and exact build

- Confirmed clean candidate HEAD:
  `08287fef66672267a9dab2a5a10eb472cc36e87d`.
- `npm ci`: 176 packages installed from the lockfile; 0 vulnerabilities.
- `npm test`: 12/12 unit tests passed across two files.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- `npm run build`: passed. It produced `.output/chrome-mv3`,
  `.output/keyboard-route-check-1.0.0-chrome.zip`, and `dist/site`.
- `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip`: every entry passed.
- `npm run test:browser`: 25/25 passed in 1.0 minute.

## Live deployment identity and routing

- The 16 normally served files in `dist/site` matched fresh live response
  bodies byte-for-byte. The deployment-only `staticwebapp.config.json` is
  correctly not public.
- An unknown route returned HTTP 404, and its response body byte-matched the
  candidate `404.html`.
- Candidate ZIP, copied site ZIP, and live downloaded ZIP all had SHA-256:
  `f0889eae2febd178a5b93b29bcdc84d480ce1558e99afc077f42cd13f503a2bf`.
- Every public internal link, download, fragment, and the labeled external
  Param Factory link resolved successfully. Internal pages and downloads
  returned 200; fragment targets existed; the external link returned 200.
- Live HTML uses `public, must-revalidate, max-age=30`. Hashed JS/CSS use
  `public, max-age=31536000, immutable`.
- Live response headers include HSTS, `nosniff`, strict-origin referrer policy,
  and a CSP with `frame-ancestors 'none'`. The CSP allows connections only to
  self and the documented Sociobot API.

## Product behavior exercised

### Packed extension

- Empty state: the popup said focused controls and warnings would appear after
  recording and offered **Record this tab**.
- Normal route: Alpha → Beta → Gamma was recorded in browser order with no
  findings.
- Boundary order: `tabindex=1`, `tabindex=2`, then ordinary control recorded
  Beta → Alpha → Gamma with no false skip.
- Loop: Alpha → Beta → Alpha produced loop evidence.
- Invisible focus: controls with removed/transparent focus treatment produced
  `invisible-focus` findings; visible background and wrapper
  `:focus-within` treatments were accepted.
- True skip and recovery: forced Alpha → Gamma warned `Expected Beta; focus
  moved to Gamma.`; Shift+Tab then recorded Beta as `reverse` without a false
  loop.
- Privacy boundary: reports kept accessible names, roles, order, and a safe
  origin/path while removing form values, page titles, credentials, query
  values, and fragments.
- Injection boundary: markup-like `aria-label` text remained text in the popup
  and created no injected control.
- Export produced a real JSON download. Clear returned the popup to its empty
  state.
- Invalid input recovery: submitting an empty license announced **“Paste your
  license token first.”**; a rejected token announced **“This license is not
  active. Check the token and try again.”** and kept the field available.
- The full browser suite also passed existing-license transfer, local archive
  save, cached offline verdict, and single-destination verification checks.
- Fresh axe scans of both empty and populated extension popups found no
  violations. There were no popup console/page errors.

### One-click demo

- The first click entered demo mode and focused **Review a keyboard route.**
- Only `demo:krc:sample-report` existed in localStorage.
- Reset recreated only that demo key.
- Keyboard activation exported `sample-keyboard-route-report.json` with five
  named stops and the three sample findings: invisible focus, skip, and loop.
- **Start for real** returned home and left localStorage empty.
- The entire flow made only same-origin requests and raised no console/page
  errors.
- After the first load, the sample JSON export still worked while the browser
  was offline. The site is not a PWA and makes no offline-reload claim.

## Accessibility and responsive QA

- Axe 4.11 found zero violations of any impact on `/`, `/demo`, `/privacy`,
  `/terms`, and the styled 404 at both 1440×900 and 390×844.
- Every audited route had `lang=en`, a route-specific title, exactly one `h1`,
  one `main`, ordered headings, and no missing image alt text.
- No valid route had console/page errors. Chromium's expected failed-resource
  message appeared only for the deliberately requested HTTP 404 document.
- There was no horizontal overflow or undersized visible control at either
  audited size. The landing page also reflowed at 320 px with no overflow.
- At 390 px, the headline, audience sentence, demo action, immediate result,
  and all three facts fit the first 844 px viewport.
- Keyboard-only navigation reached the skip link first, then every action with
  a visible 3 px designed outline. Activating the skip link positioned main at
  the top and the next Tab bypassed header navigation for the primary action.
- Keyboard activation of the primary demo action worked, moved focus to the
  new route `h1`, and demo Reset/Export/Start-for-real actions all worked.
- The repository's rendered focus-contrast checks passed for every public
  control and the packed popup, requiring at least 3:1.
- Under `prefers-reduced-motion: reduce`, no element had a non-zero transition
  or animation duration.
- `/opt/fleet/lib/verify-url.sh` passed live `/` and `/?demo=1`: HTTP 200,
  title, `lang`, one `h1`, `main`, alt text, labeled buttons, and no errors.
  Evidence is under `.factory/qa-artifacts/verify-8-home/` and
  `.factory/qa-artifacts/verify-8-demo/`.

## Privacy, requests, and server allowance

- Cold landing and the complete demo/export/reset/exit flow made only
  same-origin requests. There were no analytics, trackers, CDN fonts, or
  third-party scripts.
- Packed-extension recording made no report request. The only permitted
  external runtime request observed was an explicit license check to
  `https://api.sociobot.in/api/v1/products/keyboard-route-check/verify`.
- The license API rate limit was verified from one client with an invalid test
  token: requests 1–30 returned 200; request 31 returned **429** with
  `Retry-After: 4` and `x-ratelimit-after: 4`. Observed allowance: **30
  requests per client burst**.
- The site requires no sign-in. Entra tenant checks therefore do not apply.
- There is no product backend, database, library/CLI consumer surface, or PWA
  service worker. Backend concurrency/persistence, package-consumer, and PWA
  update checks do not apply. The extension's MV3 background service worker is
  not a site PWA service worker.

## Performance and bundle budgets

Fresh live mobile Lighthouse 12.8.2 results:

- Performance: **100**
- Accessibility: **100**
- Best Practices: **100**
- SEO: **100**
- FCP: **0.8 s**
- LCP: **1.8 s**
- TBT: **10 ms**
- CLS: **0**
- Total transfer: **204 KiB**

Production sizes:

- Site JavaScript: 13,161 bytes (4.88 KB gzip), below 200 KB.
- Site CSS: 9,363 bytes (2.70 KB gzip), below 50 KB.
- Fonts: 0 bytes; system fonts only.
- Hero WebP: 199,746 bytes, below 300 KB.
- Extension content script: 11,242 bytes.
- Extension ZIP: 467,790 bytes.

Lighthouse evidence:
`.factory/qa-artifacts/lighthouse-verification-8.json`.

## Visual/product review

The cassette-era field-tape design matches `.factory/design.md`: warm paper,
ink outlines, acid-lime focus marks, signal-red findings, local system type,
and original cassette artwork. Desktop and 390 px screenshots show a distinct
product-specific interface rather than a generic framework layout. The copy is
plain, the boundary against certification is explicit, and the unavailable
paid purchase is stated without a dead checkout.

## Reproduction

```sh
npm ci
# Run every `test` string in .factory/claims.json separately.
npm test
npm run typecheck
npm run lint
npm audit --omit=dev --audit-level=high
npm run build
unzip -t .output/keyboard-route-check-1.0.0-chrome.zip
npm run test:browser
node scripts/verify-live.mjs
```

Fresh machine-readable live evidence is in
`.factory/qa-artifacts/verification-8-live-audit.json`.
