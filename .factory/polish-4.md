# Polish 4 — cumulative zero-finding closure

Repair commit: `92a29d622588cc6f33d9688cb014b1c215a62cee`.
Deployment: <https://keyboard-route-check.sociobot.in> (Static Web Apps deployment `b6cacca7-7538-4155-9590-a4d63547cd09`).

This round re-read every `review-*.md` and `polish-*.md`. The table records
the current implementation for every unique finding id. All live checks below
ran after the deployment above, from new browser contexts.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | History navigation and Back focus the destination `h1` and announce it through the polite live region. | Browser test `header routes and Back focus and announce each destination heading`; [route focus](evidence/polish-4-live/route-focus.png); live `/demo` then Back in `node scripts/verify-live.mjs`. |
| F-1-2 | Public headings name their content; field-tape/artwork slogans remain only in the design provenance. | Browser test `review copy uses useful section labels, plain terms, and an honest local archive name`; [cold mobile](evidence/polish-4-live/home-mobile.png); live `/`. |
| F-1-3 | First-read and README copy use control name/type, earlier control, and accessibility requirements. | Browser test `review copy uses useful section labels, plain terms, and an honest local archive name`; `.factory/copy-audit.md`; live `/` and `/privacy`. |
| F-1-4 | The paid feature is consistently a browser-only local report archive with no sync/share and no current checkout. | `@claim:team-archive-local`; `@claim:team-archive-unavailable`; live `/` and `/terms`. |
| F-1-5 | The designed 404 has a canonical URL; the footer visibly marks the Param Factory link as external. | Browser test `every route has complete route-specific metadata and clear external link text`; [footer](evidence/polish-4-live/footer.png); live `/404`. |
| F-2-1 | The live installation path names desktop Chrome/Chromium, ZIP extraction, `chrome://extensions`, Developer mode, and Load unpacked. | Browser test `the landing page explains desktop installation and downloads an unpacked extension ZIP` asserts root `manifest.json`; cold live `/` check. |
| F-2-2 | The first screen shows free export, local route data, and offline recording/license connection facts, each backed by claims. | `@claim:free-report-export`; `@claim:route-data-local`; `@claim:offline-recording`; [mobile first screen](evidence/polish-4-live/home-mobile.png); live `/`. |
| F-2-3 | The audience sentence describes checking how focus moves through a page, without jargon or an untested prevention promise. | Browser test `review copy uses useful section labels, plain terms, and an honest local archive name`; live `/`. |
| F-2-4 | The report section is named `Route findings`. | Browser test `review copy uses useful section labels, plain terms, and an honest local archive name`; live `/?demo=1`. |
| F-2-5 | Product copy, metadata, and instructions use `export` for the actual report action. | Browser test `review copy uses useful section labels, plain terms, and an honest local archive name`; live `/`. |
| F-2-6 | Public documentation and legal copy use `website`, not internal companion-site terminology. | Browser test `review copy uses useful section labels, plain terms, and an honest local archive name`; live `/privacy`. |
| F-3-1 | Demo mode is determined before checkout processing; a demo URL strips and ignores a returned token and uses only the `demo:` namespace. | `@claim:demo-isolated`; cold [F-4 mobile check](evidence/polish-4-live/f4-cold-mobile.png); live `/?demo=1&license=adversarial-sentinel` in `node scripts/verify-live.mjs`. |
| F-3-2 | Checkout-return tokens stay only in the return tab’s `sessionStorage`, never website local storage. | `@claim:checkout-token-session-only`; live `/?license=session-only-live-token` in `node scripts/verify-live.mjs`; live `/privacy`. |
| F-3-3 | The phone-visible download label says `Download desktop Chrome extension ZIP`; the unsupported-phone assertion is gone. | Browser test `the complete first-read message fits the initial 390px viewport without horizontal overflow`; [F-4 cold mobile](evidence/polish-4-live/f4-cold-mobile.png); live `/`. |
| F-4-1 | Removed the untestable phone-platform statement. Added `license-check-online`, with an offline packed-extension flow that shows a recovery error and leaves the archive locked. | `npm run test:claims -- --grep @claim:license-check-online` (1 passed in clean clone); [F-4 cold mobile](evidence/polish-4-live/f4-cold-mobile.png); live `/` confirms the old statement is absent and the tested connection fact remains. |

## Final evidence

- Fresh clone `/tmp/krc-polish4-clean-djPffi` at the repair commit: `npm ci`,
  `npm test` (12/12), typecheck, lint, build, all 17 exact claim commands,
  `npm run test:browser` (32/32), production audit (0 vulnerabilities), and
  `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip` all passed.
- Post-deploy `node scripts/verify-live.mjs https://keyboard-route-check.sociobot.in`
  passed routing, titles/canonicals, real 404, focus/Back, demo isolation,
  reset/exit, same-origin traffic, offline demo export, mobile layout, console,
  and axe serious/critical checks. `verify-url.sh` passed both `/` and
  `/?demo=1`; its screenshots and reports are under
  `evidence/polish-4-live/verify-home/` and `evidence/polish-4-live/verify-demo/`.
- Mobile Lighthouse against the deployed URL scored 100 Performance, 100
  Accessibility, 100 Best Practices, and 100 SEO; LCP was 1.8 s and CLS was 0.
  See `evidence/polish-4-live/lighthouse-mobile.json`.

No finding is deferred.
