# Review 4 — Keyboard Route Check

**Verdict: FAIL.** The live product is clear on a phone, the sample is a real one-click isolated path, every declared claim test passed from a clean clone, and all earlier findings are fixed. One minor finding remains: two public statements that visitors can rely on are not listed as testable claims. The release cannot receive a zero-finding PASS until those statements are tested or removed.

## Scope and method

Reviewed the deployed product cold at <https://keyboard-route-check.sociobot.in> on 2026-08-29 UTC in new Chromium contexts at 390 × 844 and 1440 × 900. I read the brief, design thesis, demo documentation, claims registry, README, every earlier review/polish file, and the preceding handoff. I inspected the live application, route/storage implementation, extension tests, and deployed headers. This review does not modify product code.

A clean clone at `/tmp/krc-review4-clean` received `npm ci`. It passed `npm test` (12/12), `npm run typecheck`, `npm run lint`, each of the 16 exact claim commands in `.factory/claims.json`, `npm run test:browser` (31/31), `npm run build`, and `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip`.

The live verifier also passed against production: `node scripts/verify-live.mjs https://keyboard-route-check.sociobot.in`. It checked desktop and 390px behavior, same-origin traffic, demo reset/exit, offline sample export, route focus/Back, and no console errors. Cold screenshots are in `.factory/review-4-evidence/`.

## Cold first screen

This gate passes at both widths, before scrolling.

- **What it does:** records the order keyboard focus moves through a page and exports possible focus problems.
- **For whom:** keyboard users and web teams checking how focus moves through a page.
- **First action:** **Try it with sample data**; **See a route report right away.** states the result.

At 390px the headline, audience sentence, sample action, result, desktop-only download label, and price/privacy/offline facts all ended above y=607 in the 844px viewport. The page width was exactly 390px, with no horizontal overflow. The cassette-and-paper presentation is distinct, matches the documented cassette-zine direction, and is not a generic SaaS template.

## Findings

### F-4-1 — Minor — Two visitor-facing compatibility/connectivity claims are unlisted

**Location/quotes:** landing installation section, **“Chrome on phones cannot run this extension.”** README, **“License checks need a connection.”** The same connectivity statement is also in the landing fact **“Recording works offline; license checks need a connection.”**

**Why this fails:** these are concrete statements a visitor may use to decide whether to install or buy. `.factory/claims.json` has no claim for Chrome-phone compatibility or for the observable offline behavior of license verification. `license-check-destination` confirms the billing endpoint when a check is made; it does not prove the stated connection requirement or its failure behavior. The ordinary installation test is not tagged as a claim and only checks that instructions and a ZIP exist. The claims contract requires every public claim to have an entry and one tagged sandbox test.

**Concrete fix:** remove the untestable phone-platform assertion and retain the actionable, non-absolute instruction **“Install in desktop Chrome or Chromium.”** Add a `license-check-online` claim with a packed-extension test that starts a verification offline and asserts a clear connection error and no archive unlock; list that claim beside the existing offline-recording claim. Alternatively, remove **“license checks need a connection”** from the landing and README. Re-run the exact new claim command from a clean profile.

## Demo and sandbox

**Pass.** The first-screen sample action opened `/?demo=1` in one click. Its first screen already contained the populated five-stop Sample booking page, three route findings, the persistent **“Demo — sample data, nothing is saved to your real data”** banner, **Reset demo**, **Start for real**, and **Export sample report**.

The live combined-query boundary `/?demo=1&license=adversarial-sentinel` removed the token from the URL and created only `demo:krc:sample-report`. Reset recreated only that key. Start for real removed it, left session storage empty, and did not show a returned token. A pre-existing non-demo sentinel was unchanged. The full cold/demo request log contained only the product origin. After the initial load, sample export still completed while the context was offline. This confirms the previous demo-storage and checkout-return regressions are fixed.

## Declared claims

Every exact command in `.factory/claims.json` passed separately in the clean clone:

| Claim id | Result |
| --- | --- |
| route-data-local | pass |
| report-export | pass |
| demo-isolated | pass |
| checkout-token-session-only | pass |
| free-report-export | pass |
| offline-recording | pass |
| team-archive-local | pass |
| team-archive-unavailable | pass |
| focus-cycle-reporting | pass |
| invisible-focus-reporting | pass |
| browser-tab-order | pass |
| skipped-control-reporting | pass |
| reverse-tab-recording | pass |
| popup-label-safety | pass |
| license-transfer-handoff | pass |
| license-check-destination | pass |

There were no failing declared tests. F-4-1 is an unlisted-claim gap, not a failure of one of the listed commands.

## Copy audit

Counts are whitespace-separated words; URLs, code, and hyphenated terms count as one word. No audited sentence exceeds 22 words or uses a banned marketing adjective. The only copy flag is F-4-1.

