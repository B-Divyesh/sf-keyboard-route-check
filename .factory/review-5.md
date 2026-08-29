# Review 5 — Keyboard Route Check

**Verdict: PASS.** The cold first screen is clear at 390 px and desktop, the
sample is a real one-click isolated demo, all 17 declared claims pass from a
clean clone, every earlier finding is fixed in both the live product and code,
and the complete copy, structure, privacy, accessibility, and link checks leave
zero findings of any severity. No claim remains untested or unlisted.

## Scope and method

Reviewed <https://keyboard-route-check.sociobot.in> cold on 2026-08-29 UTC in
new Chromium contexts at 390 × 844 and 1440 × 900. Both contexts started with
empty browser storage and no page scroll. I read the brief, design thesis,
claims registry, demo documentation, README, all four earlier reviews, all four
polish reports, and the preceding handoff. I then checked the live product and
the corresponding route, storage, extension, and test implementations.

A separate clean clone at `/tmp/krc-review5.1bhD6s` received `npm ci`. Every
exact command in `.factory/claims.json` was run separately. The clone also ran
the unit, type, lint, build, browser, archive, and dependency checks listed
below. The live JavaScript, CSS, and downloadable extension ZIP match that
clean build byte-for-byte.

## Cold first screen

This gate passes at both widths before scrolling.

- **What it does:** records the route keyboard focus takes through a page and
  exports possible focus problems.
- **For whom:** keyboard users and web teams checking how focus moves through
  a page.
- **What to click first:** **Try it with sample data**. The adjacent result is
  **See a route report right away.**

The exact first-read text is **“Record the route your keyboard takes.”**,
**“For keyboard users and web teams checking how focus moves through a
page.”**, **“Try it with sample data”**, and **“See a route report right
away.”** The three facts state free use, local data, and offline/connection
behavior. At 390 px, all of that text plus the desktop-qualified download link
ends by y=607 in the 844 px viewport. The document width is exactly 390 px.

## Findings

None.

## Demo and sandbox

**Pass.** The first-screen sample action opens `/?demo=1` in one click. Without
another action, the result shows the populated **Sample booking page**, five
realistic focus stops, three route findings, and **Export sample report**. The
persistent banner says **“Demo — sample data, nothing is saved to your real
data”** and contains **Reset demo** and **Start for real**.

The hostile storage check pre-seeded `krc:real-sentinel=keep-me`. Demo entry and
Reset preserved that value and used only `demo:krc:sample-report`; Start for
real removed only the demo key. A separate
`/?demo=1&license=adversarial-sentinel` context removed the token from the URL,
wrote no local or session token, and retained only the demo key. The sample
report still exported after the browser context went offline. The complete
cold landing/demo flow requested only the product origin and logged no console
or page errors.

## Declared claims

All 17 exact claim commands passed independently from the clean clone.

| Claim id | Result |
| --- | --- |
| `route-data-local` | pass |
| `report-export` | pass |
| `demo-isolated` | pass |
| `checkout-token-session-only` | pass |
| `free-report-export` | pass |
| `offline-recording` | pass |
| `license-check-online` | pass |
| `team-archive-local` | pass |
| `team-archive-unavailable` | pass |
| `focus-cycle-reporting` | pass |
| `invisible-focus-reporting` | pass |
| `browser-tab-order` | pass |
| `skipped-control-reporting` | pass |
| `reverse-tab-recording` | pass |
| `popup-label-safety` | pass |
| `license-transfer-handoff` | pass |
| `license-check-destination` | pass |

The live landing page and README were cross-checked sentence by sentence
against the registry. Every claim-like sentence maps to a declared test; there
is no unlisted claim.

## Copy audit

Counts are whitespace-separated words; URLs, inline code, and hyphenated terms
count as one word. The landing-page average is 7.5 words and the README average
is 9.4 words. No sentence exceeds 22 words, uses a banned marketing adjective,
or needs a rewrite.

