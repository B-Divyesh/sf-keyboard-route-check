# Review 3 — Keyboard Route Check

**Verdict: FAIL.** Three blocking findings and one minor finding remain. The
cold first screen, ordinary one-click demo path, all 15 declared claim
commands, core extension behavior, routing, accessibility, and visual identity
pass. The product still fails the zero-finding standard because demo mode can
write a checkout token into real storage, the privacy page understates how long
that token is retained, and an earlier terminology finding is only partially
fixed.

## Scope and method

Reviewed <https://keyboard-route-check.sociobot.in> cold on 2026-08-29 UTC in
fresh Chromium contexts at 390 × 844 and 1440 × 900. The repository candidate
was `fcbc238273b9e0986cffd5cd39cce31823e16e76`.

I read `.factory/brief.json`, `.factory/design.md`, `.factory/claims.json`,
`.factory/demo.md`, `README.md`, both earlier reviews, both polish reports, and
the prior handoff. I inspected the site, storage, route, extension, and test
implementations. Live checks covered the cold first view, demo storage with a
pre-existing real-data sentinel, a checkout-token/demo collision, reset, exit,
offline export, request logging, route metadata, History API focus, Back,
unknown routes, link crawling, mobile overflow, and axe.

A separate clean clone at the candidate commit received `npm ci`. Every exact
command in `.factory/claims.json` was run separately. I also ran `npm test`,
`npm run typecheck`, `npm run build`, `npm run test:browser`, and
`node scripts/verify-live.mjs` there.

## Cold first screen

Before scrolling, I could answer all three questions at both widths:

- **What does this do?** It records the order a keyboard moves through page
  controls and exports possible focus problems.
- **For whom?** Keyboard users and web teams checking how focus moves through
  a page.
- **What should I click first?** **Try it with sample data**. The adjacent text
  says **See a route report right away.**

The exact first-screen copy was **“Record the route your keyboard takes.”**,
**“For keyboard users and web teams checking how focus moves through a
page.”**, **“Try it with sample data”**, **“See a route report right away.”**,
and the three price/privacy/offline facts. All of it fit inside the initial
390 px viewport with no horizontal overflow. This gate passes.

## Findings

### F-3-1 — BLOCKING — Demo mode writes a checkout token into real storage

**Location/quote:** live `/?demo=1&license=review3-token`; banner
**“Demo — sample data, nothing is saved to your real data.”** In
`site/main.ts:12-15`, the checkout token is processed before the route is
identified and is written to `sb_license:keyboard-route-check` and
`krc:license-transfer` without excluding demo mode.

**Evidence:** a fresh live context opened that URL. While the demo banner was
visible, storage contained both `demo:krc:sample-report` and the non-demo key
`sb_license:keyboard-route-check=review3-token`; session storage also contained
`krc:license-transfer=review3-token`. **Reset demo** left both token records in
place. **Start for real** removed only the `demo:` key and displayed the saved
checkout return on the landing page. There were no external requests, so the
failure is storage isolation rather than network privacy.

**Why this fails:** demo mode promises that nothing is saved to real data and
the sandbox contract forbids any real-data write while the banner is shown.
The two supported query-driven flows can be combined, and the current global
token handler crosses the namespace boundary. The passing `demo-isolated`
test checks only a clean `/?demo=1` URL, so it does not prove the full public
claim.

**Concrete fix:** determine demo mode before handling `license`. On any demo
route, remove or ignore `license` without writing either real storage key. Add
an `@claim:demo-isolated` case that opens
`/?demo=1&license=adversarial-sentinel`, asserts that only the `demo:` key is
created, resets, exits, and confirms no token appears later on the real landing
page.

### F-3-2 — BLOCKING — The privacy page says “current session,” but the token persists in localStorage

**Location/quote:** live `/privacy`, **“A returned checkout token is saved in
companion-site browser storage for the current session so you can copy it into
the extension.”** In `site/main.ts:14-15`, the same token is stored in both
`localStorage` and `sessionStorage`.

