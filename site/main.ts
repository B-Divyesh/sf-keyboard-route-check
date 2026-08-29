import '../src/site.css';
import '../src/mobile-fix.css';
import '../src/touch-targets.css';
import '../src/polish.css';
import { escapeHtml } from '../src/html';
import { routeExport } from '../src/route';
import { sampleReport } from '../src/sample';

const app = document.querySelector<HTMLElement>('#app')!;
const sampleKey = 'demo:krc:sample-report';
const licenseTransferKey = 'krc:license-transfer';
const incomingLicense = new URLSearchParams(location.search).get('license');
const initialPath = location.pathname.replace(/\.html$/, '') || '/';
const enteredDemo = initialPath === '/demo' || (initialPath === '/' && new URLSearchParams(location.search).get('demo') === '1');
if (incomingLicense) {
  const cleanUrl = new URL(location.href);
  cleanUrl.searchParams.delete('license');
  history.replaceState({}, '', `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
  // A checkout return and the sample sandbox must never share storage. The
  // demo URL deliberately ignores a token after removing it from the address.
  if (!enteredDemo) sessionStorage.setItem(licenseTransferKey, incomingLicense);
}

const live = document.createElement('div');
live.className = 'sr-only';
live.setAttribute('aria-live', 'polite');
live.setAttribute('aria-atomic', 'true');
document.body.append(live);

type RouteName = 'home' | 'demo' | 'privacy' | 'terms' | 'missing';
type RouteMeta = { title: string; description: string; canonical: string };

const routeMeta: Record<RouteName, RouteMeta> = {
  home: {
    title: 'Keyboard Route Check — Record a keyboard route',
    description: 'Record a keyboard route and export possible focus problems.',
    canonical: '/'
  },
  demo: {
    title: 'Demo — Keyboard Route Check',
    description: 'Try a sample keyboard route report.',
    canonical: '/demo'
  },
  privacy: {
    title: 'Privacy — Keyboard Route Check',
    description: 'Read how Keyboard Route Check stores route reports and sample data.',
    canonical: '/privacy'
  },
  terms: {
    title: 'Terms — Keyboard Route Check',
    description: 'Read the terms for using Keyboard Route Check reports.',
    canonical: '/terms'
  },
  missing: {
    title: 'Page not found — Keyboard Route Check',
    description: 'The requested Keyboard Route Check page was not found.',
    canonical: '/404'
  }
};

function routeName(): RouteName {
  const path = location.pathname.replace(/\.html$/, '') || '/';
  if (path === '/demo' || (path === '/' && new URLSearchParams(location.search).get('demo') === '1')) return 'demo';
  if (path === '/privacy') return 'privacy';
  if (path === '/terms') return 'terms';
  if (path === '/404') return 'missing';
  if (path === '/') return 'home';
  return 'missing';
}

function setNamedMeta(selector: string, value: string) {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', value);
}

function setRouteMetadata(route: RouteName) {
  const metadata = routeMeta[route];
  const canonical = new URL(metadata.canonical, 'https://keyboard-route-check.sociobot.in').href;
  document.title = metadata.title;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonical);
  setNamedMeta('meta[name="description"]', metadata.description);
  setNamedMeta('meta[property="og:title"]', metadata.title);
  setNamedMeta('meta[property="og:description"]', metadata.description);
  setNamedMeta('meta[name="twitter:title"]', metadata.title);
  setNamedMeta('meta[name="twitter:description"]', metadata.description);
}

function header() {
  return `<a class="skip" href="#main">Skip to content</a><header class="site-header"><a class="wordmark" href="/" aria-label="KRC Keyboard Route Check home"><b>KRC</b> Keyboard Route Check</a><nav aria-label="Primary"><a href="/demo">Demo</a><a href="/#how">How it works</a><a href="/privacy">Privacy</a></nav></header>`;
}

function footer() {
  return `<footer><p>Record and export manual keyboard routes.</p><nav aria-label="Footer"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="https://sociobot.in" rel="external">Built by Param Factory (external site)</a></nav><small>v1.0.0</small></footer>`;
}

function demoBanner() {
  return `<aside class="demo-banner" aria-label="Demo controls"><span><b>Demo</b> — sample data, nothing is saved to your real data</span><span><button class="link-button" id="reset-demo">Reset demo</button><a id="start-real" href="/">Start for real</a></span></aside>`;
}

function findings() {
  const r = sampleReport;
  return `<section class="report" aria-labelledby="report-title"><div class="report-top"><div><p class="eyebrow">SAMPLE REPORT</p><h2 id="report-title">${r.title}</h2><p>${r.steps.length} focused controls · ${r.findings.length} route findings</p></div><button id="export-sample">Export sample report</button></div><ol class="route-list">${r.steps.map((step, index) => `<li class="${step.focusMark ? '' : 'warn'}"><span class="step-number">${String(index + 1).padStart(2, '0')}</span><div><b>${escapeHtml(step.label)}</b><small>${escapeHtml(step.role)} · ${step.direction === 'reverse' ? 'Shift+Tab' : 'Tab'}</small></div>${step.focusMark ? '<span class="okay">focus seen</span>' : '<span class="flag">focus unclear</span>'}</li>`).join('')}</ol><div class="finding-stack"><h3>Route findings</h3>${r.findings.map((finding) => `<p><b>${escapeHtml(finding.kind.replace('-', ' '))}</b> ${escapeHtml(finding.message)}</p>`).join('')}</div></section>`;
}

function licenseTransfer() {
  const transferToken = sessionStorage.getItem(licenseTransferKey);
  if (!transferToken) return '';
  return `<section class="license-transfer" aria-labelledby="transfer-title"><h3 id="transfer-title">Move your license to the extension</h3><p>Your returned checkout token stays in this tab until it closes. Copy it, open the extension, choose Local archive license, paste it, and verify it.</p><label for="returned-license">Returned license token</label><div><input id="returned-license" readonly value="${escapeHtml(transferToken)}" /><button id="copy-license" type="button">Copy license token</button></div><p id="transfer-note" aria-live="polite"></p></section>`;
}

function landing() {
  return `${header()}<main id="main" tabindex="-1"><section class="hero"><div class="hero-copy"><p class="eyebrow">Keyboard route recorder</p><h1 tabindex="-1">Record the route your keyboard takes.</h1><p class="lede">For keyboard users and web teams checking how focus moves through a page.</p><div class="hero-actions"><a class="button" href="/?demo=1">Try it with sample data</a><span>See a route report right away.</span><a href="/downloads/keyboard-route-check.zip" download>Download desktop Chrome extension ZIP</a></div><ul class="facts"><li>Free report export; no account</li><li>Route data stays in this browser</li><li>Recording works offline; license checks need a connection</li></ul></div><figure><img src="/hero/cassette-route.webp" width="1200" height="800" fetchpriority="high" decoding="async" alt="An illustrated cassette tape with abstract focus route markings." /></figure></section><section class="product-preview" aria-labelledby="preview-title"><div><p class="eyebrow">WHAT THE EXTENSION CAPTURES</p><h2 id="preview-title">Sample keyboard route report</h2><p>Press Record in the extension. Tab through a real page. Export each control’s name, type, order, and warnings.</p><a href="/demo">Open the sample report</a></div>${findings()}</section><section class="install" aria-labelledby="install-title"><p class="eyebrow">INSTALL THE EXTENSION</p><h2 id="install-title">Install in desktop Chrome or Chromium</h2><p>Chrome on phones cannot run this extension.</p><ol><li>Download the desktop Chrome extension ZIP.</li><li>Extract the ZIP to a folder.</li><li>Open <code>chrome://extensions</code> on your desktop.</li><li>Turn on Developer mode, choose <b>Load unpacked</b>, and select that folder.</li></ol></section><section id="how" class="how" aria-labelledby="how-title"><p class="eyebrow">THREE STEPS</p><h2 id="how-title">Check a route before release.</h2><ol><li><b>01</b><h3>Open the page</h3><p>Load the page you need to check.</p></li><li><b>02</b><h3>Record the route</h3><p>Use Tab and Shift+Tab as a keyboard user would.</p></li><li><b>03</b><h3>Export the report</h3><p>Export a small JSON report for the issue or review.</p></li></ol></section><section class="privacy-note" aria-labelledby="limits-title"><p class="eyebrow">BOUNDARIES</p><h2 id="limits-title">It records a route, not a certification.</h2><p>It cannot confirm that a page meets accessibility requirements. It does not send route data away. Use it beside human review.</p><a href="/privacy">Read the privacy details</a></section><section class="paid" aria-labelledby="archive-title"><p class="eyebrow">FOR EXISTING LICENSES</p><h2 id="archive-title">Local report archive for existing licenses</h2><p>It saves reports only in this browser. It does not sync or share them with teammates.</p><p>New local archive purchases are temporarily unavailable.</p>${licenseTransfer()}</section></main>${footer()}`;
}

function demoPage() {
  return `${header()}${demoBanner()}<main id="main" class="demo-main" tabindex="-1"><section class="demo-heading"><p class="eyebrow">SAMPLE REPORT</p><h1 tabindex="-1">Review a keyboard route.</h1><p class="lede">This sample shows each focused control’s name, order, and warnings.</p><a class="button" href="/downloads/keyboard-route-check.zip" download>Download desktop Chrome extension ZIP</a></section>${findings()}</main>${footer()}`;
}

function legalPage(kind: 'privacy' | 'terms') {
  const privacy = kind === 'privacy';
  return `${header()}<main id="main" class="legal" tabindex="-1"><p class="eyebrow">${privacy ? 'PRIVACY' : 'TERMS OF USE'}</p><h1 tabindex="-1">${privacy ? 'Your route stays on your device.' : 'Use the report as review evidence.'}</h1>${privacy ? `<p>Keyboard Route Check records each focused control’s name, type, direction, timing, identifier, and route warnings in extension storage. It does not record form values or page titles.</p><p>Reports keep only the page origin and path. They remove credentials, query values, and fragments before storage or export. It does not send route reports to our servers.</p><p>Page labels appear as text in the extension popup. They cannot create popup controls.</p><p>An existing local archive license is stored in the browser where you paste it. License checks go only to Sociobot. The website keeps a returned checkout token in this tab until the tab closes, so you can copy it into the extension.</p><p>Sample data uses a separate <code>demo:</code> browser-storage namespace. Reset demo clears that sample.</p>` : `<p>Keyboard Route Check helps people review manual keyboard testing. It cannot confirm that a page meets accessibility requirements or replace human review.</p><p>The optional local report archive saves history only in this browser. It does not sync or share reports. New local archive purchases are temporarily unavailable.</p><p>Use the extension only on pages you are permitted to test.</p>`}</main>${footer()}`;
}

function missingPage() {
  return `${header()}<main id="main" class="missing" tabindex="-1"><p class="eyebrow">Page not found</p><h1 tabindex="-1">We could not find that page.</h1><p>Return home and start a route check.</p><a class="button" href="/">Go to Keyboard Route Check</a></main>${footer()}`;
}

function enterDemo() {
  localStorage.setItem(sampleKey, JSON.stringify(sampleReport));
  document.querySelector('#reset-demo')?.addEventListener('click', () => {
    localStorage.removeItem(sampleKey);
    localStorage.setItem(sampleKey, JSON.stringify(sampleReport));
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = 'Demo reset.'; });
  });
  document.querySelector('#start-real')?.addEventListener('click', () => localStorage.removeItem(sampleKey));
  document.querySelector('#export-sample')?.addEventListener('click', exportSample);
}

