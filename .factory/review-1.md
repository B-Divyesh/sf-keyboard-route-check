# Review 1 — Keyboard Route Check

**Verdict: FAIL.** The core first-read and demo checks pass, and all declared
claims test green, but five findings remain. F-1-1 is blocking because route
changes do not move focus or announce the new page. The copy and metadata
findings are also unresolved, so this is not a zero-finding release.

## Scope and method

Reviewed the deployed site cold at `https://keyboard-route-check.sociobot.in`
in new Chromium contexts at 390 × 844 and 1440 × 900 on 2026-08-29. I also
read the brief, design, claims, demo documentation, current handoff, every
`review-*` and `polish-*` file (none exist), and the relevant implementation.
The checkout was `b4b3f35ab995a2d0ad36cd38594c66a8bede4012`. A new temporary
clone received `npm ci`, then `npm test` (12/12) and `npm run test:browser`
(19/19). `npm run build` passes and produces `dist/site`.

## Cold first screen

At both widths, before scrolling, the product is understandable:

- **What it does:** records the order in which keyboard focus moves through a
  page and reports likely defects.
- **For whom:** keyboard users and web teams checking a page before release.
- **First action:** click **Try it with sample data**; the adjacent text says
  it will show a route report immediately.

The 390px first viewport contained the headline, audience sentence, primary
action, expected result, and the three privacy/function facts. There was no
horizontal overflow.

## Findings

### F-1-1 — BLOCKING — Route navigation leaves focus on the document body

**Location/evidence:** live header **Demo** link from `/` to `/demo`.
After clicking it in a fresh desktop context, `document.activeElement` was
`BODY`; the destination `<h1>` has no `tabindex`, and the only
`[aria-live]` element remains empty. Going Back likewise leaves focus on
`BODY`.

**Why this fails:** keyboard and screen-reader visitors are not placed at the
new page content or told what changed. This violates the required route-change
focus and announcement behavior, even though the URLs, reloads, and Back
button otherwise work.

**Concrete fix:** make each route render move focus to the destination `<h1>`
(`tabindex="-1"`), set the polite live region to its page name, and add a
browser test that clicks each header route and Back, then asserts focus and the
announcement. If retaining full-document navigation, perform this reliably on
each loaded page; an in-app history router is also acceptable.

### F-1-2 — Minor — Several visible headings are decorative rather than useful

**Location/quotes:** landing eyebrow **“A FIELD RECORDER FOR FOCUS”**; landing
section heading **“A route people can review.”**; preview eyebrow **“ROUTE TAPE
/ SAMPLE”**; footer **“Keyboard routes, made reviewable.”**; 404 eyebrow
**“TAPE ENDS HERE”**.

**Why this fails:** these labels need the visitor to infer the cassette
metaphor and do not name their sections or give an action. The first one is
visible before any useful information on phone.

**Concrete fix:** replace them with, respectively, **“Keyboard route
recorder”**, **“Sample keyboard route report”**, **“Sample report”**,
**“Record and export manual keyboard routes.”**, and **“Page not found”**.
Delete **“Original field-tape artwork.”** unless artwork provenance is needed
in an about page.

### F-1-3 — Minor — First-read copy uses unexplained specialist terms

**Location/quotes:** landing facts **“Labels and roles only”** and **“Warns on
repeated Tab loops”**; boundaries copy **“Keyboard Route Check does not certify
WCAG compliance.”**; README paragraph **“It records control labels, roles,
order, and likely focus-route defects.”**

**Why this fails:** “roles,” “Tab loops,” “focus-route,” and “WCAG compliance”
are not plain words for a first-time visitor. The result is understandable only
after the reader already knows accessibility implementation vocabulary.

**Concrete fix:** use **“Records each control’s name and type”**, **“Warns when
Tab returns to an earlier control”**, **“It cannot confirm that a page meets
accessibility requirements”**, and **“It records each focused control’s name,
type, and order, then flags likely focus problems.”** Keep technical terms in
an optional detail/README glossary where useful.

### F-1-4 — Minor — “Team archive” promises a collaboration outcome that does not exist

**Location/quotes:** landing **“Keep a team route archive.”** and **“Licensed
teams can save report history in this browser.”** README **“The optional team
archive saves report history in the extension browser profile.”**