**Evidence:** opening `/?license=review3-token` removes the token from the
address bar but leaves `sb_license:keyboard-route-check=review3-token` in
localStorage. That storage survives page and browser-session boundaries until
explicitly cleared; the site has no clearing control for it. The
`license-transfer-handoff` claim covers copying and verifying a token, but no
claims entry states or tests the advertised session-only retention.

**Why this fails:** a privacy statement is a claim visitors rely on. “For the
current session” describes session storage, not indefinite local storage. The
page therefore understates retention and the claim is unlisted in
`.factory/claims.json`.

**Concrete fix:** remove the site-side `localStorage.setItem` and retain the
checkout return only in sessionStorage until it is copied. Add a
`checkout-token-session-only` claim and test that the token is absent from
localStorage, is available in the return tab, and is gone in a fresh browser
session. If persistent storage is intentional, disclose its exact lifetime and
provide a visible **Clear checkout token** action instead.

### F-2-6 — BLOCKING — The earlier “companion site” jargon finding is only partially fixed

**Location/quotes:** README line 50, **“For the companion site locally:”**;
live `/privacy`, **“companion-site browser storage.”**

**History evidence:** review 2 found that “companion site” was internal
architecture jargon and required **website** instead. `polish-2.md` says the
README wording was replaced. The two current occurrences show that the term
was not removed consistently.

**Why this fails:** a reader has to infer whether “companion site,” “website,”
and the deployed product are different things. The privacy occurrence is worse
because it makes the storage location less precise. Under the required history
rule, a half-fixed earlier finding is blocking again under the same ID.

**Concrete fix:** change the README lead-in to **“Run the website locally:”**.
On `/privacy`, say **“The website keeps the returned checkout token in this
tab until the tab closes”** after implementing the session-only behavior in
F-3-2. Use **website** everywhere public documentation refers to this site.

### F-3-3 — Minor — The phone first screen offers a desktop-only download without saying so nearby

**Location/quote:** 390 px first screen, **“Download Chrome extension ZIP.”**
The limitation **“Chrome on phones cannot run this extension.”** appears only
in the later installation section, after the full sample-report section.

**Why this fails:** the review starts on a phone, where this visible download
cannot be installed. A visitor can select it before reaching the qualifying
text. The complete installation section fixes the earlier missing-install-path
finding, but the first-screen mobile handoff is still unnecessarily ambiguous.

**Concrete fix:** rename the first-screen link **“Download desktop Chrome
extension ZIP”** or place **“Desktop Chrome or Chromium only”** directly beside
it. Keep the full installation steps where they are.

## Demo and sandbox

The ordinary demo path passes. **Try it with sample data** opens `/?demo=1` in
one click. The first demo screen already shows the five-stop “Sample booking
page” route, an unclear focus mark, a skipped date grid, a loop, and **Export
sample report**. The persistent banner contains **Reset demo** and **Start for
real**.

With `krc:real-sentinel=keep-me` pre-seeded, entry and Reset preserved that key
and wrote only `demo:krc:sample-report`; Start for real removed the demo key and
left the sentinel untouched. The sample JSON exported while offline. The full
request log stayed on `keyboard-route-check.sociobot.in`.

The checkout-token collision in F-3-1 is the failing boundary case. It proves
that the ordinary happy-path check is not sufficient to support the banner's
absolute isolation statement.

## Claims

All 15 declared commands passed individually from the clean clone:

| Claim id | Result | Evidence exercised |
| --- | --- | --- |
| `route-data-local` | pass | Packed extension excluded values, private URL parts, titles, and report requests. |
| `report-export` | pass | Packed extension exported names, types, order, and findings. |
| `demo-isolated` | pass, coverage gap | Clean demo reset and exit passed; F-3-1 shows the untested token collision. |
| `free-report-export` | pass | Sample report downloaded without authentication. |
| `offline-recording` | pass | Loaded extension recorded while the browser was offline. |
| `team-archive-local` | pass | One local archive record was saved without sync. |
| `team-archive-unavailable` | pass | Unavailable notice was present and checkout absent. |
| `focus-cycle-reporting` | pass | Forward cycle produced a loop finding. |
| `invisible-focus-reporting` | pass | Transparent focus indicator produced a finding. |
| `browser-tab-order` | pass | Native, positive-tabindex, radio, contenteditable, disabled, and inert cases passed. |
| `skipped-control-reporting` | pass | Forced skip named the expected and actual controls. |
| `reverse-tab-recording` | pass | Shift+Tab was recorded without a false loop. |
| `popup-label-safety` | pass | Markup-like labels remained text. |
| `license-transfer-handoff` | pass | Return token could be pasted and verified in the packed extension. |
| `license-check-destination` | pass | The only external verification request used the Sociobot endpoint. |