### Landing-page sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Record the route your keyboard takes. | 6 | pass |
| For keyboard users and web teams checking how focus moves through a page. | 13 | pass |
| See a route report right away. | 6 | pass |
| Free report export; no account. | 5 | pass; `free-report-export` |
| Route data stays in this browser. | 6 | pass; `route-data-local` |
| Recording works offline; license checks need a connection. | 8 | F-4-1 |
| An illustrated cassette tape with abstract focus route markings. | 9 | pass; useful alt text |
| Press Record in the extension. | 5 | pass |
| Tab through a real page. | 5 | pass |
| Export each control’s name, type, order, and warnings. | 7 | pass; `report-export` |
| Next month may not show a visible focus mark. | 8 | pass; sample finding |
| Expected a date grid; focus moved to Choose a date. | 10 | pass; sample finding |
| Focus returned to Choose a date without moving on. | 9 | pass; sample finding |
| Chrome on phones cannot run this extension. | 7 | F-4-1 |
| Download the desktop Chrome extension ZIP. | 6 | pass; instruction |
| Extract the ZIP to a folder. | 6 | pass; instruction |
| Open `chrome://extensions` on your desktop. | 5 | pass; instruction |
| Turn on Developer mode, choose Load unpacked, and select that folder. | 11 | pass; instruction |
| Check a route before release. | 5 | pass |
| Load the page you need to check. | 6 | pass |
| Use Tab and Shift+Tab as a keyboard user would. | 9 | pass |
| Export a small JSON report for the issue or review. | 10 | pass |
| It records a route, not a certification. | 7 | pass; scope boundary |
| It cannot confirm that a page meets accessibility requirements. | 9 | pass; scope boundary |
| It does not send route data away. | 7 | pass; `route-data-local` |
| Use it beside human review. | 5 | pass |
| It saves reports only in this browser. | 7 | pass; `team-archive-local` |
| It does not sync or share them with teammates. | 9 | pass; `team-archive-local` |
| New local archive purchases are temporarily unavailable. | 7 | pass; `team-archive-unavailable` |
| Your returned checkout token stays in this tab until it closes. | 11 | pass; `checkout-token-session-only` |
| Copy it, open the extension, choose Local archive license, paste it, and verify it. | 14 | pass |
| License token copied. | 3 | pass; feedback |
| Paste it into the extension. | 5 | pass; feedback |
| Select and copy the license token, then paste it into the extension. | 12 | pass; fallback feedback |
| Sample report download started. | 4 | pass; feedback |
| Record and export manual keyboard routes. | 6 | pass |

Landing headings name their sections: **Keyboard route recorder**, **Sample keyboard route report**, **Route findings**, **Install in desktop Chrome or Chromium**, **Check a route before release**, **Boundaries**, and **Local report archive for existing licenses**. Actions name their result: **Try it with sample data**, **Download desktop Chrome extension ZIP**, **Open the sample report**, **Export sample report**, **Read the privacy details**, and **Copy license token**. There are no metaphor-only public headings or vague button labels.

### README sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Record the route your keyboard takes. | 6 | pass |
| Keyboard Route Check is for keyboard-only users and small web teams. | 11 | pass |
| Its Chrome extension records a manual Tab and Shift+Tab route through one page. | 13 | pass |
| It records each focused control’s name, type, and order, then flags likely focus problems. | 14 | pass |
| It never records form values. | 5 | pass; `route-data-local` |
| It warns when forward Tab returns to an earlier control. | 10 | pass; `focus-cycle-reporting` |
| It records the browser’s actual Tab order. | 7 | pass; `browser-tab-order` |
| Page labels appear as text in the popup. | 8 | pass; `popup-label-safety` |
| It also warns when a control lacks a visible focus mark. | 11 | pass; `invisible-focus-reporting` |
| Recording works offline after the page and extension are loaded. | 10 | pass; `offline-recording` |
| License checks need a connection. | 5 | F-4-1 |
| The website includes a one-click sample report. | 7 | pass |
| Try the isolated sample at `/?demo=1` after running the site. | 10 | pass |
| Build the project and load `.output/chrome-mv3` as an unpacked extension in Chrome or Chromium. | 14 | pass; developer instruction |
| Open an `http` or `https` page you are allowed to test. | 11 | pass; instruction |
| Open Keyboard Route Check and choose Record this tab. | 9 | pass; instruction |
| Use Tab and Shift+Tab on the page, then stop recording. | 10 | pass; instruction |
| Export the JSON route report for a review or issue. | 10 | pass; instruction |
| The recorder provides manual evidence. | 5 | pass |
| It cannot confirm that a page meets accessibility requirements or replace human review. | 13 | pass; scope boundary |
| Developer detail: the recorder respects valid positive `tabindex` values. | 9 | pass; scoped technical detail |
| `npm run build` creates: | 4 | pass; list lead-in |
| Open `http://localhost:5173/?demo=1` for the isolated sample route. | 7 | pass; instruction |
| Demo storage uses the `demo:krc:sample-report` localStorage key. | 7 | pass; `demo-isolated` |
| Reset demo recreates it; Start for real clears it. | 9 | pass; `demo-isolated` |
| The factory deploys the website from `dist/site`. | 7 | pass; deploy instruction |
| The build puts the packaged extension in its `downloads/` directory. | 10 | pass; build instruction |
| Do not deploy the extension separately. | 6 | pass; deploy instruction |
| Do not change DNS, billing, or checkout configuration from this repository. | 10 | pass; deploy instruction |
| Route reports stay in browser extension storage. | 7 | pass; `route-data-local` |
| The extension records control names, types, directions, timestamps, stable identifiers, and a safe page address. | 15 | pass; `route-data-local` |
| It never records form values or page titles. | 8 | pass; `route-data-local` |
| It removes URL credentials, query values, and fragments before export. | 10 | pass; `route-data-local` |
| It makes no analytics or route-report requests. | 7 | pass; `route-data-local` |
| The optional local report archive saves history only in this browser. | 11 | pass; `team-archive-local` |
| It does not sync or share reports with teammates. | 9 | pass; `team-archive-local` |
| New local archive purchases are temporarily unavailable. | 7 | pass; `team-archive-unavailable` |
| Existing license holders can still move a license to another browser. | 11 | pass; `license-transfer-handoff` |
| The website keeps a returned token only in the return tab until it closes. | 14 | pass; `checkout-token-session-only` |
| Open the checkout return link and copy the displayed token. | 10 | pass; instruction |
| In the extension, choose Local archive license, paste the token, and verify it. | 13 | pass; `license-transfer-handoff` |
| See the deployed `/privacy` and `/terms` pages for the current legal text. | 12 | pass |