### Landing-page sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Record the route your keyboard takes. | 6 | pass |
| For keyboard users and web teams checking how focus moves through a page. | 13 | pass |
| See a route report right away. | 6 | pass |
| Free report export; no account. | 5 | pass |
| Route data stays in this browser. | 6 | pass |
| Recording works offline; license checks need a connection. | 8 | pass |
| An illustrated cassette tape with abstract focus route markings. | 9 | pass; useful alt text |
| Press Record in the extension. | 5 | pass |
| Tab through a real page. | 5 | pass |
| Export each control’s name, type, order, and warnings. | 8 | pass |
| Next month may not show a visible focus mark. | 9 | pass |
| Expected a date grid; focus moved to Choose a date. | 10 | pass |
| Focus returned to Choose a date without moving on. | 9 | pass |
| Download the desktop Chrome extension ZIP. | 6 | pass |
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
| Your returned checkout token stays in this tab until it closes. | 11 | pass; conditional return copy |
| Copy it, open the extension, choose Local archive license, paste it, and verify it. | 14 | pass; conditional return copy |
| License token copied. | 3 | pass; action feedback |
| Paste it into the extension. | 5 | pass; action feedback |
| Select and copy the license token, then paste it into the extension. | 12 | pass; fallback feedback |
| Sample report download started. | 4 | pass; action feedback |
| Record and export manual keyboard routes. | 6 | pass |

The headings name their content: **Keyboard route recorder**, **Sample keyboard
route report**, **Sample booking page**, **Route findings**, **Install in
desktop Chrome or Chromium**, **Check a route before release**, **Open the
page**, **Record the route**, **Export the report**, **It records a route, not
a certification**, and **Local report archive for existing licenses**. The
uppercase eyebrow labels describe the adjacent named section rather than
substitute for its heading.

The actions name a result or destination: **Try it with sample data**,
**Download desktop Chrome extension ZIP**, **Open the sample report**, **Export
sample report**, **Read the privacy details**, and conditional **Copy license
token**. Demo-only **Reset demo** and **Start for real** are explicit state
changes. There is no metaphor, mood heading, slogan, vague “continue” action,
or inconsistent action term.

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
| License checks need a connection. | 5 | pass |
| The website includes a one-click sample report. | 7 | pass |
| Try the isolated sample at `/?demo=1` after running the site. | 10 | pass |
| Build the project and load `.output/chrome-mv3` as an unpacked extension in Chrome or Chromium. | 14 | pass |
| Open an `http` or `https` page you are allowed to test. | 11 | pass |
| Open Keyboard Route Check and choose Record this tab. | 9 | pass |
| Use Tab and Shift+Tab on the page, then stop recording. | 10 | pass |
| Export the JSON route report for a review or issue. | 10 | pass |
| The recorder provides manual evidence. | 5 | pass |
| It cannot confirm that a page meets accessibility requirements or replace human review. | 13 | pass |
| Developer detail: the recorder respects valid positive `tabindex` values. | 9 | pass |
| `npm run build` creates: | 4 | pass; list lead-in |
| Open `http://localhost:5173/?demo=1` for the isolated sample route. | 7 | pass |
| Demo storage uses the `demo:krc:sample-report` localStorage key. | 7 | pass |
| Reset demo recreates it; Start for real clears it. | 9 | pass |
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
| The website keeps a returned token only in the return tab until it closes. | 14 | pass |
| Open the checkout return link and copy the displayed token. | 10 | pass |
| In the extension, choose Local archive license, paste the token, and verify it. | 13 | pass |
| See the deployed `/privacy` and `/terms` pages for the current legal text. | 12 | pass |

README headings — **Use the extension**, **Develop, test, and build**,
**Deploy**, **Privacy and the local report archive**, and **License** — name
their sections. The referenced control names **Record this tab** and **Local
archive license** are specific in context.

Terminology is consistent: **route** is the ordered record, **control** is a
focused item, **finding** is a possible problem, **report** is the exported
file, **demo** is sample mode, **local report archive** is browser-only
history, **website** is the public site, and **license token** is the value
copied into the extension.

## Earlier finding verification

