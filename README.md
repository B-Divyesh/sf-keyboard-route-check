# Keyboard Route Check

Record the route your keyboard takes.

Keyboard Route Check is for keyboard-only users and small web teams. Its Chrome
extension records a manual Tab and Shift+Tab route through one page. It records
control labels, roles, order, and likely focus-route defects. It never records
form values.

It warns when a repeated forward Tab route returns to an earlier control. It
records the browser's Tab order, including valid positive `tabindex` values.
Page labels appear as text in the popup.
It warns when a control lacks a visible focus indicator.

The static site is a companion landing page and one-click sample report. Try
the sample at `/demo` after running the site.

## Use the extension

1. Build the project and load `.output/chrome-mv3` as an unpacked extension in
   Chrome or Chromium.
2. Open an `http` or `https` page you are allowed to test.
3. Open Keyboard Route Check and choose **Record this tab**.
4. Use Tab and Shift+Tab on the page, then stop recording.
5. Export the JSON route report for a review or issue.

The recorder is manual evidence, not WCAG certification or automated testing.

## Develop, test, and build

```sh
npm install
npm test
npm run build
```

`npm run build` creates:

- `.output/chrome-mv3` — unpacked MV3 extension
- `.output/keyboard-route-check-1.0.0-chrome.zip` — extension archive
- `dist/site` — static deployment output, including
  `downloads/keyboard-route-check.zip`

For the companion site locally:

```sh
npm run dev:site
```

Open `http://localhost:5173/demo` for the isolated sample route. Demo storage
uses the `demo:krc:sample-report` localStorage key. Reset demo recreates it;
Start for real clears it.

## Deploy

The factory deploys the static companion site from `dist/site`; the packaged
extension is copied into its `downloads/` directory during the build.

```sh
/opt/fleet/lib/deploy-static.sh keyboard-route-check dist/site
```

Do not deploy the extension separately or change DNS, billing, or checkout
configuration from this repository.

## Privacy and the optional team archive

Route reports stay in browser extension storage. The extension records labels,
roles, directions, timestamps, stable control identifiers, and a page origin
and path. It never records form values or page titles. It removes URL
credentials, query values, and fragments before export. It makes no analytics
or route-report requests.

The optional team archive saves report history in the extension browser
profile. New archive purchases are temporarily unavailable. If an existing
purchase returns to the companion site, copy its displayed token into
**Team archive license** in the extension and verify it there.

See the deployed `/privacy` and `/terms` pages for the current legal text.

## License

[MIT](LICENSE)
