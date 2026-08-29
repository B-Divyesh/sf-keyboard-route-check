# Keyboard Route Check — polish round 2 handoff

## Status: shipped

Repair commit: `f69ae69bb5ff2474f7495874d957ac026c361150`.

The deployed static site is <https://keyboard-route-check.sociobot.in>. The
artifact remains an MV3 browser extension plus static landing site. This repair
closes every finding in `.factory/review-1.md` and `.factory/review-2.md`.
The detailed finding-to-evidence map is `.factory/polish-2.md`.

## What changed

- Added the complete real installation path: **Download Chrome extension ZIP**,
  extract it, open `chrome://extensions`, enable Developer mode, choose **Load
  unpacked**, and select the folder. The page says mobile Chrome cannot run it.
- Kept the one-click isolated `/?demo=1` path, persistent demo banner, Reset
  demo, Start for real, offline sample export, and separate `demo:` storage.
- Rewrote the first screen with plain audience wording plus price, privacy, and
  offline facts. Added the packed-extension `offline-recording` claim.
- Removed the remaining decorative artwork claim; renamed the report heading to
  **Route findings** and the product action to **Export the report**.
- Updated brief/catalog/README/website/extension metadata to use “export a
  report of possible focus problems.” Catalog description is verb-first and 75
  characters.
- Preserved the cassette-zine identity, route focus announcement, real routes,
  titles, metadata, designed 404, legal links, mobile layout, and local-first
  privacy behavior.

## Verify

```sh
npm ci
npm run typecheck
npm test
npm run test:browser
npm run build
```

The static deployment output is `dist/site`; deploy with:

```sh
/opt/fleet/lib/deploy-static.sh keyboard-route-check dist/site
```

## Evidence

- Fresh clone `/tmp/krc-clean-cACNpV` at the repair commit: `npm ci`,
  `npm run typecheck`, `npm test` (12/12), `npm run test:browser` (29/29), and
  `npm run build` all passed.
- Every one of the 15 exact commands in `.factory/claims.json` passed
  individually from that clean clone.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- Extension package: `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip`
  passed. The browser test downloads the public ZIP and verifies root
  `manifest.json`.
- Live after deployment: `node scripts/verify-live.mjs` passed five routes,
  demo storage/reset/exit, metadata/404, focus/Back, mobile fit, offline demo
  export, no console errors, and axe serious/critical checks. `verify-url.sh`
  passed the home and `?demo=1` URLs with title, `lang`, `main`, image-alt, and
  unlabeled-button checks.
- Screenshots: `.factory/evidence/polish-2-live-home-mobile.png`,
  `.factory/evidence/polish-2-live-route-focus.png`, and
  `.factory/evidence/polish-2-live-footer.png`.

## Known gaps

None. New local archive purchases remain intentionally unavailable, as stated
on the landing and terms pages; this is covered by a claim test and is not a
deferred implementation item.