**Why this fails:** “team archive” normally implies shared team access, while
the product says history is only in one browser profile. A first-time visitor
cannot tell that there is no sharing, sync, or currently available purchase.

**Concrete fix:** rename it **“Local report archive for existing licenses”**;
state **“It saves reports only in this browser. It does not sync or share them
with teammates.”** Put the unavailable-purchase notice directly under that
description. If shared history is intended, implement a genuine team sync
before calling it a team archive.

### F-1-5 — Minor — Route metadata and external-link disclosure are incomplete

**Location/evidence:** `site/404.html` has no `<link rel="canonical">`; the
footer link text is **“Built by Param Factory”** but goes to
`https://sociobot.in/` without visible external-site wording.

**Why this fails:** the required canonical pattern is incomplete for the
designed 404 route, and a visitor is not told that the footer link leaves this
site.

**Concrete fix:** add a canonical URL for `/404` (alongside its `noindex`) and
rename the footer link **“Built by Param Factory (external site)”** or add a
visually available external-link indicator with an accessible name.

## Demo and privacy sandbox

**Pass.** Clicking **Try it with sample data** was one click from the landing
page and opened `/demo`, whose first content screen already contains a realistic
five-control booking route, three findings, and **Export sample report**. The
persistent banner says **“Demo — sample data, nothing is saved to your real
data”** and exposes **Reset demo** and **Start for real**.

In both fresh contexts, demo mode used only `demo:krc:sample-report`.
Reset recreated that one key; Start for real returned to `/` and removed it.
The whole landing → demo → reset → export → real flow made same-origin requests
only. The downloaded JSON was `sample-keyboard-route-report.json` and contained
the displayed stops/findings. No real-storage access was observed.

## Claims

All 11 exact commands declared in `.factory/claims.json` were run after a
fresh `npm ci`; all passed. The clean-clone full suite independently passed its
19 browser tests, which include every claim tag.

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
| `popup-label-safety` | pass |
| `license-transfer-handoff` | pass |

The live landing and README claim-like statements have corresponding semantic
claims in `claims.json`; no unlisted claim was found. The demo privacy claim was
also confirmed from the live Playwright request log, not merely from copy.

## Copy audit

Word counts count visible prose sentences, including the report content. Labels,
headings, buttons, and list fragments that are not sentences follow afterward.
`†` marks a sentence covered by F-1-3 or F-1-4; `‡` is over 22 words.

### Landing page

| Sentence | Words | Result |
| --- | ---: | --- |
| Record the route your keyboard takes. | 6 | pass |
| For keyboard users and web teams who need proof before a focus defect reaches production. | 15 | pass |
| See a route report right away. | 6 | pass |
| Original field-tape artwork. | 3 | F-1-2 |
| Press Record in the extension. | 5 | pass |
| Tab through a real page. | 5 | pass |
| Export the labels, roles, order, and warnings. | 7 | F-1-3 |
| Load the page you need to check. | 7 | pass |
| Use Tab and Shift+Tab as a keyboard user would. | 9 | pass |
| Export a small JSON report for the issue or review. | 10 | pass |
| Keyboard Route Check does not certify WCAG compliance. | 8 | F-1-3 |
| It does not send route data away. | 8 | pass |
| Use it beside human review. | 5 | pass |
| Licensed teams can save report history in this browser. | 9 | F-1-4 |
| New team archive purchases are temporarily unavailable. | 7 | pass |
| This sample shows the labels, order, and focus warnings the extension records. | 11 | F-1-3 |
| Next month may not show a visible focus mark. | 9 | pass |
| Expected a date grid; focus moved to Choose a date. | 9 | pass |
| Focus returned to Choose a date without moving on. | 9 | pass |

Non-sentence landing text checked: **A FIELD RECORDER FOR FOCUS** (F-1-2),
**Labels and roles only** (F-1-3), **Form values stay out** (pass), **Warns on
repeated Tab loops** (F-1-3), **A route people can review** (F-1-2), **Check a
route before release** (pass), **It records a route, not a certification**
(pass), **Keep a team route archive** (F-1-4), **ROUTE TAPE / SAMPLE**
(F-1-2), **Check before release** (pass), and the action labels **Try it with
sample data**, **Download the extension**, **Open the sample report**,
**Export sample report**, **Reset demo**, and **Start for real** (result-naming
verbs; pass).

