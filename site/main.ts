import '../src/site.css';
import { routeExport } from '../src/route';
import { sampleReport } from '../src/sample';

const app = document.querySelector<HTMLElement>('#app')!;
const path = location.pathname.replace(/\.html$/, '') || '/';
const demo = path === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
const sampleKey = 'demo:krc:sample-report';
const licenseKey = 'sb_license:keyboard-route-check';
const verdictKey = 'sb_license_verdict:keyboard-route-check';
const incomingLicense = new URLSearchParams(location.search).get('license');
if (incomingLicense) {
  localStorage.setItem(licenseKey, incomingLicense);
  const cleanUrl = new URL(location.href); cleanUrl.searchParams.delete('license');
  history.replaceState({}, '', `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
}
const live = document.createElement('div');
live.className = 'sr-only'; live.setAttribute('aria-live', 'polite'); document.body.append(live);

function header() {
  return `<a class="skip" href="#main">Skip to content</a><header class="site-header"><a class="wordmark" href="/" aria-label="Keyboard Route Check home"><b>KRC</b> Keyboard Route Check</a><nav aria-label="Primary"><a href="/demo">Demo</a><a href="/#how">How it works</a><a href="/privacy">Privacy</a></nav></header>`;
}
function footer() {
  return `<footer><p>Keyboard routes, made reviewable.</p><nav aria-label="Footer"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="https://sociobot.in" rel="external">Built by Param Factory</a></nav><small>v1.0.0 · Generated artwork is original to this product.</small></footer>`;
}
function demoBanner() {
  return `<aside class="demo-banner" role="status"><span><b>Demo</b> — sample data, nothing is saved</span><span><button class="link-button" id="reset-demo">Reset demo</button><a href="/">Start for real</a></span></aside>`;
}
function findings() {
  const r = sampleReport;
  return `<section class="report" aria-labelledby="report-title"><div class="report-top"><div><p class="eyebrow">ROUTE TAPE / SAMPLE</p><h2 id="report-title">${r.title}</h2><p>${r.steps.length} focused controls · ${r.findings.length} route findings</p></div><button id="export-sample">Export sample report</button></div><ol class="route-list">${r.steps.map((step, index) => `<li class="${step.focusMark ? '' : 'warn'}"><span class="step-number">${String(index + 1).padStart(2, '0')}</span><div><b>${escape(step.label)}</b><small>${escape(step.role)} · ${step.direction === 'reverse' ? 'Shift+Tab' : 'Tab'}</small></div>${step.focusMark ? '<span class="okay">focus seen</span>' : '<span class="flag">focus unclear</span>'}</li>`).join('')}</ol><div class="finding-stack"><h3>Check before release</h3>${r.findings.map((finding) => `<p><b>${finding.kind.replace('-', ' ')}</b> ${escape(finding.message)}</p>`).join('')}</div></section>`;
}
function escape(value: string) { const node = document.createElement('span'); node.textContent = value; return node.innerHTML; }
function landing() {
  return `${header()}<main id="main"><section class="hero"><div class="hero-copy"><p class="eyebrow">A FIELD RECORDER FOR FOCUS</p><h1>Record the route your keyboard takes.</h1><p class="lede">For keyboard users and web teams who need proof before a focus defect reaches production.</p><div class="hero-actions"><a class="button" href="/demo">Try it with sample data</a><span>See a route report right away.</span><a href="/downloads/keyboard-route-check.zip" download>Download the extension</a></div><ul class="facts"><li>Labels and roles only</li><li>Form values stay out</li><li>Free single-page reports</li></ul></div><figure><img src="/hero/cassette-route.webp" width="1200" height="800" fetchpriority="high" decoding="async" alt="An illustrated cassette tape with abstract focus route markings." /><figcaption>Original field-tape artwork.</figcaption></figure></section><section class="product-preview" aria-labelledby="preview-title"><div><p class="eyebrow">WHAT THE EXTENSION CAPTURES</p><h2 id="preview-title">A route people can review.</h2><p>Press Record in the extension. Tab through a real page. Export the labels, roles, order, and warnings.</p><a href="/demo">Open the sample report</a></div>${findings()}</section><section id="how" class="how" aria-labelledby="how-title"><p class="eyebrow">THREE STEPS</p><h2 id="how-title">Check a route before release.</h2><ol><li><b>01</b><h3>Open the page</h3><p>Load the page you need to check.</p></li><li><b>02</b><h3>Record the route</h3><p>Use Tab and Shift+Tab as a keyboard user would.</p></li><li><b>03</b><h3>Share the report</h3><p>Export a small JSON report for the issue or review.</p></li></ol></section><section class="privacy-note" aria-labelledby="limits-title"><p class="eyebrow">BOUNDARIES</p><h2 id="limits-title">It records a route, not a certification.</h2><p>Keyboard Route Check does not certify WCAG compliance. It does not send route data away. Use it beside human review.</p><a href="/privacy">Read the privacy details</a></section><section class="paid" aria-labelledby="team-title"><p class="eyebrow">FOR SMALL TEAMS</p><h2 id="team-title">Keep a team route archive.</h2><p>$29 one-time. Save report history on this device.</p><div class="buy-row"><a class="button red" href="https://api.sociobot.in/api/v1/products/keyboard-route-check/checkout">Buy team archive</a><span>Sociobot is the merchant of record.</span></div><form id="license-form"><label for="license">Have a license? Paste it</label><div><input id="license" name="license" autocomplete="off" /><button>Verify license</button></div><p id="license-note" aria-live="polite"></p></form></section></main>${footer()}`;
}
function demoPage() {
  return `${header()}${demoBanner()}<main id="main" class="demo-main"><section class="demo-heading"><p class="eyebrow">SAMPLE REPORT</p><h1>Review a keyboard route.</h1><p class="lede">This sample shows the labels, order, and focus warnings the extension records.</p><a class="button" href="/downloads/keyboard-route-check.zip" download>Download the extension</a></section>${findings()}</main>${footer()}`;
}
function legalPage(kind: 'privacy' | 'terms') {
  const privacy = kind === 'privacy';
  return `${header()}<main id="main" class="legal"><p class="eyebrow">${privacy ? 'LOCAL-FIRST PRIVACY' : 'TERMS OF USE'}</p><h1>${privacy ? 'Your route stays on your device.' : 'Use the report as review evidence.'}</h1>${privacy ? `<p>Keyboard Route Check records focused control labels, roles, order, and route warnings in the browser extension. It does not record form values. It does not send route reports to our servers.</p><p>The optional team license is stored in this browser. License verification requests go only to Sociobot. The checkout is hosted by Sociobot.</p><p>Sample data uses a separate <code>demo:</code> browser-storage namespace. Reset demo clears that sample.</p>` : `<p>Keyboard Route Check helps people review manual keyboard testing. It does not certify accessibility compliance or replace human review.</p><p>The optional team archive is a one-time purchase. Sociobot is the merchant of record. A refund or revoked license disables that optional feature.</p><p>Use the extension only on pages you are permitted to test.</p>`}</main>${footer()}`;
}
function missingPage() { return `${header()}<main id="main" class="missing"><p class="eyebrow">TAPE ENDS HERE</p><h1>That page is not on this tape.</h1><p>Return home and start a route check.</p><a class="button" href="/">Go to Keyboard Route Check</a></main>${footer()}`; }

function enterDemo() {
  localStorage.setItem(sampleKey, JSON.stringify(sampleReport));
  document.querySelector('#reset-demo')?.addEventListener('click', () => { localStorage.removeItem(sampleKey); enterDemo(); live.textContent = 'Demo reset.'; });
  document.querySelector('#export-sample')?.addEventListener('click', exportSample);
}
function exportSample() {
  const blob = new Blob([routeExport(sampleReport)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'sample-keyboard-route-report.json'; link.click(); URL.revokeObjectURL(link.href); live.textContent = 'Sample report download started.';
}
async function verifyLicense(token: string) {
  const note = document.querySelector<HTMLElement>('#license-note')!;
  if (!token.trim()) { note.textContent = 'Paste your license token first.'; return; }
  localStorage.setItem('sb_license:keyboard-route-check', token.trim());
  note.textContent = 'Checking your license…';
  try { const res = await fetch(`https://api.sociobot.in/api/v1/products/keyboard-route-check/verify?license=${encodeURIComponent(token.trim())}`); const result = await res.json() as { valid: boolean }; localStorage.setItem('sb_license_verdict:keyboard-route-check', JSON.stringify({ ...result, checkedAt: Date.now() })); note.textContent = result.valid ? 'License active. Team archive is available.' : 'This license is not active. You can buy a new team archive.'; } catch { note.textContent = 'Could not check the license. Your saved verdict will be checked later.'; }
}
async function reconcileStoredLicense() {
  const token = localStorage.getItem(licenseKey);
  if (!token) return;
  const cached = JSON.parse(localStorage.getItem(verdictKey) || 'null') as { checkedAt?: number } | null;
  if (cached?.checkedAt && Date.now() - cached.checkedAt < 86_400_000) return;
  try {
    const res = await fetch(`https://api.sociobot.in/api/v1/products/keyboard-route-check/verify?license=${encodeURIComponent(token)}`);
    const verdict = await res.json();
    localStorage.setItem(verdictKey, JSON.stringify({ ...verdict, checkedAt: Date.now() }));
  } catch { /* The stored verdict remains available while offline. */ }
}
if (path === '/privacy') { document.title = 'Privacy — Keyboard Route Check'; app.innerHTML = legalPage('privacy'); }
else if (path === '/terms') { document.title = 'Terms — Keyboard Route Check'; app.innerHTML = legalPage('terms'); }
else if (path === '/404') { document.title = 'Page not found — Keyboard Route Check'; app.innerHTML = missingPage(); }
else if (demo) { document.title = 'Demo — Keyboard Route Check'; app.innerHTML = demoPage(); enterDemo(); }
else { document.title = 'Keyboard Route Check — Record a keyboard route'; app.innerHTML = landing(); document.querySelector('#license-form')?.addEventListener('submit', (event) => { event.preventDefault(); void verifyLicense((document.querySelector('#license') as HTMLInputElement).value); }); document.querySelector('#export-sample')?.addEventListener('click', exportSample); }
void reconcileStoredLicense();