| Earlier finding | Live and code confirmation | Status |
| --- | --- | --- |
| F-1-1 route focus/announcement | Demo navigation and Back focused the destination `h1`; the polite region announced both. `render(true)` implements the same behavior and the regression test passed. | fixed |
| F-1-2 decorative public copy | The quoted tape/artwork slogans and originality sentence are absent. Current headings name content; provenance remains in `.factory/design.md`. | fixed |
| F-1-3 specialist terms | First-read and README copy use control name/type, earlier control, and accessibility requirements. The old public jargon is absent. | fixed |
| F-1-4 misleading team archive | Live landing, terms, README, extension copy, and tests call it a local report archive, state one-browser storage, and deny sync/share. | fixed |
| F-1-5 metadata/external disclosure | The designed `/404` has its canonical; every footer visibly marks the Param Factory destination as external. | fixed |
| F-2-1 incomplete installation | The live page names desktop Chrome/Chromium, ZIP extraction, `chrome://extensions`, Developer mode, and Load unpacked. The downloaded ZIP has root `manifest.json`. | fixed |
| F-2-2 missing first-screen facts | Free export, local route data, and offline/license behavior are all above the 390 px fold and have claim coverage. | fixed |
| F-2-3 audience jargon/outcome | The live audience sentence is the proposed direct checking sentence and contains no prevention promise. | fixed |
| F-2-4 vague findings heading | Both live sample reports use **Route findings**. | fixed |
| F-2-5 share/export mismatch | Live copy, metadata, README, and controls consistently use **export**. | fixed |
| F-2-6 companion-site jargon | Scoped source and README search finds no public occurrence; live legal copy says **website**. | fixed |
| F-3-1 demo/token collision | The combined demo/license URL writes only the demo key. Code determines `enteredDemo` before token handling, and the strengthened claim test passes. | fixed |
| F-3-2 false session retention | A checkout return uses only tab-scoped `sessionStorage`; another tab and a fresh context cannot read it. The privacy sentence states that lifetime. | fixed |
| F-3-3 phone download ambiguity | The phone-visible action says **Download desktop Chrome extension ZIP** and fits in the first viewport. | fixed |
| F-4-1 unlisted compatibility/connectivity claims | The unsupported-phone assertion is absent. `license-check-online` now tests the retained connection sentence, recovery error, and locked archive. | fixed |

## Structure, accessibility, privacy, and visual identity

**Pass.** `/`, `/demo`, `/privacy`, `/terms`, and `/404` return 200 with one
`h1`, one `main`, `lang=en`, ordered headings, route-specific title,
description, canonical, OG/Twitter metadata, social image, favicon, and
apple-touch icon. Titles are at most 46 characters and follow the required
product/task or route/product pattern. A random unknown route returns the
designed missing-page UI with HTTP 404 and a route home.

Header navigation and Back update the URL, restore the route, focus the new
`h1`, and announce it. The skip link focuses `main`. Every genuine internal
link, download, metadata asset, robots file, sitemap, and disclosed external
footer destination returned 200. Privacy and Terms appear in the consistent
footer on every route.

Fresh live axe scans reported no serious or critical issue. The 390 px pages
have no horizontal overflow, visible controls meet the 44 px baseline, focus
rings are designed and visible, reduced motion removes transitions, and normal
routes log no console or page errors. All images have alternatives, fonts and
scripts are self-hosted, and the cold demo request log is same-origin.

The live response sends HSTS, `nosniff`, strict-origin referrer policy, and a
CSP with `frame-ancestors 'none'` in the header. Initial JavaScript is 13,643
bytes uncompressed (about 5 KB gzip), below the product budget. The cassette
art, recycled-paper field-tape palette, editorial/monospace type pairing, hard
ink outlines, and physical report treatment match `.factory/design.md` and are
visually distinct from a generic SaaS template.

## Quality gates and deployment match

- `npm test`: 12/12 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed; produced `dist/site`, unpacked MV3 output, and ZIP.
- `npm run test:browser`: 32/32 passed.
- Every one of the 17 exact claim commands: passed independently.
- `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip`: passed.
- `npm audit --omit=dev --audit-level=high`: zero vulnerabilities.
- `node scripts/verify-live.mjs https://keyboard-route-check.sociobot.in`:
  passed five routes, mobile, demo, offline export, and console checks.

Deployment equality also passed: live and clean-build JavaScript share SHA-256
`49c481fc0c3888e42c63fa74e0b112693c82277d7328a6f75148738ec43c7ccc`;
the extension ZIP shares
`31256c248ed67f1b626df6bfa9d5070e698dbcab227b73af376da5c718f84832`.

## Missed leverage

No missing AI, import/export, sync, or other obvious feature is implied by the
brief. The core job is direct manual observation; generated interpretation
would weaken that evidence. JSON export already covers the obvious handoff.
Sync would contradict the deliberately local archive unless introduced as a
separate, newly claimed and privacy-tested feature.

## What would make this perfect

Nothing remains in the reviewed scope. The product meets the owner's
zero-finding standard without a copy, demo, claim, route, accessibility,
privacy, or feature change.
