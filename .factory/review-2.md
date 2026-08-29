# Review 2 — Keyboard Route Check

**Verdict: FAIL.** Two blocking findings and five minor findings remain. The
cold first screen, sample demo, declared claim tests, routing, accessibility,
and visual identity pass. The release still fails the required zero-finding
standard because the real extension download has no usable installation path,
an earlier decorative-copy finding is only reworded, and several plain-language
and claim-list gaps remain.

## Scope and method

Reviewed the deployed site cold at
<https://keyboard-route-check.sociobot.in> on 2026-08-29 in fresh Chromium
contexts at 390 × 844 and 1440 × 900. The repository and deployment were both
at candidate `7746b43d9988db800734189f10694fc2ec8269bd`.

I read `.factory/brief.json`, `.factory/design.md`, `.factory/claims.json`,
`.factory/demo.md`, `README.md`, `.factory/review-1.md`,
`.factory/polish-1.md`, and the prior `.factory/handoff.md`. I inspected the
site, extension, route, storage, and test implementation. I also used fresh
browser contexts for the cold read, demo, request log, storage sentinel,
offline export, route focus, deep-link, metadata, 404, link, console, and axe
checks.

A separate clean clone at the same commit received `npm ci`. Every one of the
14 exact commands in `.factory/claims.json` passed individually. `npm test`
passed 12/12, `npm run test:browser` passed 27/27, and typecheck and lint passed.
Every Playwright claim run rebuilt the product and produced `dist/site`.

## Cold first screen

At both widths, before scrolling, I could answer the required questions:

- **What does it do?** It records the order in which keyboard focus moves
  through a page and reports possible focus problems.
- **For whom?** Keyboard users and web teams checking a page.
- **What should I click first?** **Try it with sample data**. The adjacent
  sentence says **See a route report right away.**

At 390 px the headline, audience sentence, primary action, expected result,
download link, and three current facts all fit above the fold. There was no
horizontal overflow. This check passes, although the wording and composition
of the three facts still have findings below.

## Findings

### F-2-1 — BLOCKING — The real extension download is not an install path

**Location/quote:** landing first screen, **“Download the extension”**; the
next instructional copy starts with **“Press Record in the extension.”**

**Evidence:** the action downloads `keyboard-route-check.zip`. The archive is
a valid unpacked MV3 extension with `manifest.json`, but the live site never
says that it requires desktop Chrome or Chromium, that the ZIP must be
extracted, or how to load the extracted folder. The only instructions are in
the repository README, which the deployed site does not link.

**Why this fails:** a first-time visitor can try the sample, but cannot complete
the real job from the product site. Clicking the apparent install action leaves
the visitor with a ZIP that Chrome does not install by opening it. This is not
an end-to-end real-use path and is especially opaque from the required phone
first read.

**Concrete fix:** change the action to **“Download Chrome extension ZIP”** and
add a live **“Install in desktop Chrome or Chromium”** section immediately
before the usage steps: download, extract, open `chrome://extensions`, enable
Developer mode, choose **Load unpacked**, and select the extracted folder.
State that the extension does not run in mobile Chrome. Add a browser test that
starts at the landing page, reaches these instructions, downloads the ZIP, and
asserts that it contains a root `manifest.json`. A store listing can replace
the developer-mode flow when one exists.

### F-1-2 — BLOCKING — The earlier decorative-copy finding was reworded, not removed

**Location/quote:** landing footer, **“Generated artwork is original to this
product.”** The implementation is `footer()` in `site/main.ts`.

**History evidence:** review 1 identified **“Original field-tape artwork.”** as
non-useful decorative copy and said to delete it unless provenance belonged on
an about page. The current footer expresses the same message with different
words. `.factory/design.md` already records the asset provenance, which is the
appropriate product record.

**Why this fails:** the sentence does not help a visitor record, inspect,
export, install, price, or understand a route. It also makes an originality
claim with no entry or test in `.factory/claims.json`. Under the history rule,
a half-fixed earlier finding is blocking again under the same id.