Terminology is consistent: **route** is the ordered record, **control** is a focused item, **finding** is a possible problem, **report** is the exported file, **demo** is sample mode, **local report archive** is browser-only history, and **website** is the public site.

## Earlier finding verification

| Earlier finding | Live and code check | Status |
| --- | --- | --- |
| F-1-1 route focus/announcement | Header navigation and Back focused the destination `h1` and updated the polite live region. | fixed |
| F-1-2 decorative public copy | Prior tape/artwork slogans are absent; headings name content. | fixed |
| F-1-3 specialist terms | First-read copy uses control name/type, earlier control, and accessibility requirements. | fixed |
| F-1-4 misleading team archive | Public copy says local, one browser, no sync/share, and unavailable purchases. | fixed |
| F-1-5 metadata/external disclosure | `/404` canonical and visible external-site disclosure are present. | fixed |
| F-2-1 install path | The live ZIP contains root `manifest.json`; extraction and Load unpacked steps are present. | fixed |
| F-2-2 first-screen facts | Price, local-data, and offline facts are above the mobile fold. | fixed |
| F-2-3 audience jargon/outcome | The audience sentence is the plain proposed rewrite. | fixed |
| F-2-4 vague findings heading | Both sample views use **Route findings**. | fixed |
| F-2-5 share/export mismatch | The site, metadata, and README use **export**. | fixed |
| F-2-6 companion-site jargon | `rg -i 'companion[ -]site'` found no public occurrence; copy says website. | fixed |
| F-3-1 demo/checkout storage collision | Demo strips and ignores a license token; no real key is written. | fixed |
| F-3-2 false session retention | Checkout return is sessionStorage-only and isolated to its tab. | fixed |
| F-3-3 phone download label | The first-screen link says **Download desktop Chrome extension ZIP**. | fixed |

## Structure, privacy, and accessibility

**Pass.** `/`, `/demo`, `/privacy`, `/terms`, and `/404` each returned 200, had one `h1` and one `main`, route-specific titles/descriptions/canonicals, OG/Twitter metadata, favicon, header, footer, Privacy, and Terms. A random unknown route returned the designed page with HTTP 404. Crawling every unique site link, ZIP download, and disclosed external footer destination returned 200. `robots.txt` and `sitemap.xml` are present.

The CSP is delivered as a response header and includes `frame-ancestors 'none'`; `nosniff`, strict-origin referrer policy, and HSTS are live. Header routes, deep `/#how` navigation, Back, and route-focus announcements worked. The skip link transferred focus to `main`; no console/page errors occurred. The live verifier's axe scans reported no serious or critical issues. The 390px view had 44px controls, visible focus behavior, and reduced-motion-safe styling. The first-load JS was 13,693 bytes uncompressed, and all visuals and fonts are local.

## Missed leverage

No additional AI feature is warranted: this product's value is trustworthy manual observation, and an AI interpretation step would not improve the core evidence. JSON export already exists. Sync would contradict the documented local-only archive unless it were designed as a separate privacy-tested product surface.

## What would make this perfect

Close F-4-1 by turning license connectivity into a tagged, observable claim or removing that sentence, and by replacing the untestable phone-platform assertion with the existing desktop-install instruction. Then rerun every claim command from a clean profile. No other tested work remains.
