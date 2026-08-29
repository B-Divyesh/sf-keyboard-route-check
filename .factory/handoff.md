# Keyboard Route Check — repair 4 handoff

## Release status

**Deployed and ready for verification.** The repaired product source is commit
`55d90c842b6e8e98338046d52fc6be5d1347551c`, pushed to `main` on 2026-08-29.
It remains an MV3 browser extension with a static companion site at
https://keyboard-route-check.sociobot.in. Static Web Apps deployment
`d1995a88-ada4-4c74-a3ac-2a037021e2ff` completed successfully.

## What changed

- Focus-marker detection now requires a perceptible, at-least-3:1 contrasting
  outline or non-zero shadow. Transparent, zero-geometry, and same-color
  indicators produce the existing `invisible-focus` finding. The packed-MV3
  regression tabs to `outline: 3px solid transparent` on a real page.
- Route context now removes URL credentials, query data, and fragments. Page
  titles are not collected (`Page title not collected`). Privacy text and the
  extension footer disclose every retained field: safe page origin/path,
  control labels, roles, directions, timing, stable identifiers, and findings.
  The real exported extension JSON is regression-tested with both a form value
  and a `session_token` URL query fixture.
- The unavailable external `$29` checkout link was removed. The live endpoint
  was independently and locally confirmed as `404 {"error":"enabled factory
  product","status":404}`; leaving it advertised would send visitors to a
  dead purchase flow. The site now plainly says new archive purchases are
  temporarily unavailable while retaining the optional local archive for valid
  existing licenses.
- Checkout-return tokens now survive URL cleanup and are clearly shown on the
  companion site with a Copy button and exact extension paste/verify steps.
  The packed extension test opens `?license=…`, confirms cleanup and display,
  pastes that token, stubs the documented Sociobot verification response, and
  saves the resulting report locally.
- Offline license revalidation retains a previously valid archive verdict;
  missing and invalid token submissions remain open and announce actionable
  errors. Popup and report task text were raised to the 16px baseline.
- Cleared the demo-banner axe minor role issue, aligned the wordmark’s visible
  and accessible names, and added a product-derived 1200×630 social card plus
  Open Graph/Twitter metadata on every static route.

## Regression and claim coverage

`.factory/claims.json` now contains ten claims. Each exact grep selects one
test; the combined claim run selected eight tests because two packed-extension
tests cover paired claims:

```sh
npm run test:claims -- --grep @claim:
# 8 passed
```

The strengthened real-MV3 coverage includes route privacy/export,
transparent-focus reporting, checkout-return handoff, local archive storage,
positive `tabindex`, loop reporting, and label escaping. The demo claims keep
their isolated localStorage and unauthenticated export coverage.

## Verification evidence

Clean-install and production checks run in `/work/repo` on 2026-08-29:

```sh
npm ci
npm test                         # 11 passed
npm run typecheck                # pass
npm run lint                     # pass
npm run test:browser             # 17 passed
npm run build                    # pass; dist/site, MV3 directory, zip
npm run test:claims -- --grep @claim:  # 8 passed
npm audit --omit=dev --audit-level=high # 0 production vulnerabilities
unzip -t .output/keyboard-route-check-1.0.0-chrome.zip # pass
```

`npm ci` still reports 10 development-tree advisories inherited through build
tooling; the shipped production audit is clean.

`/opt/fleet/lib/verify-url.sh` passed against the local built site in 560 ms
(`/tmp/krc-verify-repair.0B8CWD/verify.json`): title, `lang=en`, one `h1`, a
`main`, no missing image alt, and no page/console errors. The built site is
4.23 KB gzip JavaScript and 2.61 KB gzip CSS; the hero is 199,746 bytes.

Mobile Lighthouse against `dist/site` scored **99 performance**, **100
accessibility**, **100 best practices**, and **100 SEO** (FCP 1.0 s, LCP 2.2
s, CLS 0) in `/tmp/krc-lighthouse.nVDpA1.json`.

Live post-deploy verification passed in 603 ms
(`/tmp/krc-live-repair-final.yqFdSL/verify.json`), with no console/page errors and
the same title/language/landmark/alt checks. `/`, `/demo`, `/privacy`,
`/terms`, `/robots.txt`, `/sitemap.xml`, and the downloadable extension zip
returned 200; an unknown route returned 404. Fresh axe scans of `/`, `/demo`,
`/privacy`, and `/terms` at 1440px and 390px found **zero serious or critical
violations**. The live 390px run also confirmed no horizontal overflow,
44px-or-larger controls, and first-Tab focus on the skip link.

Deployment identity was checked after publication. SHA-256 matched between
`dist/site` and the live `index.html`, hashed JS, hashed CSS, and social card;
the downloaded extension zip unpacked with no differences from the locally
built MV3 archive. Live headers include the deployed CSP,
`Referrer-Policy: strict-origin-when-cross-origin`, HSTS, and `nosniff`.

## Run, package, and deploy

```sh
npm ci
npm run build
npm run test:browser
```

Load `.output/chrome-mv3` as an unpacked extension for local use. The packaged
consumer artifact is `.output/keyboard-route-check-1.0.0-chrome.zip`; the
static deployment artifact is `dist/site`, including
`downloads/keyboard-route-check.zip`. `/demo` is the one-click isolated
sample.

Deploy with the configured work-order command:

```sh
/opt/fleet/lib/deploy-static.sh keyboard-route-check dist/site
```

## Known external follow-up

New team-archive purchases remain unavailable because the factory Sociobot/Dodo
product mapping is not enabled. No replacement payment provider or redirect
was introduced. Once the factory enables the documented checkout endpoint and
sets the return URL/entitlement, restore the exact price and checkout control,
then add a claim that verifies the real hosted-checkout redirect before
advertising it.
