# Keyboard Route Check

Record the route your keyboard takes.

Keyboard Route Check is for keyboard-only users and small web teams. Its Chrome
extension records a manual Tab and Shift+Tab route through one page. It records
each focused control’s name, type, and order, then flags likely focus problems.
It never records form values.

It warns when forward Tab returns to an earlier control. It records the
browser’s actual Tab order. Page labels appear as text in the popup. It also
warns when a control lacks a visible focus mark.

Recording works offline after the page and extension are loaded. License checks
need a connection.

The website includes a one-click sample report. Try the isolated
sample at `/?demo=1` after running the site.

## Use the extension

1. Build the project and load `.output/chrome-mv3` as an unpacked extension in
   Chrome or Chromium.
2. Open an `http` or `https` page you are allowed to test.
3. Open Keyboard Route Check and choose **Record this tab**.
4. Use Tab and Shift+Tab on the page, then stop recording.
5. Export the JSON route report for a review or issue.

The recorder provides manual evidence. It cannot confirm that a page meets
accessibility requirements or replace human review.

Developer detail: the recorder respects valid positive `tabindex` values.

## Develop, test, and build

```sh
npm install
npm test
npm run test:browser
npm run build
```

`npm run build` creates:

- `.output/chrome-mv3` — unpacked MV3 extension
- `.output/keyboard-route-check-1.0.0-chrome.zip` — extension archive
- `dist/site` — static deployment output, including
  `downloads/keyboard-route-check.zip`

Run the website locally:

```sh
npm run dev:site
```

Open `http://localhost:5173/?demo=1` for the isolated sample route. Demo storage
uses the `demo:krc:sample-report` localStorage key. Reset demo recreates it;
Start for real clears it.

## Deploy

The factory deploys the website from `dist/site`. The build puts
the packaged extension in its `downloads/` directory.

```sh
/opt/fleet/lib/deploy-static.sh keyboard-route-check dist/site
```

Do not deploy the extension separately. Do not change DNS, billing, or checkout
configuration from this repository.

## Privacy and the local report archive

Route reports stay in browser extension storage. The extension records control
names, types, directions, timestamps, stable identifiers, and a safe page
address. It never records form values or page titles. It removes URL
credentials, query values, and fragments before export. It makes no analytics
or route-report requests.

The optional local report archive saves history only in this browser. It does
not sync or share reports with teammates. New local archive purchases are
temporarily unavailable.

Existing license holders can still move a license to another browser. The
website keeps a returned token only in the return tab until it closes. Open the
checkout return link and copy the displayed token. In the extension, choose
**Local archive license**, paste the token, and verify it.

See the deployed `/privacy` and `/terms` pages for the current legal text.

## License

[MIT](LICENSE)