### README

| Sentence | Words | Result |
| --- | ---: | --- |
| Record the route your keyboard takes. | 6 | pass |
| Keyboard Route Check is for keyboard-only users and small web teams. | 10 | pass |
| Its Chrome extension records a manual Tab and Shift+Tab route through one page. | 13 | pass |
| It records control labels, roles, order, and likely focus-route defects. | 10 | F-1-3 |
| It never records form values. | 5 | pass |
| It warns when a repeated forward Tab route returns to an earlier control. | 13 | pass |
| It records the browser’s Tab order, including valid positive `tabindex` values. | 11 | F-1-3 |
| Page labels appear as text in the popup. | 8 | pass |
| It warns when a control lacks a visible focus indicator. | 10 | pass |
| The static site is a companion landing page and one-click sample report. | 12 | F-1-3 |
| Try the sample at `/demo` after running the site. | 9 | pass |
| Build the project and load `.output/chrome-mv3` as an unpacked extension in Chrome or Chromium. | 13 | pass |
| Open an `http` or `https` page you are allowed to test. | 11 | pass |
| Open Keyboard Route Check and choose **Record this tab**. | 8 | pass |
| Use Tab and Shift+Tab on the page, then stop recording. | 10 | pass |
| Export the JSON route report for a review or issue. | 10 | pass |
| The recorder is manual evidence, not WCAG certification or automated testing. | 11 | F-1-3 |
| Open `http://localhost:5173/demo` for the isolated sample route. | 7 | pass |
| Demo storage uses the `demo:krc:sample-report` localStorage key. | 7 | pass |
| Reset demo recreates it; Start for real clears it. | 8 | pass |
| The factory deploys the static companion site from `dist/site`. | 9 | F-1-3 |
| The packaged extension is copied into its `downloads/` directory during the build. | 12 | pass |
| Do not deploy the extension separately or change DNS, billing, or checkout configuration from this repository. | 15 | pass |
| Route reports stay in browser extension storage. | 7 | pass |
| The extension records labels, roles, directions, timestamps, stable control identifiers, and a page origin and path. | 16 | F-1-3 |
| It never records form values or page titles. | 8 | pass |
| It removes URL credentials, query values, and fragments before export. | 10 | F-1-3 |
| It makes no analytics or route-report requests. | 7 | pass |
| The optional team archive saves report history in the extension browser profile. | 12 | F-1-4 |
| New archive purchases are temporarily unavailable. | 6 | pass |
| If an existing purchase returns to the companion site, copy its displayed token into **Team archive license** in the extension and verify it there. | 24 | F-1-3, F-1-4, ‡ |
| See the deployed `/privacy` and `/terms` pages for the current legal text. | 11 | pass |

README headings and code labels were also checked. **Privacy and the optional
team archive** inherits F-1-4; the remaining headings name their sections.

## Structure, accessibility, and visual checks

- Pass: title pattern on `/`, `/demo`, `/privacy`, `/terms`, and 404; one `h1`;
  `lang`; `main`; description; OG image; favicon; designed 404; robots and
  sitemap; 200 responses for all internal links/downloads and the external
  footer link; consistent header/footer; skip link; visible focus; no 390px
  overflow; 44px visible targets; reduced-motion CSS.
- Pass: fresh axe scans found no violations at serious or critical severity on
  `/`, `/demo`, `/privacy`, `/terms`, and the 404 at both target widths.
- Pass: the cassette-zine art, ink/paper palette, type choices, and hard-edged
  tape treatment are distinct and match `.factory/design.md`; this is not a
  generic SaaS template.
- Pass: live first-load JavaScript is 11,017 bytes uncompressed (4,240 bytes
  gzip) and all first-party resource requests stayed on the product origin.
- Failures in this category are F-1-1 and F-1-5.

## Missed leverage

No additional AI, import/export, or sync feature is required by the brief. The
product already provides the obvious export. Adding AI would be decorative for
a manual keyboard-route recorder. The one useful distinction to make is that
the paid/local archive is not a sync feature (F-1-4).

## What would make this perfect

Ship route-change focus/announcements with a regression test; remove the
cassette-only labels and specialist jargon; describe the archive honestly as
local-only or implement sharing; and finish the 404 canonical/external-link
metadata details. Re-run this complete cold review after those changes.