**Concrete fix:** remove this sentence from the visible footer. Keep the dated
generation provenance in `.factory/design.md`. If originality remains a public
claim, add a claims entry and an objective provenance check; removal is the
clearer fix.

### F-2-2 — Minor — The first-screen facts omit price and offline behavior

**Location/quote:** the three first-screen facts are **“Records each control’s
name and type”**, **“Form values stay out”**, and **“Warns when Tab returns to
an earlier control.”**

**Why this fails:** the required first-screen fact set must state privacy,
offline behavior, and price. The current list gives one privacy fact and two
feature facts. A visitor cannot tell above the fold that a single-page export
is free without an account, or what needs a connection.

**Concrete fix:** use three facts such as **“Free report export; no account”**,
**“Route data stays in this browser”**, and **“Recording works offline; license
checks need a connection.”** The first two can use the existing
`free-report-export` and `route-data-local` coverage. Add a claim and an
offline extension test before publishing the third.

### F-2-3 — Minor — The audience sentence uses jargon and an unlisted outcome claim

**Location/quote:** landing first screen, **“For keyboard users and web teams
who need proof before a focus defect reaches production.”**

**Why this fails:** “focus defect” and “production” assume web-development
vocabulary even though keyboard users are also named. “Need proof before …
reaches production” implies a prevention outcome that no claim test measures.
The tests establish recorded routes and specific warnings, not that the tool
proves or prevents a defect.

**Concrete fix:** replace it with **“For keyboard users and web teams checking
how focus moves through a page.”** This names the situation without claiming an
untested production outcome.

### F-2-4 — Minor — A findings heading does not name its section

**Location/quote:** the sample report on both `/` and `/demo` uses the `h3`
**“Check before release”** above the three reported problems.

**Why this fails:** heard in a screen-reader heading list, it does not say what
must be checked. It is an instruction or slogan, not the name of the content
beneath it.

**Concrete fix:** rename the heading **“Route findings”**. Keep “Check before
release” only as body advice if it adds necessary information.

### F-2-5 — Minor — “Share” names an action the product calls “export” elsewhere

**Location/quotes:** landing step heading **“Share the report”**; document
description **“Record a keyboard route and share the focus defects you find.”**
The actual control is **“Export report”**, and the README consistently directs
the user to export JSON.

**Why this fails:** there is no in-product share action or sync destination.
“Share” describes a later manual use of the downloaded file, while “export” is
the result the product produces. It also calls warnings “defects” even though
the product says they are likely problems and not certification.

**Concrete fix:** use **“Export the report”** for the step heading and **“Record
a keyboard route and export a report of possible focus problems.”** for the
description. Use **export** for the product action everywhere.

### F-2-6 — Minor — The README uses internal architecture jargon for the website

**Location/quotes:** README, **“The static companion site includes a one-click
sample report.”** and **“The factory deploys the static companion site from
`dist/site`.”**

**Why this fails:** “static companion site” describes implementation and the
site’s relationship to another artifact, not something a reader needs to
decode. The product calls the same thing “the site” and “website” elsewhere.

**Concrete fix:** write **“The website includes a one-click sample report.”**
and **“The factory deploys the website from `dist/site`.”**

## Demo and sandbox

**Pass.** **Try it with sample data** opens `/?demo=1` in one click. The first
demo screen already shows a five-control booking route, three specific
findings, and **Export sample report**. Its persistent banner says **“Demo —
sample data, nothing is saved to your real data”** and contains **Reset demo**
and **Start for real**.

In a fresh live context, demo mode created only
`demo:krc:sample-report`; Reset recreated it; Start for real removed it and
returned home. In a second context I pre-seeded `krc:real-sentinel=keep-me`.
Entering, resetting, and leaving the demo preserved that real key unchanged.
The complete request log contained only
`https://keyboard-route-check.sociobot.in` requests. After the first load, the
sample report still exported while the context was offline. The JSON download
was named `sample-keyboard-route-report.json`.

