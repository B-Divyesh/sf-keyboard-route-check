# Keyboard Route Check — repair 5 handoff

## Release status

**PASS — repair ready.** This repair starts from failed verifier candidate
`54b1d01801edab0a262c142249f83d8ca1b60fa8` and is committed and pushed as
`d80010d` (`fix focus evidence and claims coverage`). The static companion
site was deployed on 2026-08-29 to
https://keyboard-route-check.sociobot.in.

## What changed

1. The packed extension popup now uses the signal-red `#b42a35` focus ring on
   paper-backed controls. Its contrast against `#f4ecd8` is **5.37:1**; the
   tape-panel recording control retains a high-contrast cream ring.
2. The focus detector now compares a focused control with an inert, unfocused
   clone. It recognizes focus-only background, text, and border changes when
   the change is at least 3:1, while retaining the existing transparent and
   low-contrast outline/shadow detection.
3. The public availability statement, “New team archive purchases are
   temporarily unavailable.”, is registered as
   `team-archive-unavailable` in `.factory/claims.json` with its exact tagged
   browser test. The test verifies the notice and absence of a dead checkout
   link on both the landing and terms pages.
4. Added exact regressions:
   - a packed-popup keyboard contrast check for **Team archive license** and
     **Clear route**;
   - a real MV3 recording fixture where a button changes from white/black to
     black/white while retaining its 4px border; it must not produce an
     `invisible-focus` finding;
   - a unit-level focus-style comparison test.

## Verification performed

All commands ran from a clean `npm ci` install.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 401 packages installed from lockfile |
| `npm test` | PASS — 12 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| Every exact `.factory/claims.json` command | PASS — 11 commands, one selected test each |
| `npm run test:browser` | PASS — 19 Playwright tests |
| `npm run build` | PASS — MV3 directory, ZIP, and `dist/site` produced |
| `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip` | PASS |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 production vulnerabilities |

Browser coverage includes packed MV3 record/stop/clear/export, forward and
reverse route order, loop and skip evidence, hostile labels, positive
`tabindex`, transparent focus, the repaired background-focus behavior, popup
keyboard contrast, license recovery/offline behavior, demo isolation, privacy
request logging, offline demo export, 390px controls, skip-link keyboard use,
and reduced motion. Axe runs cover `/`, `/demo`, `/privacy`, and `/terms` at
desktop and 390px with zero serious or critical violations.

The local `verify-url.sh` run reported title, `lang=en`, one `h1`, one `main`,
complete image alternatives, no unlabeled buttons, and no console errors.
Mobile Lighthouse 13.4.1 against the production build scored **99 performance,
100 accessibility, 100 best practices, and 100 SEO** (FCP 904 ms, LCP 2,256
ms, TBT 0 ms, CLS 0). Built site assets are 11,017-byte JS (4.24 KB gzip),
8,903-byte CSS (2.59 KB gzip), and a 199,746-byte hero image.

## Deployment and live evidence

`/opt/fleet/lib/deploy-static.sh keyboard-route-check dist/site` completed
successfully. The production root, `/demo`, `/privacy`, `/terms`, robots,
sitemap, and extension download return 200; an unknown route returns the
styled 404 with HTTP 404.

- `verify-url.sh https://keyboard-route-check.sociobot.in/` passed in 659 ms
  with no console errors.
- Live Playwright + axe audited `/`, `/demo`, `/privacy`, `/terms`, and the
  404 at 1440px and 390px: zero axe violations, no valid-route console or page
  errors, one `h1` and `main` per page, no missing alt text, no horizontal
  overflow, and no undersized visible controls. The browser's normal 404
  resource message occurred only on the intentional unknown route.
- The live one-click demo produced five exported stops while offline after
  initial load; it used only `demo:krc:sample-report`, reset it in place,
  discarded it on exit, made same-origin requests only, and reduced motion
  resolved both transitions and animations to `0s`.
- Live headers include HSTS, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and the self/Sociobot CSP
  with `frame-ancestors 'none'` delivered as a response header.
- The live extension download SHA-256 is
  `804761817544f0d80fc74bc1e68ca82245ded293ff701b437e3f7e4c84838797`,
  exactly matching `dist/site/downloads/keyboard-route-check.zip` and the
  locally verified package. Deployed HTML, JS, CSS, imagery, and metadata
  files were byte-compared with `dist/site`.

## Run, test, and deploy

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run test:browser
npm run build
npm audit --omit=dev --audit-level=high
/opt/fleet/lib/deploy-static.sh keyboard-route-check dist/site
```

Use `/demo` (or `/?demo=1`) for the isolated sample. Load
`.output/chrome-mv3` in Chromium for the unpacked extension; the distributed
ZIP is at `dist/site/downloads/keyboard-route-check.zip`.

## Known gaps

- `npm ci` reports 10 advisories in development-only build/test tooling. The
  production audit is clean; no production dependency is affected.
- New team archive purchases remain intentionally unavailable. The product
  now says so consistently and tests that no dead checkout is presented;
  existing returned licenses can still be verified in the extension.
