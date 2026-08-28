# Keyboard Route Check verification handoff — FAIL

Independent verification of candidate
`f8554d58bee597f4b210c445d8543ead5e983b1b` against
https://keyboard-route-check.sociobot.in completed on 2026-08-28 UTC.

Do not release this candidate. Exact evidence, commands, and full severity
breakdown are in [verification.md](verification.md).

## Blocking result

- Both required commands in `.factory/claims.json` fail with Vitest’s
  `Unknown option --grep` error.
- The packed extension falsely flags a focus loop in ordinary Tab traversal:
  consecutive plain links are both identified as `a.`.

## Other confirmed defects

- Unknown live routes return HTTP 200 and the landing page instead of a real
  styled 404 response.
- Several interactive targets are below the required 44×44 CSS px minimum,
  including footer links and mobile header links.
- Multiple visitor-facing privacy/demo/price claims are not represented in
  `.factory/claims.json`.

## Verification summary

`npm test`, `npx tsc --noEmit`, and exact `npm run build` pass. The live static
HTML, JS, CSS, and unpacked extension contents match the built candidate. The
demo/export flow, core privacy redaction smoke test, keyboard focus, reduced
motion, Playwright axe scan, and live mobile Lighthouse (99 performance, 100
accessibility) otherwise passed. API verification rate limiting was observed
(first 429 in a 20-way burst at request 17, with `Retry-After: 2`).

## Rerun

After repairing the documented blockers, run:

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
```

Then rerun every exact command in `.factory/claims.json`, a packed-extension
recording path through adjacent generic links/buttons, mobile touch-target
checks, and live deployment comparison.
