# Keyboard Route Check — review 1 handoff

## Status

**FAIL.** This was a read-only adversarial review at
`b4b3f35ab995a2d0ad36cd38594c66a8bede4012`; no product source was changed.
The complete report is `.factory/review-1.md`.

## Verified

- Live cold checks at 390px and desktop confirm the first screen explains the
  job, audience, and sample-demo action.
- The one-click `/demo` route shows a populated five-control report; request
  logging showed only same-origin traffic. Reset retained only
  `demo:krc:sample-report`; Start for real removed it.
- A new temp clone received `npm ci`; `npm test` passed 12 tests and
  `npm run test:browser` passed 19 tests. The 11 declared claim commands were
  run and passed. `npm run build` succeeds and produces `dist/site`.
- Live axe scans at mobile and desktop found no serious/critical violations.
  Internal/external links tested returned successfully; metadata, visual
  identity, and basic offline/privacy behavior were inspected.

## Remaining work

1. Blocking: focus the destination `<h1>` and announce every route change;
   Back has the same defect.
2. Replace decorative cassette/metaphor labels and specialist accessibility
   jargon with the exact plain-language alternatives in review F-1-2/F-1-3.
3. Rename or implement the misleading local-only “team archive.”
4. Add a canonical link on the 404 and make the footer’s external destination
   clear.

After repairs, rerun the entire cold live review rather than treating this as a
diff-only check.
