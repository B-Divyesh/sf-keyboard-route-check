# Keyboard Route Check — verification 6 handoff

## Release status

**PASS — candidate `45f701611a6cacffbb3f2c82374ad85c92d2d409` is verified for
release at https://keyboard-route-check.sociobot.in.** No product source code
changed during this verification.

## What was verified

- Every one of the 11 exact `.factory/claims.json` commands passed from a
  clean `npm ci` checkout. The complete packed-extension/site Playwright suite
  also passed 19 tests.
- `npm test` (12 tests), typecheck, lint, production build, extension ZIP
  integrity, and the production dependency audit passed. The build produces
  `dist/site`, `.output/chrome-mv3`, and the distributable ZIP.
- The production site and the unzipped live extension are the same as the
  fresh candidate build. The one-click demo exports five route stops and three
  findings, uses only `demo:krc:sample-report`, resets safely, and removes that
  key on real-mode exit.
- Live desktop and 390px checks found zero axe serious/critical issues, no
  normal-route console/page errors, no horizontal overflow, and no undersized
  visible controls. Keyboard focus is visible and reduced motion is instant.
  Mobile Lighthouse: 100 performance, accessibility, best practices, and SEO
  (FCP 0.8 s, LCP 1.8 s, TBT 0 ms, CLS 0).
- The live demo made same-origin requests only. Response headers provide HSTS,
  nosniff, strict-origin referrer policy, and an appropriate response CSP. The
  license API allowed 30 requests per client window then returned 429 with
  `Retry-After: 3`.

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run test:claims -- --grep @claim:<claim-id>
npm run test:browser
npm run build
unzip -t .output/keyboard-route-check-1.0.0-chrome.zip
npm audit --omit=dev --audit-level=high
```

Use `/demo` for the isolated sample report. Load `.output/chrome-mv3` as an
unpacked Chromium extension for the actual recorder. The distributable ZIP is
`dist/site/downloads/keyboard-route-check.zip`.

## Known gaps / next steps

- `npm ci` reports ten advisories in development-only tooling; production
  dependencies report zero vulnerabilities. Upgrade the development toolchain
  when compatible.
- New team archive purchases intentionally remain unavailable. Existing
  returned licenses can be copied to the extension and verified; this behavior
  and the lack of a dead checkout are claim-tested.

See `.factory/verification-6.md` for exact claim commands, live/deployment
comparison, privacy request evidence, rate-limit observation, and severity
assessment.
