# Independent product verification 7 — FAIL

**Candidate:** `8ed6fa68c86a60f5ae7882556bf6df73302c2909`  
**Live URL:** https://keyboard-route-check.sociobot.in  
**Verified:** 2026-08-29 UTC

## Release decision

**FAIL — do not release this candidate.** The deployed site and downloadable
MV3 extension match the candidate, every declared claim test passes after the
required clean install, and the first-read/demo gate passes. Independent
manual cases nevertheless found two high-severity accessibility and core
accuracy defects:

1. A standards-valid implicitly labelled input is exported as **Unnamed
   input**. A visible parent `:focus-within` ring is also reported as invisible.
2. The site's **Export sample report** focus ring has only **2.51:1** contrast
   against its dark header, below the required 3:1.

These defects make a keyboard-review product produce incorrect evidence and
give one of its own keyboard controls an insufficient focus indicator.

## Required cold first read

**PASS.** In a fresh 1440×900 context with empty storage, the first screen says
“Record the route your keyboard takes.” It names keyboard users and web teams,
shows **Try it with sample data**, and explains “See a route report right
away.” The same content and action fit in the first 390×844 viewport.

One click opened `/?demo=1` and immediately showed a five-stop booking route,
three findings, **Reset demo**, **Start for real**, and **Export sample
report**. The export contained labels, roles, order, directions, focus state,
and the sample findings. Demo storage contained only
`demo:krc:sample-report`; Reset recreated it and Start for real removed it.

## Claim gate

`.factory/claims.json` exists. The very first pre-install invocation could not
load `@playwright/test` because a clean clone had no `node_modules`; no test
body ran. After the required `npm ci`, every declared command was run
separately and exactly as written. All 12 selected one test and passed:

| Claim | Result |
| --- | --- |
| `route-data-local` | PASS — 1 test |
| `report-export` | PASS — 1 test |
| `demo-isolated` | PASS — 1 test |
| `free-report-export` | PASS — 1 test |
| `team-archive-local` | PASS — 1 test |
| `team-archive-unavailable` | PASS — 1 test |
| `focus-cycle-reporting` | PASS — 1 test |
| `invisible-focus-reporting` | PASS — 1 test |
| `browser-tab-order` | PASS — 1 test |
| `popup-label-safety` | PASS — 1 test |
| `license-transfer-handoff` | PASS — 1 test |
| `license-check-destination` | PASS — 1 test |

The landing page, legal pages, popup, and README claims map to these entries.
No additional material visitor claim was found outside the registry. The
manual implicit-label case below shows that the current claim coverage is too
narrow to prove the general “control names” promise.

## Clean-checkout gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 176 packages, 0 vulnerabilities |
| `npm test` | PASS — 12/12 |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS; currently the same TypeScript check |
| `npm run build` | PASS |
| `unzip -t .output/keyboard-route-check-1.0.0-chrome.zip` | PASS |
| `npm run test:browser` | PASS — 23/23 |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |
| `node scripts/verify-live.mjs` | PASS |
| `/opt/fleet/lib/verify-url.sh <url> <temp-dir>` | PASS |

The build produced `.output/chrome-mv3`, the extension ZIP, and `dist/site`.
The browser suite exercises the packed extension, real focus recording,
forward/reverse order, loops, positive `tabindex`, redaction, exports, license
recovery, demo storage, keyboard navigation, mobile layout, and axe checks.

## End-to-end and boundary evidence

### Passing behavior

- A fresh packed extension recorded a normal route, stopped, exported it, and
  cleared back to the useful zero-stop state.
- Empty license submission announced “Paste your license token first.” A real
  invalid token recovered with “This license is not active. Check the token
  and try again.” The only external request was the documented Sociobot
  verification URL.
- A form value named `do-not-record-secret` did not appear in stored or
  exported data. Claim tests also confirmed removal of URL credentials, query
  values, fragments, and page titles.
- The popup had one `h1`, one `main`, and zero axe violations in its empty,
  recording, and license-error states.
- The sample export worked after the demo context was put offline. This is not
  a PWA and makes no offline-reload claim.

### Failing representative case

In a fresh packed-extension profile, record this valid accessible pattern:

```html
<label class="field">Work email
  <input type="email" value="do-not-record-secret">
</label>
```

The focused label had a visible `4px solid rgb(0, 95, 204)`
`:focus-within` outline. The report instead contained:

