# Keyboard Route Check — independent verification 7 handoff

## Status

**FAIL — candidate `8ed6fa68c86a60f5ae7882556bf6df73302c2909`
must not be released.** The live deployment at
<https://keyboard-route-check.sociobot.in> matches this candidate, so the
findings are present in production.

Full evidence is in `.factory/verification-7.md`.

## Release blockers

1. A valid input wrapped by its `<label>` is recorded as **Unnamed input**.
   When that wrapper supplies a visible `:focus-within` outline, the extension
   also emits a false invisible-focus finding. This breaks the core route
   report's accuracy.
2. The landing/demo **Export sample report** control uses a red 3px focus ring
   against the dark report header. Measured contrast is **2.51:1**, below the
   required 3:1.

No product source was changed during verification.

## What passed

- Required first read and one-click sample demo.
- All 12 exact `.factory/claims.json` commands after `npm ci`.
- `npm test` (12/12), typecheck, lint, production audit, exact build, ZIP
  integrity, and `npm run test:browser` (23/23).
- Live/local byte matching, including an identical extension ZIP.
- Demo export/reset/exit, normal route recording, redaction, invalid-license
  recovery, local archive checks, and only documented network destinations.
- Desktop and 390px semantics, all 44px touch targets, reduced motion, link
  crawl, real 404, and zero axe serious/critical findings.
- Live mobile Lighthouse: 99 performance, 100 accessibility, 100 best
  practices, 100 SEO; LCP 1.8 s and CLS 0.
- Sociobot verifier allowance: 30 accepted requests in the measured burst;
  request 31 returned 429 with `Retry-After: 4`, then recovered after cooldown.

## How to reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:browser
node scripts/verify-live.mjs
```

For each `.factory/claims.json` entry, run its `test` command separately.

To reproduce the core accuracy defect, load the packed extension against a
page containing an input wrapped by a label and a visible wrapper
`:focus-within` outline. Record one Tab stop. The current report names it
`Unnamed input`, sets `focusMark` to `false`, and creates an
`invisible-focus` finding.

To reproduce the site defect, keyboard-focus **Export sample report** and
compare `#b42a35` with its adjacent `#20231f` header: 2.51:1.

## Next steps

- Resolve implicit labels through the wrapping `label` element.
- Detect visible ancestor focus treatments used for `:focus-within`.
- Give the export button a focus ring with at least 3:1 contrast on the tape
  background.
- Add packed-extension and rendered contrast regressions, then repeat the full
  verification and deploy only after a PASS.
