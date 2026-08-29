import '../src/site.css';
import '../src/mobile-fix.css';
import '../src/touch-targets.css';
import { escapeHtml } from '../src/html';
import { routeExport } from '../src/route';
import { sampleReport } from '../src/sample';

const app = document.querySelector<HTMLElement>('#app')!;
const path = location.pathname.replace(/\.html$/, '') || '/';
const demo = path === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
const sampleKey = 'demo:krc:sample-report';
const licenseKey = 'sb_license:keyboard-route-check';
const incomingLicense = new URLSearchParams(location.search).get('license');
if (incomingLicense) {
  localStorage.setItem(licenseKey, incomingLicense);
  sessionStorage.setItem('krc:license-transfer', incomingLicense);
  const cleanUrl = new URL(location.href); cleanUrl.searchParams.delete('license');
  history.replaceState({}, '', `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
}
const transferToken = sessionStorage.getItem('krc:license-transfer');
const live = document.createElement('div');
live.className = 'sr-only'; live.setAttribute('aria-live', 'polite'); document.body.append(live);

function header() {
  return `<a class="skip" href="#main">Skip to content</a><header class="site-header"><a class="wordmark" href="/" aria-label="KRC Keyboard Route Check"><b>KRC</b> Keyboard Route Check</a><nav aria-label="Primary"><a href="/demo">Demo</a><a href="/#how">How it works</a><a href="/privacy">Privacy</a></nav></header>`;
}
function footer() {
  return `<footer><p>Keyboard routes, made reviewable.</p><nav aria-label="Footer"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="https://sociobot.in" rel="external">Built by Param Factory</a></nav><small>v1.0.0 · Generated artwork is original to this product.</small></footer>`;
}
function demoBanner() {
  return `<aside class="demo-banner" aria-label="Demo controls"><span><b>Demo</b> — sample data, nothing is saved to your real data</span><span><button class="link-button" id="reset-demo">Reset demo</button><a id="start-real" href="/">Start for real</a></span></aside>`;
}
function findings() {
  const r = sampleReport;
  return `<section class="report" aria-labelledby="report-title"><div class="report-top"><div><p class="eyebrow">ROUTE TAPE / SAMPLE</p><h2 id="report-title">${r.title}</h2><p>${r.steps.length} focused controls · ${r.findings.length} route findings</p></div><button id="export-sample">Export sample report</button></div><ol class="route-list">${r.steps.map((step, index) => `<li class="${step.focusMark ? '' : 'warn'}"><span class="step-number">${String(index + 1).padStart(2, '0')}</span><div><b>${escapeHtml(step.label)}</b><small>${escapeHtml(step.role)} · ${step.direction === 'reverse' ? 'Shift+Tab' : 'Tab'}</small></div>${step.focusMark ? '<span class="okay">focus seen</span>' : '<span class="flag">focus unclear</span>'}</li>`).join('')}</ol><div class="finding-stack"><h3>Check before release</h3>${r.findings.map((finding) => `<p><b>${escapeHtml(finding.kind.replace('-', ' '))}</b> ${escapeHtml(finding.message)}</p>`).join('')}</div></section>`;
}
function licenseTransfer() {
  if (!transferToken) return '';
  return `<section class="license-transfer" aria-labelledby="transfer-title"><h3 id="transfer-title">Move your license to the extension</h3><p>Your checkout return is saved in this browser. Copy it, open the extension, choose Team archive license, paste it, and verify it.</p><label for="returned-license">Returned license token</label><div><input id="returned-license" readonly value="${escapeHtml(transferToken)}" /><button id="copy-license" type="button">Copy license token</button></div><p id="transfer-note" aria-live="polite"></p></section>`;
}
function landing() {
  return `${header()}<main id="main"><section class="hero"><div class="hero-copy"><p class="eyebrow">A FIELD RECORDER FOR FOCUS</p><h1>Record the route your keyboard takes.</h1><p class="lede">For keyboard users and web teams who need proof before a focus defect reaches production.</p><div class="hero-actions"><a class="button" href="/demo">Try it with sample data</a><span>See a route report right away.</span><a href="/downloads/keyboard-route-check.zip" download>Download the extension</a></div><ul class="facts"><li>Labels and roles only</li><li>Form values stay out</li><li>Warns on repeated Tab loops</li></ul></div><figure><img src="/hero/cassette-route.webp" width="1200" height="800" fetchpriority="high" decoding="async" alt="An illustrated cassette tape with abstract focus route markings." /><figcaption>Original field-tape artwork.</figcaption></figure></section><section class="product-preview" aria-labelledby="preview-title"><div><p class="eyebrow">WHAT THE EXTENSION CAPTURES</p><h2 id="preview-title">A route people can review.</h2><p>Press Record in the extension. Tab through a real page. Export the labels, roles, order, and warnings.</p><a href="/demo">Open the sample report</a></div>${findings()}</section><section id="how" class="how" aria-labelledby="how-title"><p class="eyebrow">THREE STEPS</p><h2 id="how-title">Check a route before release.</h2><ol><li><b>01</b><h3>Open the page</h3><p>Load the page you need to check.</p></li><li><b>02</b><h3>Record the route</h3><p>Use Tab and Shift+Tab as a keyboard user would.</p></li><li><b>03</b><h3>Share the report</h3><p>Export a small JSON report for the issue or review.</p></li></ol></section><section class="privacy-note" aria-labelledby="limits-title"><p class="eyebrow">BOUNDARIES</p><h2 id="limits-title">It records a route, not a certification.</h2><p>Keyboard Route Check does not certify WCAG compliance. It does not send route data away. Use it beside human review.</p><a href="/privacy">Read the privacy details</a></section><section class="paid" aria-labelledby="team-title"><p class="eyebrow">FOR SMALL TEAMS</p><h2 id="team-title">Keep a team route archive.</h2><p>Licensed teams can save report history in this browser.</p><p>New team archive purchases are temporarily unavailable.</p>${licenseTransfer()}</section></main>${footer()}`;
}
function demoPage() {
  return `${header()}${demoBanner()}<main id="main" class="demo-main"><section class="demo-heading"><p class="eyebrow">SAMPLE REPORT</p><h1>Review a keyboard route.</h1><p class="lede">This sample shows the labels, order, and focus warnings the extension records.</p><a class="button" href="/downloads/keyboard-route-check.zip" download>Download the extension</a></section>${findings()}</main>${footer()}`;
}
function legalPage(kind: 'privacy' | 'terms') {
  const privacy = kind === 'privacy';
  return `${header()}<main id="main" class="legal"><p class="eyebrow">${privacy ? 'LOCAL-FIRST PRIVACY' : 'TERMS OF USE'}</p><h1>${privacy ? 'Your route stays on your device.' : 'Use the report as review evidence.'}</h1>${privacy ? `<p>Keyboard Route Check records focused control labels, roles, directions, timing, stable control identifiers, and route warnings in extension storage. It does not record form values or page titles.</p><p>Reports keep only the page origin and path. They remove credentials, query values, and fragments before storage or export. It does not send route reports to our servers.</p><p>Page labels are shown as text in the extension popup. They cannot create popup controls.</p><p>An existing team license is stored in the browser where you paste it. License verification requests go only to Sociobot. A returned checkout token is saved in companion-site browser storage and shown for the current session so you can copy it into the extension.</p><p>Sample data uses a separate <code>demo:</code> browser-storage namespace. Reset demo clears that sample.</p>` : `<p>Keyboard Route Check helps people review manual keyboard testing. It does not certify accessibility compliance or replace human review.</p><p>The optional team archive saves report history in the extension browser profile. New team archive purchases are temporarily unavailable.</p><p>Use the extension only on pages you are permitted to test.</p>`}</main>${footer()}`;
}
function missingPage() { return `${header()}<main id="main" class="missing"><p class="eyebrow">TAPE ENDS HERE</p><h1>That page is not on this tape.</h1><p>Return home and start a route check.</p><a class="button" href="/">Go to Keyboard Route Check</a></main>${footer()}`; }

function enterDemo() {
  localStorage.setItem(sampleKey, JSON.stringify(sampleReport));
  document.querySelector('#reset-demo')?.addEventListener('click', () => { localStorage.removeItem(sampleKey); enterDemo(); live.textContent = 'Demo reset.'; });
  // Demo data is deliberately ephemeral. Clear it before following the normal
  // link so a browser navigation cannot leave a stale sample behind.
  document.querySelector('#start-real')?.addEventListener('click', () => localStorage.removeItem(sampleKey));
  document.querySelector('#export-sample')?.addEventListener('click', exportSample);
}
function exportSample() {
  const blob = new Blob([routeExport(sampleReport)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'sample-keyboard-route-report.json'; link.click(); URL.revokeObjectURL(link.href); live.textContent = 'Sample report download started.';
}
async function copyTransferToken() {
  if (!transferToken) return;
  const note = document.querySelector<HTMLElement>('#transfer-note');
  try {
    await navigator.clipboard.writeText(transferToken);
    if (note) note.textContent = 'License token copied. Paste it into the extension.';
  } catch {
    const input = document.querySelector<HTMLInputElement>('#returned-license');
    input?.select();
    if (note) note.textContent = 'Select and copy the license token, then paste it into the extension.';
  }
}
if (path === '/privacy') { document.title = 'Privacy — Keyboard Route Check'; app.innerHTML = legalPage('privacy'); }
else if (path === '/terms') { document.title = 'Terms — Keyboard Route Check'; app.innerHTML = legalPage('terms'); }
else if (path === '/404') { document.title = 'Page not found — Keyboard Route Check'; app.innerHTML = missingPage(); }
else if (demo) { document.title = 'Demo — Keyboard Route Check'; app.innerHTML = demoPage(); enterDemo(); }
else if (path === '/') { document.title = 'Keyboard Route Check — Record a keyboard route'; app.innerHTML = landing(); document.querySelector('#copy-license')?.addEventListener('click', () => void copyTransferToken()); document.querySelector('#export-sample')?.addEventListener('click', exportSample); }
else { document.title = 'Page not found — Keyboard Route Check'; app.innerHTML = missingPage(); }
