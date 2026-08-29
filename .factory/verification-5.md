# Independent product verification 5 — FAIL

**Candidate:** `54b1d01801edab0a262c142249f83d8ca1b60fa8`  
**Live URL:** https://keyboard-route-check.sociobot.in  
**Verified:** 2026-08-29 UTC

## Release decision

**FAIL — do not release this candidate.** The candidate builds, the deployed
site and extension match it, all ten declared claim commands pass, and the
free recorder/demo work end to end. Independent testing still found two
release blockers: keyboard focus in the extension popup does not meet the
required 3:1 visibility contrast, and a public product-availability claim is
absent from the mandatory claims registry. A separate core-report accuracy
defect marks a clearly visible background-color focus change as invisible.

## Required first read

**PASS.** A cold 1440×900 visit says it records “the route your keyboard
takes,” names keyboard users and web teams, and presents **Try it with sample
data** beside “See a route report right away.” The action is above the fold.
One click opens `/demo`, where a realistic five-stop route and its findings
are already visible with the persistent **Demo — sample data, nothing is saved
to your real data**, **Reset demo**, and **Start for real** controls.

## Claims gate

`.factory/claims.json` exists. After `npm ci`, every listed command was run
separately and exactly as written. Each selected one test and exited 0:

| Claim | Result |
| --- | --- |
| `route-data-local` | PASS — 1 passed |
| `report-export` | PASS — 1 passed |
| `demo-isolated` | PASS — 1 passed |
| `free-report-export` | PASS — 1 passed |
| `team-archive-local` | PASS — 1 passed |
| `focus-cycle-reporting` | PASS — 1 passed |
| `invisible-focus-reporting` | PASS — 1 passed |
| `browser-tab-order` | PASS — 1 passed |
| `popup-label-safety` | PASS — 1 passed |
| `license-transfer-handoff` | PASS — 1 passed |

The green commands do not override the claims-registry defect below.

## Clean local gates

| Gate | Result |
| --- | --- |
| `npm ci` | PASS — 401 packages installed from the lockfile |
| `npm test` | PASS — 11/11 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS; this script repeats `tsc --noEmit` |
| `npm run test:browser` | PASS — 17/17 tests |
| `npm run build` | PASS — MV3 directory, zip, and `dist/site` produced |
| extension zip integrity | PASS — `unzip -t` found no errors |
| production dependency audit | PASS — 0 vulnerabilities |

The full development tree reports 10 advisories (1 low, 2 moderate, 4 high,
3 critical) in build/test tooling.

## End-to-end behavior and recovery

- In a fresh packed-MV3 profile, a real route recorded `License token → Verify
  license → Privacy → Terms → Privacy`; the last stop was correctly marked
  `reverse`. Stop paused recording, the JSON download matched stored data, and
  Clear removed the session.
- The report retained labels, roles, directions, order, safe stable IDs, and
  findings. It omitted the input value, page title, URL query, and fragment.
  Recording/export made no external request.
- Packed-extension boundary checks passed for a two-control Tab cycle, valid
  positive `tabindex`, transparent focus, rapid storage updates, and hostile
  markup in a label.
- Empty and invalid license input produced announced recovery instructions.
  A prior valid verdict remained usable offline. A checkout-return token could
  be copied into the extension and verified through the documented endpoint.
- The live demo exported five ordered stops and the expected
  `invisible-focus`, `skip`, and `loop` findings. It contained no form value.
  Demo entry/reset touched only `demo:krc:sample-report` alongside a seeded
  real marker; Start for real removed only the demo key. The full flow made
  same-origin requests only.
- The live invalid-license API returned `{valid:false, reason:"invalid"}` and
  allowed the extension origin through CORS. A single-client 45-request burst
  returned 30×200 followed by 15×429. Throttling began at request 31 and every
  sampled 429 included `Retry-After: 4`.

## Live deployment, accessibility, and performance

- Fresh build output exactly matched live `index`, demo, privacy, terms, 404,
  JS, CSS, hero, social card, robots, and sitemap bytes. Fresh and live zip
  container hashes differed because of regenerated archive metadata, but all
  unzipped extension files matched.
- `/`, `/demo`, `/privacy`, `/terms`, the metadata files, and extension download
  returned 200. An unknown URL returned the styled page with HTTP 404. Every
  public link resolved successfully.
- The factory URL verifier completed in 636 ms with one h1, `lang=en`, one main
  landmark, complete image alternatives, and no console/page errors.
- Fresh axe runs on all four public routes at 1440px and 390px found zero
  violations. Both sizes had no horizontal overflow or undersized visible
  controls. Keyboard traversal reached all landing controls without a trap;
  the site uses a 3px signal-red focus ring. Reduced-motion `/demo` had no
  non-zero animation or transition.
- Mobile Lighthouse scored **100 performance, 100 accessibility, 100 best
  practices, and 100 SEO**. FCP was 0.8 s, LCP 1.8 s, TBT 0 ms, and CLS 0.
- Built site assets are 11,017-byte JS (4.24 KB gzip), 8,903-byte CSS (2.59 KB
  gzip), no web fonts, and a 199,746-byte hero. All supplied budgets pass.
- Browser-observed headers include the deployed self/Sociobot CSP, HSTS,
  `Referrer-Policy: strict-origin-when-cross-origin`, and `nosniff`. HTML uses
  30-second revalidation; hashed JS/CSS use one-year immutable caching.

## Defects by severity

### High — release blocking

1. **The extension popup's focus indicator fails the required contrast.**
   After recording a route, keyboard focus on **Team archive license** and
   **Clear route** computes to a 3px `#fff9ea` outline on the `#f4ecd8` popup
   paper. That contrast is **1.12:1**, below the contract's 3:1 focus-indicator
   minimum. The same rule affects paper-backed popup inputs/actions; their
   black borders and shadows do not change on focus. The site’s red ring passes
   at 5.37:1, but the actual extension does not. Use a contrasting popup focus
   token on paper and add a packed-extension focus-contrast regression.

2. **The claims registry is incomplete.** The landing page, README, and terms
   say **“New team archive purchases are temporarily unavailable.”** This is a
   product-availability statement a visitor can rely on, but
   `.factory/claims.json` has no corresponding entry and no
   `@claim:team-archive-unavailable` test. An untagged browser test confirms
   that the buy link is absent, but the supplied claims contract requires every
   public claim to be listed with its exact tagged sandbox test. Add the claim
   and observable test, or remove the public statement.

### Medium

3. **A valid background-color focus indicator is reported as invisible.** On
   a real packed-extension page, a button changed from white/black to
   black/white on focus, with a persistent 4px border and no outline/shadow.
   The change was clearly visible, but the export stored `focusMark:false` and
   added `invisible-focus`. The detector only evaluates outlines and box
   shadows; it never compares background, foreground, or border changes. This
   can put false defect evidence in reports for a common focus design. Cover a
   valid non-outline indicator in the claim sandbox and compare focused and
   unfocused styles.

### Low

4. **Development dependencies have known advisories.** The shipped production
   dependency audit is clean, but `npm ci` reports 10 advisories in the
   build/test tree.

## Scope notes

This is a browser extension with a static companion site. It has no product
backend, sign-in, PWA/offline service-worker contract, or library/CLI consumer
API. No product code was changed during verification.
