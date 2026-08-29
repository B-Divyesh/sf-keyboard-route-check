# Keyboard Route Check — polish 4 handoff

## Status: PASS — zero unresolved findings

Repair commit: `92a29d622588cc6f33d9688cb014b1c215a62cee`.
Deployed static site: <https://keyboard-route-check.sociobot.in>.

## What changed

- Closed F-4-1. The unsupported-phone assertion was removed while the useful
  desktop installation instructions remain.
- Added `.factory/claims.json` entry `license-check-online` and a real packed
  MV3 test. A new license submitted offline gets the clear recovery message
  “Connect to the internet and try again” and cannot unlock the local archive.
- Kept the one-click `?demo=1` sample path isolated, the existing cassette-zine
  visual system, routing/meta/404 behavior, legal links, and all earlier
  review repairs intact.
- Updated the verb-first catalog description to: “Record keyboard focus routes
  and export reports of possible focus problems.”

## Verification evidence

- Fresh clone `/tmp/krc-polish4-clean-djPffi`: `npm ci`; `npm test` 12/12;
  `npm run typecheck`; `npm run lint`; `npm run build`; every one of the 17
  exact declared claim commands separately; `npm run test:browser` 32/32;
  `npm audit --omit=dev --audit-level=high` (0 vulnerabilities); and
  `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip` all passed.
- Claim F-4-1 evidence: `npm run test:claims -- --grep @claim:license-check-online`
  selected one packed-extension test and passed from that clean clone.
- Local mobile Lighthouse: 98 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO, 2.4 s LCP, CLS 0:
  `.factory/evidence/polish-4-lighthouse-mobile.json`.
- After deployment, `node scripts/verify-live.mjs
  https://keyboard-route-check.sociobot.in` passed desktop/mobile first-read,
  titles/canonicals, real 404, route focus/Back, demo isolation/reset/exit,
  same-origin traffic, offline export, console, and axe serious/critical scans.
  `verify-url.sh` passed the live home and demo. Evidence is under
  `.factory/evidence/polish-4-live/`.
- Cold live F-4 check at 390×844 confirms the old phone sentence is absent,
  the desktop-install heading is present, the one-click demo resets/exits
  cleanly, and no console errors occur. Screenshot:
  `.factory/evidence/polish-4-live/f4-cold-mobile.png`.
- Live mobile Lighthouse: 100 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO, 1.8 s LCP, CLS 0:
  `.factory/evidence/polish-4-live/lighthouse-mobile.json`.

## Re-run

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:browser
node scripts/verify-live.mjs https://keyboard-route-check.sociobot.in
```

Run each exact command listed in `.factory/claims.json` separately from a
fresh profile. The product has no known gaps for this work order.