No declared command failed. F-3-2 is an unlisted live retention claim. F-3-1
is a false edge of the declared `demo-isolated` claim that its current clean-URL
test does not exercise.

## Copy audit

Counts use whitespace-separated words; hyphenated terms, URLs, inline code,
and `Shift+Tab` count as one word. No landing or README sentence exceeds 22
words, and no banned marketing adjective appears.

### Landing-page sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Record the route your keyboard takes. | 6 | pass |
| For keyboard users and web teams checking how focus moves through a page. | 13 | pass |
| See a route report right away. | 6 | pass |
| Free report export; no account. | 5 | pass |
| Route data stays in this browser. | 6 | pass |
| Recording works offline; license checks need a connection. | 8 | pass; covered by the offline and license-request tests |
| An illustrated cassette tape with abstract focus route markings. | 9 | pass; image alternative text |
| Press Record in the extension. | 5 | pass |
| Tab through a real page. | 5 | pass |
| Export each control’s name, type, order, and warnings. | 8 | pass |
| Next month may not show a visible focus mark. | 9 | pass |
| Expected a date grid; focus moved to Choose a date. | 10 | pass |
| Focus returned to Choose a date without moving on. | 9 | pass |
| Chrome on phones cannot run this extension. | 7 | pass; placement issue is F-3-3 |
| Download the Chrome extension ZIP. | 5 | pass |
| Extract the ZIP to a folder. | 6 | pass |
| Open `chrome://extensions` on your desktop. | 5 | pass |
| Turn on Developer mode, choose Load unpacked, and select that folder. | 11 | pass |
| Check a route before release. | 5 | pass |
| Load the page you need to check. | 7 | pass |
| Use Tab and Shift+Tab as a keyboard user would. | 9 | pass |
| Export a small JSON report for the issue or review. | 10 | pass |
| It records a route, not a certification. | 7 | pass |
| It cannot confirm that a page meets accessibility requirements. | 9 | pass |
| It does not send route data away. | 7 | pass |
| Use it beside human review. | 5 | pass |
| It saves reports only in this browser. | 7 | pass |
| It does not sync or share them with teammates. | 9 | pass |
| New local archive purchases are temporarily unavailable. | 7 | pass |
| Record and export manual keyboard routes. | 6 | pass |
| Your checkout return is saved in this browser. | 8 | pass; shown only after a checkout return |
| Copy it, open the extension, choose Local archive license, paste it, and verify it. | 14 | pass; shown only after a checkout return |
| License token copied. | 3 | pass; action feedback |
| Paste it into the extension. | 5 | pass; action feedback |
| Select and copy the license token, then paste it into the extension. | 12 | pass; clipboard fallback |
| Sample report download started. | 4 | pass; live-region feedback |

### Landing headings, labels, and actions

| Copy | Words | Type/result |
| --- | ---: | --- |
| Keyboard route recorder | 3 | useful section label |
| Sample keyboard route report | 4 | useful heading |
| Sample report | 2 | useful label |
| What the extension captures | 4 | useful section label |
| Route findings | 2 | useful heading |
| Install the extension | 3 | useful section label |
| Install in desktop Chrome or Chromium | 6 | useful heading |
| Three steps | 2 | count label; the adjacent heading names the task |
| Check a route before release | 5 | useful heading |
| Open the page / Record the route / Export the report | 3 / 3 / 3 | result-naming step headings |
| Boundaries | 1 | the adjacent heading names the limitation |
| It records a route, not a certification | 7 | useful limitation heading |
| For existing licenses | 3 | useful section label |
| Local report archive for existing licenses | 6 | useful heading |
| Try it with sample data | 5 | result-naming action |
| Download Chrome extension ZIP | 4 | result-naming action; context issue is F-3-3 |
| Open the sample report | 4 | result-naming action |
| Export sample report | 3 | result-naming action |
| Read the privacy details | 4 | result-naming action |
| Move your license to the extension | 6 | useful conditional heading |
| Returned license token | 3 | useful field label |
| Copy license token | 3 | result-naming conditional action |

