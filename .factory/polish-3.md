# Polish 3 — cumulative review closure

Repair commit: `558a2ad4e1d64e0c34ce3f04791ffebee91d26ff`.
Deployed URL: <https://keyboard-route-check.sociobot.in>.

The table maps every finding in `review-1.md`, `review-2.md`, and
`review-3.md` to its implemented state. Evidence is a real assertion, a cold
live check, or both.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | History navigation focuses the destination `h1`, updates the polite announcement, and does the same on Back. | Browser test `header routes and Back focus and announce each destination heading`; cold live [`/demo`](https://keyboard-route-check.sociobot.in/demo) in `node scripts/verify-live.mjs`; `evidence/polish-3-live-route-focus.png`. |
| F-1-2 | Removed decorative field-tape/artwork copy from the public UI; headings now name their content. Provenance remains only in `.factory/design.md`. | Browser test `review copy uses useful section labels, plain terms, and an honest local archive name`; cold [home](https://keyboard-route-check.sociobot.in) check. |
| F-1-3 | Public copy uses control name/type, earlier control, and accessibility requirements rather than the quoted unexplained terms. | Browser test `review copy uses useful section labels, plain terms, and an honest local archive name`; `.factory/copy-audit.md`; cold [home](https://keyboard-route-check.sociobot.in) check. |
| F-1-4 | The feature is consistently a local report archive: one browser only, no sync/share, and purchases unavailable. | `@claim:team-archive-local`, `@claim:team-archive-unavailable`; cold [home](https://keyboard-route-check.sociobot.in) and [terms](https://keyboard-route-check.sociobot.in/terms) checks. |
| F-1-5 | The designed 404 retains its canonical and the footer discloses its external destination. | Browser test `every route has complete route-specific metadata and clear external link text`; cold [`/404`](https://keyboard-route-check.sociobot.in/404) check in `verify-live.mjs`. |
| F-2-1 | The first action and installation steps now name a desktop Chrome extension ZIP, extraction, `chrome://extensions`, Developer mode, and Load unpacked. | Browser test `the landing page explains desktop installation and downloads an unpacked extension ZIP`; live [home](https://keyboard-route-check.sociobot.in) check; packed ZIP `unzip -t` passed. |
| F-2-2 | The first screen shows price, privacy, and offline facts with matching claims. | `@claim:free-report-export`, `@claim:route-data-local`, `@claim:offline-recording`; `evidence/polish-3-live-home-mobile.png`. |
| F-2-3 | The audience sentence states the direct checking task without development jargon or an untested prevention outcome. | Browser test `review copy uses useful section labels, plain terms, and an honest local archive name`; `evidence/polish-3-live-home-mobile.png`. |
| F-2-4 | The sample report heading is `Route findings`. | Browser test `review copy uses useful section labels, plain terms, and an honest local archive name`; cold [`/?demo=1`](https://keyboard-route-check.sociobot.in/?demo=1) check. |
| F-2-5 | Product copy, metadata, and steps consistently say export, not share. | Browser tests `review copy uses useful section labels, plain terms, and an honest local archive name` and `every route has complete route-specific metadata and clear external link text`; cold [home](https://keyboard-route-check.sociobot.in) check. |
| F-2-6 | Replaced the remaining README and privacy-page “companion site” language with `website`. | Browser test `review copy uses useful section labels, plain terms, and an honest local archive name`; cold [privacy](https://keyboard-route-check.sociobot.in/privacy) check in `verify-live.mjs`. |
| F-3-1 | Demo routing is determined before checkout processing. A demo URL strips and ignores `license` without any real local/session storage access. | Strengthened `@claim:demo-isolated`; cold live combined-query/reset/exit check in `node scripts/verify-live.mjs`; `evidence/polish-3-live-route-focus.png` shows the persistent demo banner. |
| F-3-2 | Checkout returns use `sessionStorage` only. Privacy copy states the exact tab lifetime, and a new claim tests return tab, separate tab, and fresh-browser boundaries. | `@claim:checkout-token-session-only`; cold [privacy](https://keyboard-route-check.sociobot.in/privacy) check in `verify-live.mjs`; `evidence/polish-3-verify-home/screenshot-desktop.png`. |
| F-3-3 | The phone-visible download action is now `Download desktop Chrome extension ZIP`. | Browser test `the complete first-read message fits the initial 390px viewport without horizontal overflow`; cold mobile `verify-live.mjs` check; `evidence/polish-3-live-home-mobile.png`. |

## Final evidence

- A separate clean clone at `/tmp/krc-clean-VDGs2q` ran `npm ci`, typecheck,
  12 unit tests, build, every one of the 16 exact claim commands, 17 site
  browser tests, 13 packed-extension browser tests, audit, and ZIP validation.
  All passed.
- The live verifier and `verify-url.sh` were rerun after deployment, not only
  against a local build. Their screenshots and reports are stored under
  `.factory/evidence/polish-3-*`.
- Lighthouse mobile against the live URL scored 99 Performance, 100
  Accessibility, 100 Best Practices, and 100 SEO. Its LCP was 1.81 s and CLS
  was 0.

No review finding is deferred.
