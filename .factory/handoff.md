# Keyboard Route Check — repair 6 handoff

## Status

**PASS.** Both release blockers in `.factory/verification-7.md` for candidate
`8ed6fa68c86a60f5ae7882556bf6df73302c2909` are repaired. The extension and
static companion site keep the original WXT + TypeScript MV3 artifact and
static deployment classes.

The repair source is in commits `08e0064` and `3d2b00d`, pushed to
`origin/main`. Static deployment
`6e93c282-41f5-4f0e-9052-0e4dc6aa2442` succeeded in the existing Central US
Static Web App. The repaired product is live at
<https://keyboard-route-check.sociobot.in>.

## What changed

- The recorder now reads the browser's native `labels` association. Explicit
  and wrapping labels therefore produce the correct control name.
- Before each Tab or Shift+Tab move, the recorder snapshots focus styles for
  the next control and its ancestors. It compares those styles after focus
  moves, so a visible wrapper `:focus-within` treatment counts as a focus mark
  without treating unchanged wrapper decoration as focus feedback.
- **Export sample report** now uses the existing acid-lime focus ring on its
  dark tape header. Its rendered contrast increased from 2.51:1 to 10.38:1.
- A packed-extension regression reproduces the verifier's wrapped **Work
  email** input, removed input outline, visible parent ring, and secret value.
  It asserts the right label, `focusMark: true`, no false finding, and no value
  disclosure.
- A rendered browser regression measures every visible interactive focus ring
  on `/`, `/demo`, `/privacy`, `/terms`, and `/404` against its adjacent
  surface and requires at least 3:1.
- The existing extension-download test now waits for Chrome to finish writing
  the file before reading it, removing a filesystem race found during the
  required independent claim reruns.

## Verification evidence

Final checks ran on 2026-08-29 UTC.

- `npm ci`: 176 packages installed from the lockfile; 0 vulnerabilities.
- Every one of the 12 commands in `.factory/claims.json`: passed separately,
  with exactly one selected test per claim.
- `npm test`: 12/12 passed.
- `npm run typecheck` and `npm run lint`: passed.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- `npm run build`: passed and produced `.output/chrome-mv3`, the MV3 ZIP, and
  `dist/site`.
- `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip`: every entry passed.
- `npm run test:browser`: 25/25 passed. This covers the packed extension,
  forward/reverse and positive-tabindex routes, cycles, labels, focus marks,
  redaction, export, license recovery, keyboard navigation, desktop, 390 px,
  all-route focus contrast, touch targets, axe, reduced motion, offline sample
  export, demo isolation, routing, metadata, and response-policy config.
- The supplied `verify-url.sh` passed locally and live for `/` and `/?demo=1`:
  HTTP 200, `lang=en`, one `h1`, one `main`, complete image alt text, labeled
  buttons, and no console errors. Fresh live evidence is in
  `.factory/evidence/repair-6-live-home/` and
  `.factory/evidence/repair-6-live-demo/`.
- Playwright axe 4.11 found no serious or critical findings on all five public
  routes at desktop and 390 px.
- The live 390 px demo has no horizontal overflow, no active motion under
  reduced-motion, no console errors, and only same-origin requests. The live
  export focus ring is 3 px acid lime (`#b9df49`) against tape (`#20231f`), a
  measured 10.3768:1.
- Offline after the first demo load, sample export still downloads the full
  JSON report. This product is not a PWA and makes no offline-reload claim.
- Local Lighthouse mobile: Performance 99, Accessibility 100, Best Practices
  100, SEO 100; LCP 2.3 s, TBT 0 ms, CLS 0.
- Live Lighthouse mobile: 100/100/100/100; FCP 0.8 s, LCP 1.8 s, TBT 20 ms,
  CLS 0, total transfer 204 KiB. Full output is
  `.factory/evidence/lighthouse-live.json`.
- Production sizes: site JavaScript 13,161 bytes, CSS 9,363 bytes, hero WebP
  199,746 bytes, content script 11,240 bytes, and extension ZIP 467,790 bytes.
- All 17 publicly served build files byte-match `dist/site`. The local,
  copied, and live extension ZIP SHA-256 is
  `f0889eae2febd178a5b93b29bcdc84d480ce1558e99afc077f42cd13f503a2bf`.
- Every public anchor returned 200. An unknown route returned the styled 404
  with HTTP 404.
- Live responses include HSTS, `nosniff`, strict-origin referrer policy, and a
  CSP with `frame-ancestors 'none'`. HTML revalidates after 30 seconds; hashed
  JavaScript and CSS are immutable for one year.
- The extension remains MV3 with the declared storage, tabs, downloads, and
  page-access permissions. There is no product service worker or custom
  extension update endpoint, so PWA/update migration checks do not apply.

## Run and verify

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

Run each `test` value in `.factory/claims.json` separately to repeat the claim
gate. Deploy only `dist/site`:

```sh
/opt/fleet/lib/deploy-static.sh keyboard-route-check dist/site
```

## Known gaps and next steps

No release-blocking gaps remain. New local archive purchases remain
intentionally unavailable, as the product and README state; existing licenses
still transfer and verify through the documented Sociobot endpoint.