## Claims

Every exact command was run separately in the clean clone. All declared claims
passed:

| Claim id | Result |
| --- | --- |
| `route-data-local` | pass |
| `report-export` | pass |
| `demo-isolated` | pass |
| `free-report-export` | pass |
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

The live request and storage checks independently confirm the demo and privacy
claims. The unlisted claim-like copy is covered by F-1-2, F-2-3, and F-2-5.
There is no failing declared claim, but the review cannot pass while public
claims remain outside the registry.

## Copy audit

Counts use whitespace-separated words; inline code and `Shift+Tab` count as one
word. No sentence exceeds 22 words and no banned marketing adjective appears.
The flags are plain-language, usefulness, terminology, or claim-registry
failures rather than length failures.

### Landing page sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Record the route your keyboard takes. | 6 | pass |
| For keyboard users and web teams who need proof before a focus defect reaches production. | 15 | F-2-3 |
| See a route report right away. | 6 | pass |
| An illustrated cassette tape with abstract focus route markings. | 9 | pass; image alt text |
| Press Record in the extension. | 5 | pass |
| Tab through a real page. | 5 | pass |
| Export each control’s name, type, order, and warnings. | 8 | pass |
| Next month may not show a visible focus mark. | 9 | pass |
| Expected a date grid; focus moved to Choose a date. | 10 | pass |
| Focus returned to Choose a date without moving on. | 9 | pass |
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
| Generated artwork is original to this product. | 7 | F-1-2 |

### Landing headings, labels, and actions

| Copy | Type | Result |
| --- | --- | --- |
| Keyboard route recorder | section label | pass |
| Sample keyboard route report / Sample report | headings/label | pass |
| What the extension captures | section label | pass |
| Check before release | findings heading | F-2-4 |
| Three steps / Check a route before release | section label/heading | pass |
| Open the page / Record the route | step headings | pass |
| Share the report | step heading | F-2-5 |
| Boundaries / It records a route, not a certification | section label/heading | pass |
| For existing licenses / Local report archive for existing licenses | section label/heading | pass |
| Records each control’s name and type / Form values stay out / Warns when Tab returns to an earlier control | first-screen facts | F-2-2 for the missing price/offline facts |
| Try it with sample data | action | pass; verb names the result |
| Download the extension | action | F-2-1 for the incomplete real-use path |
| Open the sample report / Export sample report / Read the privacy details | actions | pass |
| Demo / How it works / Privacy / Terms | navigation | pass |
| Open menu / Choose a date / Next month / Book appointment | sample control names | pass |
| focus seen / focus unclear / invisible focus / skip / loop | sample statuses | pass |

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
| The static companion site includes a one-click sample report. | 9 | F-2-6 |
| Try the isolated sample at `/?demo=1` after running the site. | 10 | pass |
| Build the project and load `.output/chrome-mv3` as an unpacked extension in Chrome or Chromium. | 14 | pass; developer instruction |
| Open an `http` or `https` page you are allowed to test. | 11 | pass |
| Open Keyboard Route Check and choose **Record this tab**. | 9 | pass |
| Use Tab and Shift+Tab on the page, then stop recording. | 10 | pass |
| Export the JSON route report for a review or issue. | 10 | pass |
| The recorder provides manual evidence. | 5 | pass |
| It cannot confirm that a page meets accessibility requirements or replace human review. | 13 | pass |
| Developer detail: the recorder respects valid positive `tabindex` values. | 9 | pass; explicitly developer detail |
| `npm run build` creates: | 4 | pass; list lead-in |
| Open `http://localhost:5173/?demo=1` for the isolated sample route. | 7 | pass |
| Demo storage uses the `demo:krc:sample-report` localStorage key. | 7 | pass; developer detail |
| Reset demo recreates it; Start for real clears it. | 9 | pass |
| The factory deploys the static companion site from `dist/site`. | 9 | F-2-6 |
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
| In the extension, choose **Local archive license**, paste the token, and verify it. | 13 | pass |
| See the deployed `/privacy` and `/terms` pages for the current legal text. | 12 | pass |