function exportSample() {
  const blob = new Blob([routeExport(sampleReport)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'sample-keyboard-route-report.json';
  link.click();
  URL.revokeObjectURL(link.href);
  live.textContent = 'Sample report download started.';
}

async function copyTransferToken() {
  const transferToken = sessionStorage.getItem(licenseTransferKey);
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

function render(moveFocus = false, hash = location.hash) {
  const route = routeName();
  setRouteMetadata(route);
  if (route === 'privacy') app.innerHTML = legalPage('privacy');
  else if (route === 'terms') app.innerHTML = legalPage('terms');
  else if (route === 'missing') app.innerHTML = missingPage();
  else if (route === 'demo') app.innerHTML = demoPage();
  else app.innerHTML = landing();

  if (route === 'demo') enterDemo();
  document.querySelector('#copy-license')?.addEventListener('click', () => void copyTransferToken());
  if (route === 'home') document.querySelector('#export-sample')?.addEventListener('click', exportSample);

  if (moveFocus) {
    const heading = document.querySelector<HTMLElement>('main h1');
    window.scrollTo(0, 0);
    heading?.focus({ preventScroll: true });
    live.textContent = '';
    requestAnimationFrame(() => {
      live.textContent = `Navigated to ${heading?.textContent?.trim() || document.title}`;
      if (hash) document.querySelector<HTMLElement>(hash)?.scrollIntoView();
    });
  }
}

document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
  if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin) return;
  if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
  event.preventDefault();
  history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
  render(true, url.hash);
});

window.addEventListener('popstate', () => render(true));
render();