### README sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Record the route your keyboard takes. | 6 | pass |
| Keyboard Route Check is for keyboard-only users and small web teams. | 11 | pass |
| Its Chrome extension records a manual Tab and Shift+Tab route through one page. | 13 | pass |
| It records each focused control’s name, type, and order, then flags likely focus problems. | 14 | pass |
| It never records form values. | 5 | pass |
| It warns when forward Tab returns to an earlier control. | 10 | pass |
| It records the browser’s actual Tab order. | 7 | pass |
| Page labels appear as text in the popup. | 8 | pass |
| It also warns when a control lacks a visible focus mark. | 11 | pass |
| Recording works offline after the page and extension are loaded. | 10 | pass |
| License checks need a connection. | 5 | pass; the destination test observes a network request |
| The website includes a one-click sample report. | 7 | pass |
| Try the isolated sample at `/?demo=1` after running the site. | 10 | pass |
| Build the project and load `.output/chrome-mv3` as an unpacked extension in Chrome or Chromium. | 14 | pass; developer instruction |
| Open an `http` or `https` page you are allowed to test. | 11 | pass |
| Open Keyboard Route Check and choose Record this tab. | 9 | pass |
| Use Tab and Shift+Tab on the page, then stop recording. | 10 | pass |
| Export the JSON route report for a review or issue. | 10 | pass |
| The recorder provides manual evidence. | 5 | pass |
| It cannot confirm that a page meets accessibility requirements or replace human review. | 13 | pass |
| Developer detail: the recorder respects valid positive `tabindex` values. | 9 | pass; developer detail |
| `npm run build` creates: | 4 | pass; list lead-in |
| Open `http://localhost:5173/?demo=1` for the isolated sample route. | 7 | pass |
| Demo storage uses the `demo:krc:sample-report` localStorage key. | 7 | pass |
| Reset demo recreates it; Start for real clears it. | 9 | pass for ordinary demo entry; F-3-1 covers the real-key collision |
| The factory deploys the website from `dist/site`. | 7 | pass |
| The build puts the packaged extension in its `downloads/` directory. | 10 | pass |
| Do not deploy the extension separately. | 6 | pass |
| Do not change DNS, billing, or checkout configuration from this repository. | 11 | pass |
| Route reports stay in browser extension storage. | 7 | pass |
| The extension records control names, types, directions, timestamps, stable identifiers, and a safe page address. | 15 | pass |
| It never records form values or page titles. | 8 | pass |
| It removes URL credentials, query values, and fragments before export. | 10 | pass |
| It makes no analytics or route-report requests. | 7 | pass |
| The optional local report archive saves history only in this browser. | 11 | pass |
| It does not sync or share reports with teammates. | 9 | pass |
| New local archive purchases are temporarily unavailable. | 7 | pass |
| Existing license holders can still move a license to another browser. | 11 | pass |
| Open the checkout return link and copy the displayed token. | 10 | pass |
| In the extension, choose Local archive license, paste the token, and verify it. | 13 | pass |
| See the deployed `/privacy` and `/terms` pages for the current legal text. | 12 | pass |

README headings name their sections and the named controls are specific. The
non-sentence lead-in **“For the companion site locally:”** is F-2-6. Technical
terms such as MV3, `tabindex`, localStorage, and build paths appear only in
developer instructions.

Terminology is otherwise consistent: **route** is the ordered record,
**control/stop** is one focused item in public/report context, **finding** is a
possible problem, **report** is the exported file, **demo** is sample mode, and
**local report archive** is browser-only history.