README headings — **Use the extension**, **Develop, test, and build**,
**Deploy**, **Privacy and the local report archive**, and **License** — name
their sections and pass. The build-output fragments name concrete artifacts
and pass. The button names **Record this tab** and **Local archive license**
are specific in their instructional context.

Terminology is otherwise consistent: **route** is the ordered record,
**control/stop** is one focused item in its respective public/report context,
**finding** is a possible problem, **report** is the exported file, **demo** is
sample mode, and **local report archive** is browser-only history. F-2-5 is the
remaining action-term mismatch.

## Earlier finding verification

| Earlier finding | Live verification | Code verification | Status |
| --- | --- | --- | --- |
| F-1-1 route focus and announcement | Clicking Demo and using Back focused the destination `h1` and announced both headings. | `render(true)` focuses `main h1`; the live region is updated; the regression test passed. | fixed |
| F-1-2 decorative headings/copy | The metaphor headings are gone, but the artwork-originality sentence remains in the footer. | `footer()` emits the sentence; provenance already exists in `.factory/design.md`. | **half-fixed; blocking again** |
| F-1-3 specialist first-read terms | The named “roles,” “Tab loops,” “focus-route,” and “WCAG compliance” copy is absent from the live first read and README prose. | Current templates use control name/type, earlier control, and accessibility requirements. | fixed |
| F-1-4 misleading team archive | Live landing and terms say local report archive, browser-only, no sync/share, and purchases unavailable. | Templates, claims, popup, and tests use the local-only behavior. | fixed |
| F-1-5 canonical/external disclosure | `/404` has the `/404` canonical; footer says “(external site)”. | `site/404.html`, route metadata, and `footer()` contain both fixes. | fixed |

## Structure, accessibility, and visual identity

- Pass: `/`, `/demo`, `/privacy`, `/terms`, and `/404` have route-specific
  titles, one `h1`, descriptions, canonicals, OG/Twitter card metadata,
  favicon and apple-touch icon. The social card is 1200 × 630.
- Pass: a random unknown URL returns HTTP 404 with the designed page. Direct
  `/#how` scrolling works. Header navigation and Back restore route, focus the
  new `h1`, and update the polite live region.
- Pass: all crawled internal routes, the extension ZIP, favicon, touch icon,
  social image, robots, sitemap, and external Param Factory link returned 200.
- Pass: header and footer are consistent and contain Privacy and Terms. The
  server sends CSP, `frame-ancestors`, referrer policy, HSTS, and nosniff as
  headers. There were no console or page errors.
- Pass: the worker URL verifier passed `/` and `/?demo=1`. Independent axe
  scans at 390 px and 1440 px found zero serious or critical violations on all
  five routes. The full browser suite also passed focus-ring contrast, 44 px
  targets, reduced motion, mobile fit, and offline demo export.
- Pass: the cassette-zine image, paper/ink/lime palette, hard outlines,
  editorial type, and tape treatment match `.factory/design.md` and are
  visually distinct from a generic SaaS template.
- Failures in this area are the incomplete real-install path in F-2-1 and the
  first-screen fact composition in F-2-2.

## Missed leverage

No AI feature is justified. The core job is observing a manual keyboard route;
model output would make the evidence less direct. Export already exists. Sync
would contradict the clearly local archive unless introduced as a separately
explained, privacy-tested feature. The obvious missing capability is not AI or
sync but a usable installation handoff for the existing extension, covered by
F-2-1.

## What would make this perfect

Provide a complete live install path for the downloaded extension; remove the
reintroduced artwork claim; state price, privacy, and offline behavior in the
first-screen facts; simplify the audience sentence; rename the findings
heading; use **export** consistently; and replace README architecture jargon
with **website**. Register and test any claim retained by those rewrites, then
rerun this full review. No other gap was found in the tested scope.
