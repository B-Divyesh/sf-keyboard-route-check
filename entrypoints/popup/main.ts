import { routeExport } from '../../src/route';
import { escapeHtml } from '../../src/html';
import type { RouteReport } from '../../src/types';
import './style.css';

const app = document.querySelector<HTMLElement>('#app')!;
let tabId = 0;
let report: RouteReport | undefined;
let recording = false;
let licensed = false;
let archiveCount = 0;
const reportKey = () => `report:${tabId}`;
const activeKey = () => `active:${tabId}`;
const licenseKey = 'sb_license:keyboard-route-check';
const verdictKey = 'sb_license_verdict:keyboard-route-check';
const archiveKey = 'krc:team-archive';

async function refresh() {
  const data = await chrome.storage.session.get([reportKey(), activeKey()]);
  const persistent = await chrome.storage.local.get([verdictKey, archiveKey]);
  report = data[reportKey()] as RouteReport | undefined;
  recording = Boolean(data[activeKey()]);
  licensed = Boolean((persistent[verdictKey] as { valid?: boolean } | undefined)?.valid);
  archiveCount = ((persistent[archiveKey] as RouteReport[] | undefined) || []).length;
  render();
}

async function tell(type: 'KRC_START' | 'KRC_STOP' | 'KRC_CLEAR') {
  await chrome.tabs.sendMessage(tabId, { type }).catch(() => undefined);
  await chrome.runtime.sendMessage({ type, tabId });
  await refresh();
}

function download() {
  if (!report) return;
  const blob = new Blob([routeExport(report)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  chrome.downloads?.download ? chrome.downloads.download({ url, filename: 'keyboard-route-report.json', saveAs: true }) : Object.assign(document.createElement('a'), { href: url, download: 'keyboard-route-report.json' }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function verifyLicense(token: string) {
  const clean = token.trim();
  if (!clean) return;
  await chrome.storage.local.set({ [licenseKey]: clean });
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/keyboard-route-check/verify?license=${encodeURIComponent(clean)}`);
    const verdict = await response.json() as { valid: boolean; reason?: string; expires_at?: string };
    await chrome.storage.local.set({ [verdictKey]: { ...verdict, checkedAt: Date.now() } });
  } catch { await chrome.storage.local.set({ [verdictKey]: { valid: false, reason: 'offline', checkedAt: Date.now() } }); }
  await refresh();
}

async function saveArchive() {
  if (!report || !licensed) return;
  const data = await chrome.storage.local.get(archiveKey);
  const archive = (data[archiveKey] as RouteReport[] | undefined) || [];
  await chrome.storage.local.set({ [archiveKey]: [{ ...report, endedAt: report.endedAt ?? Date.now() }, ...archive].slice(0, 100) });
  await refresh();
}

function render() {
  const current = report;
  const findings = current?.findings || [];
  app.innerHTML = `<a class="skip" href="#route">Skip to route</a><header><span class="mark">KRC</span><span>ROUTE RECORDER</span></header>
  <section class="tape"><p class="status">${recording ? '● Recording this tab' : report ? '■ Route paused' : '○ Ready to record'}</p><h1>${recording ? 'Tab through the page.' : 'Make the keyboard route visible.'}</h1><p>${recording ? 'Keep this panel open or return when you finish.' : 'Start, use Tab and Shift+Tab, then export the evidence.'}</p><button id="record">${recording ? 'Stop recording' : 'Record this tab'}</button></section>
  <section id="route" aria-live="polite"><div class="summary"><strong>${current?.steps.length || 0} stops</strong><strong>${findings.length} findings</strong></div>${current ? `<ol>${current.steps.slice(-6).map((step, i) => `<li><b>${current.steps.length - Math.min(current.steps.length, 6) + i + 1}</b><span>${escapeHtml(step.label)}<small>${escapeHtml(step.role)} · ${escapeHtml(step.direction)}</small></span></li>`).join('')}</ol><div class="findings">${findings.slice(-3).map((finding) => `<p><b>${escapeHtml(finding.kind.replace('-', ' '))}</b> ${escapeHtml(finding.message)}</p>`).join('') || '<p>No route findings yet.</p>'}</div><div class="actions"><button id="export">Export report</button>${licensed ? `<button id="archive">Save to team archive (${archiveCount})</button>` : '<button class="quiet" id="license-toggle">Team archive license</button>'}<button class="quiet" id="clear">Clear route</button></div><form class="license hidden" id="license-form"><label for="license">Paste team archive license</label><input id="license" autocomplete="off" /><button>Verify license</button></form>` : '<p class="empty">Your focused controls and any route warnings will appear here.</p>'}</section><footer>Labels and roles only. Form values are never recorded.</footer>`;
  document.querySelector<HTMLButtonElement>('#record')!.onclick = () => void tell(recording ? 'KRC_STOP' : 'KRC_START');
  document.querySelector<HTMLButtonElement>('#clear')?.addEventListener('click', () => void tell('KRC_CLEAR'));
  document.querySelector<HTMLButtonElement>('#export')?.addEventListener('click', download);
  document.querySelector<HTMLButtonElement>('#archive')?.addEventListener('click', () => void saveArchive());
  document.querySelector<HTMLButtonElement>('#license-toggle')?.addEventListener('click', () => document.querySelector('#license-form')?.classList.toggle('hidden'));
  document.querySelector<HTMLFormElement>('#license-form')?.addEventListener('submit', (event) => { event.preventDefault(); void verifyLicense((document.querySelector('#license') as HTMLInputElement).value); });
}

void (async () => {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const tab = tabs.find((candidate) => candidate.active && candidate.url?.startsWith('http')) || tabs.find((candidate) => candidate.url?.startsWith('http'));
  if (!tab || !tab.id || !tab.url?.startsWith('http')) { app.textContent = 'Open a web page, then use Keyboard Route Check.'; return; }
  tabId = tab.id;
  chrome.storage.onChanged.addListener((_changes, area) => { if (area === 'session' || area === 'local') void refresh(); });
  const saved = await chrome.storage.local.get([licenseKey, verdictKey]);
  const cached = saved[verdictKey] as { checkedAt?: number } | undefined;
  if (saved[licenseKey] && (!cached?.checkedAt || Date.now() - cached.checkedAt > 86_400_000)) void verifyLicense(saved[licenseKey] as string);
  await refresh();
})();