## Earlier finding verification

| Earlier finding | Live and code verification | Status |
| --- | --- | --- |
| F-1-1 route focus and announcement | Demo navigation and Back focus the destination `h1`; the polite region announces both. `render(true)` and the regression test match live behavior. | fixed |
| F-1-2 decorative headings/copy | The quoted tape metaphors and artwork-originality sentence are absent; section labels name their content. | fixed |
| F-1-3 specialist first-read terms | The first screen and README use control name/type, earlier control, and accessibility requirements. | fixed |
| F-1-4 misleading team archive | Landing, terms, README, and popup consistently say local report archive, browser-only, no sync/share, and unavailable purchases. | fixed |
| F-1-5 canonical/external disclosure | `/404` has its canonical and the footer visibly labels the external site. | fixed |
| F-2-1 unusable extension install path | The live site names the ZIP, provides extraction and Load unpacked steps, discloses desktop Chrome/Chromium, and serves a ZIP with root `manifest.json`. | fixed; F-3-3 is the remaining phone-placement issue |
| F-2-2 first-screen price/privacy/offline facts | All three facts are above the 390 px fold and have claim coverage. | fixed |
| F-2-3 audience jargon/outcome claim | The live audience sentence is the proposed plain rewrite. | fixed |
| F-2-4 vague findings heading | Both reports use **Route findings**. | fixed |
| F-2-5 share/export mismatch | The landing page, metadata, README, and action use **export**. | fixed |
| F-2-6 companion-site architecture jargon | Two `companion site` occurrences remain in README and live privacy copy. | **half-fixed; blocking again** |

## Structure, accessibility, and visual identity

- `/`, `/demo`, `/privacy`, `/terms`, `/404`, and a random unknown route have
  the expected route-specific titles, one `h1`, one `main`, descriptions,
  canonicals, OG/Twitter titles, favicon, header, footer, Privacy, and Terms.
- The unknown URL returned HTTP 404 with the designed missing-page UI. All
  genuine links, the ZIP, and the external Param Factory destination returned
  200. `robots.txt` and `sitemap.xml` list the public routes.
- Header navigation and Back restore the route, focus the new `h1`, and update
  the polite live region. Deep `/#how` navigation works.
- No page or script errors occurred on normal routes. The expected browser
  resource diagnostic accompanied the deliberately 404 document response.
- Fresh axe checks found no serious or critical issue at 390 px. The complete
  browser suite passed focus contrast, touch targets, reduced motion, mobile
  fit, and desktop/mobile axe coverage.
- Live response headers include CSP, `frame-ancestors 'none'`, HSTS,
  `Referrer-Policy`, and `X-Content-Type-Options`. Live first-load JavaScript is
  13.58 kB uncompressed and 5.02 kB gzip in the candidate build.
- The cassette-zine artwork, paper/ink/lime palette, hard outlines, editorial
  typography, and tape treatment match `.factory/design.md` and are visually
  distinct from a generic SaaS template.

## Quality gates

- `npm test`: 12/12 passed.
- `npm run typecheck`: passed.
- `npm run build`: passed and produced `dist/site` plus the extension ZIP.
- `npm run test:browser`: 29/29 passed.
- `node scripts/verify-live.mjs`: passed five routes, mobile, demo, offline
  export, route focus, and ordinary same-origin request checks.

These green gates do not cover the storage/query collision or the false
retention wording in F-3-1 and F-3-2.

## Missed leverage

No AI feature is justified. The job is direct observation of a manual keyboard
route; generated interpretation would weaken the evidence. Export already
exists, and sync would contradict the explicitly local archive unless designed
as a separate privacy-tested feature. No additional import, export, AI, or sync
finding is warranted by the brief.

## What would make this perfect

Make token handling route-aware so demo mode cannot touch real storage; keep
checkout returns in sessionStorage only and test their lifetime; replace every
public “companion site” occurrence with “website”; and label the phone-visible
download as desktop-only. Then rerun all claim commands plus the adversarial
combined-query test. Nothing else remained in the tested scope.
