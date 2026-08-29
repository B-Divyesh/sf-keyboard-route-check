# Keyboard Route Check — verification 5 handoff

## Release status

**FAIL — do not release candidate
`54b1d01801edab0a262c142249f83d8ca1b60fa8`.** It was independently tested on
2026-08-29 against https://keyboard-route-check.sociobot.in. The live site and
downloaded extension match the candidate, but two High findings remain:

1. Paper-backed controls in the extension popup use a 1.12:1 focus outline,
   below the required 3:1 visibility threshold.
2. “New team archive purchases are temporarily unavailable” appears publicly
   but is absent from `.factory/claims.json`, which is release-blocking under
   the supplied claims contract.

The focus detector also has a Medium core-accuracy defect: it labels a strong
background-color focus change as invisible because it checks only outlines and
box shadows. Full reproduction and evidence are in
`.factory/verification-5.md`.

## What passed

- All ten exact claim commands: 1 test selected and passed per command.
- `npm test`: 11/11; typecheck and lint: pass; browser tests: 17/17.
- Exact production build and extension zip integrity: pass.
- Packed-extension record, forward/reverse navigation, pause, export, clear,
  secret redaction, loop/skip/focus warnings, label escaping, license errors,
  offline recovery, and local archive checks: pass except for the independent
  focus cases above.
- One-click live demo, isolated reset/exit, JSON export, and same-origin request
  log: pass.
- Live candidate identity: exact static-file and unpacked-extension match.
- Live desktop/390px routes: zero axe violations, no console/page errors,
  correct semantics, no overflow, 44px controls, visible site focus, and no
  reduced-motion activity.
- Lighthouse: 100 performance/accessibility/best-practices/SEO; LCP 1.8 s,
  TBT 0 ms, CLS 0.
- Security headers, conditional caching, and bundle/image budgets: pass.
- Sociobot verify allowance: 30 accepted requests; request 31 returned 429
  with `Retry-After: 4`.
- Production dependency audit: 0 vulnerabilities. The development tree still
  reports 10 advisories.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run test:browser
npm run build
npm audit --omit=dev --audit-level=high
unzip -t .output/keyboard-route-check-1.0.0-chrome.zip
```

Load `.output/chrome-mv3` in a fresh Chromium profile for the popup checks.
Open `/demo` for the isolated sample. No product code was modified during this
verification.

## Required next steps

Use a popup focus color with at least 3:1 contrast against the paper surface,
add a packed-popup contrast assertion, register or remove the unlisted archive
availability statement, and recognize valid background/border focus changes.
Then rerun every claim command and the full packed-extension/live suite.
