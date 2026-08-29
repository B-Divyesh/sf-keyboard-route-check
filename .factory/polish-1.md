# Polish 1 — review finding closure

Candidate `45f701611a6cacffbb3f2c82374ad85c92d2d409` was repaired against review
`fa905e501495d87e33f871f35ed218e7404b920c`. Repository history contains no
earlier `review-*` or `polish-*` files, so F-1-1 through F-1-5 are the complete
cumulative finding set.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Internal links now use the History API. Every rendered page has a focusable `h1`; route changes and Back focus it and update an atomic polite live region. Route titles, descriptions, and canonicals update at the same time. | Browser test **header routes and Back focus and announce each destination heading**; [live focus screenshot](evidence/live-route-focus.png); `node scripts/verify-live.mjs` passed against the [live demo](https://keyboard-route-check.sociobot.in/demo). |
| F-1-2 | Replaced every review-quoted metaphor label with a useful section label: Keyboard route recorder, Sample keyboard route report, Sample report, the plain footer sentence, and Page not found. Removed the decorative field-tape caption and also made the 404 heading literal. | Browser test **review copy uses useful section labels, plain terms, and an honest local archive name**; [live mobile screenshot](evidence/live-home-mobile.png); cold checks at the [home page](https://keyboard-route-check.sociobot.in/) and [404](https://keyboard-route-check.sociobot.in/404). |
| F-1-3 | Rewrote the first-screen facts, boundaries text, preview, legal text, README, and popup footer in plain words. Technical `tabindex` detail remains only in the README’s developer note. | Browser tests **review copy…** and **the complete first-read message fits…**; updated `.factory/copy-audit.md`; [live mobile screenshot](evidence/live-home-mobile.png); cold home-page check. |
| F-1-4 | Renamed the feature **Local report archive for existing licenses** everywhere. The landing, terms, README, popup, and claims now state that reports stay in one browser and are not synced or shared. The unavailable-purchase notice sits directly below that description. | Claim test `@claim:team-archive-local` asserts one local record and no sync/share request; `@claim:team-archive-unavailable` asserts the notice and absence of checkout; browser test **review copy…**; cold [live home](https://keyboard-route-check.sociobot.in/) and [terms](https://keyboard-route-check.sociobot.in/terms) checks. |
| F-1-5 | Added the `/404` canonical plus complete Twitter metadata and apple-touch icons on every route. The footer visibly says **Built by Param Factory (external site)**. | Browser test **every route has complete route-specific metadata and clear external link text**; [live footer screenshot](evidence/live-footer.png); live route crawl in `scripts/verify-live.mjs`; `/404` canonical and real unknown-route 404 response both passed. |

## Controller acceptance work

- The first action now opens the isolated `/?demo=1` sample in one click. It
  shows populated data, the persistent banner, Reset demo, Start for real, and
  export. `@claim:demo-isolated` asserts the separate `demo:` key, reset,
  discard, and same-origin request log.
- `.factory/claims.json` lists 12 claims. Every exact command passed separately
  from a clean clone. Privacy coverage includes form-value exclusion, safe URL
  export, same-origin demo traffic, local-only archive storage, and the sole
  Sociobot license-check destination.
- Real routes `/`, `/demo`, `/privacy`, `/terms`, `/404`, unknown-route status,
  per-route titles/metadata, focus, Back, footer legal links, mobile fit,
  reduced motion, offline demo export, and zero serious/critical axe findings
  are covered by the 23-test browser suite.
- Live evidence: `scripts/verify-live.mjs` returned five routes, demo, mobile,
  offline export, and zero console errors as passing. The worker URL verifier
  passed both `/` and `/?demo=1`.

No finding is deferred.