```json
{
  "label": "Unnamed input",
  "role": "input",
  "focusMark": false
}
```

It added `Unnamed input may not show a visible focus mark.` The value remained
redacted. Implicit `<label>` association and parent focus treatment are both
common, valid web patterns, so this is a real false report rather than an
unsupported invalid-input edge.

## Accessibility and responsive evidence

- Axe 4.11 found zero violations, including zero serious/critical findings,
  on `/`, `/demo`, `/privacy`, `/terms`, and `/404` at 1440px and 390px.
- Each route had `lang=en`, one `h1`, one `main`, header/footer landmarks, a
  skip link, route-specific title, and no horizontal overflow at 390px.
- Every rendered interactive target on those routes measured at least 44×44
  CSS px at 390px.
- Keyboard traversal reached all 13 landing controls in DOM order and wrapped
  without a trap. Twelve controls had a 3px ring with 5.37:1 contrast.
- **Failure:** the focused sample-export button computes
  `outline: rgb(180, 42, 53) solid 3px`, `outline-offset: 4px`, against parent
  background `rgb(32, 35, 31)`. WCAG contrast calculation is **2.51:1**, below
  the supplied 3:1 focus-ring baseline. Axe does not test this state.
- With `prefers-reduced-motion: reduce`, no element had a non-zero transition
  or animation. A 640px layout check (1280px at a 200% layout equivalent) kept
  content and controls usable; zoom is not disabled.
- There were no console errors or page errors on normal routes and flows.

## Live deployment, privacy, headers, and performance

- Fresh local output and live `/`, route HTML files, JavaScript, CSS, hero,
  social card, favicon, robots, and sitemap had identical bytes and SHA-256.
  The live extension ZIP also had the same SHA-256 as the fresh build, and its
  unpacked contents were identical. The deployment is this candidate.
- Landing/demo request logs used only
  `https://keyboard-route-check.sociobot.in`. No analytics, third-party font,
  third-party script, or report request occurred.
- Every public anchor resolved successfully. A random unknown path returned
  the styled 404 document with HTTP 404.
- HTML uses 30-second revalidation. Hashed JS/CSS use
  `public, max-age=31536000, immutable`.
- Responses include HSTS, `nosniff`, strict-origin referrer policy, and a
  response-header CSP with `frame-ancestors 'none'`; no CSP console error was
  observed.
- Built initial JS is 13,161 bytes (4,904 gzip), CSS is 9,304 bytes (2,706
  gzip), and the hero WebP is 199,746 bytes. All stated bundle budgets pass.
- Fresh Lighthouse 12.8.2 mobile: Performance **99**, Accessibility **100**,
  Best Practices **100**, SEO **100**; FCP 0.8 s, LCP 1.8 s, TBT 100 ms, CLS
  0, total transfer 204 KiB.

## Server-side allowance

The only product-used server endpoint is the Sociobot license verifier. In a
fresh 40-request invalid-token batch from one client, requests 1–30 returned
200 and request 31 returned **429**. The first 429 included
`Retry-After: 4` and `x-ratelimit-after: 4`. After five seconds, the next
request returned 200. Observed allowance: **30 requests per client burst**.

There is no sign-in, product backend, PWA service worker, library consumer
package, or CLI, so the corresponding checks do not apply.

## Defects by severity

### High — release blocking

1. **The recorder loses valid implicit labels and reports visible wrapper
   focus as invisible.** This produces the wrong control name and a false
   defect in the core shareable artifact. Support `label` elements that wrap a
   control and evaluate visible focus treatments on relevant ancestors.

2. **The sample export control's keyboard focus ring is only 2.51:1 against
   the dark report header.** Use a focus color with at least 3:1 contrast on
   that surface and assert the rendered contrast, not only ring width.

### Medium

1. **Claim and browser coverage misses both failures.** Add a packed-extension
   case for an implicit label plus a parent `:focus-within` indicator, and add
   a site test that measures focus-ring contrast on every surface.

### Critical / Low

None found.

## Required repair and rerun

Fix both high-severity defects, add the two regression cases, then rerun every
claim command, all local gates, packed-extension tests, live artifact matching,
axe, keyboard contrast, privacy request logging, and Lighthouse. Do not change
the honest “new purchases unavailable” state unless the Sociobot product is
actually enabled end to end.
