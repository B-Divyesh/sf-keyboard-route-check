import { expect, test, chromium } from '@playwright/test';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

async function workerFor(context: import('@playwright/test').BrowserContext) {
  return context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
}

async function launchPackagedExtension() {
  const profile = await mkdtemp(resolve(tmpdir(), 'krc-playwright-'));
  const extensionPath = resolve('.output/chrome-mv3');
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  const worker = await workerFor(context);
  return { context, worker, extensionId: new URL(worker.url()).host };
}

async function tabIdFor(worker: import('@playwright/test').Worker, path: string) {
  const tabId = await worker.evaluate(async (fixturePath) => {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    return tabs.find((tab) => tab.url?.includes(fixturePath))?.id;
  }, path);
  expect(tabId).toBeTruthy();
  return tabId!;
}

async function waitForStops(worker: import('@playwright/test').Worker, tabId: number, count: number) {
  await expect.poll(async () => worker.evaluate(async (id) => {
    const report = (await chrome.storage.session.get(`report:${id}`))[`report:${id}`] as { steps?: unknown[] } | undefined;
    return report?.steps?.length || 0;
  }, tabId)).toBe(count);
  return worker.evaluate(async (id) => (await chrome.storage.session.get(`report:${id}`))[`report:${id}`], tabId);
}

test('@claim:team-archive-local records unique generic controls without a false loop and saves the optional archive locally', async () => {
  const { context, worker, extensionId } = await launchPackagedExtension();

  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/fixtures/route-page.html');
    await page.reload();
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(popup.getByRole('button', { name: 'Record this tab' })).toBeVisible();
    await popup.getByRole('button', { name: 'Record this tab' }).click();
    await page.bringToFront();
    const tabId = await tabIdFor(worker, '/fixtures/route-page.html');
    await page.focus('#license');
    await page.getByRole('button', { name: 'Verify license' }).focus();
    await page.getByRole('link', { name: 'Privacy' }).focus();
    await page.getByRole('link', { name: 'Terms' }).focus();
    await page.waitForTimeout(200);
    await worker.evaluate(async (id) => chrome.storage.session.set({ [`active:${id}`]: false }), tabId);

    const report = await worker.evaluate(async (id) => (await chrome.storage.session.get(`report:${id}`))[`report:${id}`], tabId) as { steps: Array<{ id: string; label: string }>; findings: Array<{ kind: string }> };
    expect(report.steps.map((step) => step.label)).toEqual(['License token', 'Verify license', 'Privacy', 'Terms']);
    expect(new Set(report.steps.map((step) => step.id)).size).toBe(4);
    expect(report.findings.filter((finding) => finding.kind === 'loop')).toEqual([]);
    expect(JSON.stringify(report)).not.toContain('do-not-record-this-secret');

    await worker.evaluate(() => chrome.storage.local.set({ 'sb_license_verdict:keyboard-route-check': { valid: true, checkedAt: Date.now() } }));
    await popup.reload();
    await expect(popup.getByRole('button', { name: /Save to team archive/ })).toBeVisible();
    await popup.getByRole('button', { name: /Save to team archive/ }).click();
    const archive = await worker.evaluate(async () => (await chrome.storage.local.get('krc:team-archive'))['krc:team-archive']) as unknown[];
    expect(archive).toHaveLength(1);
  } finally {
    await context.close();
  }
});

test('@claim:focus-cycle-reporting records a forward two-control Tab cycle as loop evidence', async () => {
  const { context, worker, extensionId } = await launchPackagedExtension();
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/fixtures/cycle-page.html');
    await page.reload();
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.getByRole('button', { name: 'Record this tab' }).click();
    await page.bringToFront();
    for (let index = 0; index < 5; index += 1) await page.keyboard.press('Tab');
    const tabId = await tabIdFor(worker, '/fixtures/cycle-page.html');
    const report = await waitForStops(worker, tabId, 5) as { steps: Array<{ label: string }>; findings: Array<{ kind: string; message: string }> };
    expect(report.steps.map((step) => step.label)).toEqual(['Alpha', 'Beta', 'Alpha', 'Beta', 'Alpha']);
    expect(report.findings).toContainEqual(expect.objectContaining({ kind: 'loop', message: 'Focus returned to Alpha in the same Tab direction.' }));
  } finally {
    await context.close();
  }
});

test('@claim:browser-tab-order records valid positive tabindex order without false skips', async () => {
  const { context, worker, extensionId } = await launchPackagedExtension();
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/fixtures/positive-tabindex-page.html');
    await page.reload();
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.getByRole('button', { name: 'Record this tab' }).click();
    await page.bringToFront();
    for (let index = 0; index < 3; index += 1) await page.keyboard.press('Tab');
    const tabId = await tabIdFor(worker, '/fixtures/positive-tabindex-page.html');
    const report = await waitForStops(worker, tabId, 3) as { steps: Array<{ label: string }>; findings: Array<{ kind: string }> };
    expect(report.steps.map((step) => step.label)).toEqual(['Beta', 'Alpha', 'Gamma']);
    expect(report.findings.filter((finding) => finding.kind === 'skip')).toEqual([]);
  } finally {
    await context.close();
  }
});

test('@claim:popup-label-safety renders markup-like page labels as text, never popup controls', async () => {
  const { context, worker, extensionId } = await launchPackagedExtension();
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/fixtures/markup-label-page.html');
    await page.reload();
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.getByRole('button', { name: 'Record this tab' }).click();
    await page.bringToFront();
    await page.focus('#unsafe');
    const tabId = await tabIdFor(worker, '/fixtures/markup-label-page.html');
    await waitForStops(worker, tabId, 1);
    await expect(popup.locator('#injected-control')).toHaveCount(0);
    await expect(popup.getByText('</span><button id="injected-control">Fake export</button><span>')).toBeVisible();
  } finally {
    await context.close();
  }
});
