# Polish 2 — cumulative review closure

Repair commit: `f69ae69bb5ff2474f7495874d957ac026c361150`.
Deployed URL: <https://keyboard-route-check.sociobot.in>.

Every finding in `review-1.md` and `review-2.md` was checked again against the
deployed product. “Pass” evidence below is from the final clean-clone test run
or the cold live check, not an assertion that a control merely exists.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept History API route rendering; each destination `h1` is focusable and focused, and the polite live region announces it on navigation and Back. | Browser test `header routes and Back focus and announce each destination heading`; cold live [`/demo`](https://keyboard-route-check.sociobot.in/demo) check in `node scripts/verify-live.mjs`; screenshot `.factory/evidence/polish-2-live-route-focus.png`. |
| F-1-2 | Removed the non-useful public artwork-originality sentence from the footer. Asset provenance stays in `.factory/design.md`. | Browser test `review copy uses useful section labels, plain terms, and an honest local archive name` rejects `Generated artwork`; cold live [home](https://keyboard-route-check.sociobot.in/) check; copy audit. |
| F-1-3 | Retained the earlier plain-language control-name/type and earlier-control wording. | Browser test `review copy uses useful section labels, plain terms, and an honest local archive name`; [home](https://keyboard-route-check.sociobot.in/) cold check; `.factory/copy-audit.md`. |
| F-1-4 | Retained the explicitly browser-only local report archive copy, no-sync/no-share statement, and unavailable-purchase notice. | `@claim:team-archive-local`, `@claim:team-archive-unavailable`; cold live [home](https://keyboard-route-check.sociobot.in/) and [terms](https://keyboard-route-check.sociobot.in/terms) checks. |
| F-1-5 | Retained `/404` canonical and the clearly disclosed external footer link. | Browser test `every route has complete route-specific metadata and clear external link text`; cold live [`/404`](https://keyboard-route-check.sociobot.in/404) check in `verify-live.mjs`. |
| F-2-1 | Renamed the action **Download Chrome extension ZIP** and added a live **Install in desktop Chrome or Chromium** section: download, extract, `chrome://extensions`, Developer mode, Load unpacked, folder selection, and mobile-Chrome limitation. | Browser test `the landing page explains desktop installation and downloads an unpacked extension ZIP` downloads the artifact and asserts root `manifest.json`; cold live [home](https://keyboard-route-check.sociobot.in/) check. |
| F-2-2 | Replaced the first-screen facts with price, privacy, and offline facts. Added a real packed-MV3 offline-recording claim test. | `@claim:free-report-export`, `@claim:route-data-local`, `@claim:offline-recording`; screenshot `.factory/evidence/polish-2-live-home-mobile.png`; cold live [home](https://keyboard-route-check.sociobot.in/) check. |
| F-2-3 | Rewrote the audience sentence as “For keyboard users and web teams checking how focus moves through a page.” | Browser test `review copy uses useful section labels, plain terms, and an honest local archive name`; screenshot `.factory/evidence/polish-2-live-home-mobile.png`; cold live [home](https://keyboard-route-check.sociobot.in/) check. |
| F-2-4 | Renamed the report heading **Route findings**. | Browser test `review copy uses useful section labels, plain terms, and an honest local archive name`; cold live [`/?demo=1`](https://keyboard-route-check.sociobot.in/?demo=1) check. |
| F-2-5 | Renamed the third step **Export the report** and replaced “share defects” in brief, website metadata, and extension metadata with export/possible-focus-problems wording. | Browser test `review copy uses useful section labels, plain terms, and an honest local archive name`; browser test `every route has complete route-specific metadata and clear external link text`; cold live [home](https://keyboard-route-check.sociobot.in/) check. |
| F-2-6 | Replaced README’s implementation-oriented “static companion site” wording with “website.” | README review and `.factory/copy-audit.md`; fresh-clone quality run at `f69ae69bb5ff2474f7495874d957ac026c361150`. |

## Final evidence

- Fresh clone `/tmp/krc-clean-cACNpV`: `npm ci`, `npm run typecheck`, `npm test`
  (12/12), `npm run test:browser` (29/29), and `npm run build` passed.
- All 15 exact `.factory/claims.json` commands passed individually from that
  fresh clone, including `@claim:offline-recording`.
- `npm audit --omit=dev --audit-level=high` found 0 vulnerabilities.
- `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip` passed; the browser
  install-flow test separately confirms root `manifest.json` in the downloaded ZIP.
- Live: `node scripts/verify-live.mjs` passed five routes, demo reset/exit,
  metadata/404, focus/Back, offline sample export, mobile fit, no console
  errors, and Playwright axe serious/critical checks. `verify-url.sh` passed
  [home](https://keyboard-route-check.sociobot.in/) and
  [demo](https://keyboard-route-check.sociobot.in/?demo=1).

No review finding is deferred.
