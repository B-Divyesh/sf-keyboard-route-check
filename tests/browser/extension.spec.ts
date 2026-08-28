import { expect, test, chromium } from '@playwright/test';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

async function workerFor(context: import('@playwright/test').BrowserContext) {
  return context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
}

test('@claim:team-archive-local records unique generic controls without a false loop and saves the optional archive locally', async () => {
  const profile = await mkdtemp(resolve(tmpdir(), 'krc-playwright-'));
  const extensionPath = resolve('.output/chrome-mv3');
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });

  try {
    const worker = await workerFor(context);
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/fixtures/route-page.html');
    await page.reload();
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(popup.getByRole('button', { name: 'Record this tab' })).toBeVisible();
    await popup.getByRole('button', { name: 'Record this tab' }).click();
    await page.bringToFront();
    const tabId = await worker.evaluate(async () => {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      return tabs.find((tab) => tab.url?.includes('/fixtures/route-page.html'))?.id;
    });
    expect(tabId).toBeTruthy();
    await page.focus('#license');
    await page.getByRole('button', { name: 'Verify license' }).focus();
    await page.getByRole('link', { name: 'Privacy' }).focus();
    await page.getByRole('link', { name: 'Terms' }).focus();
    await page.waitForTimeout(200);
    await worker.evaluate(async (id) => chrome.storage.session.set({ [`active:${id}`]: false }), tabId!);

    const report = await worker.evaluate(async (id) => (await chrome.storage.session.get(`report:${id}`))[`report:${id}`], tabId!) as { steps: Array<{ id: string; label: string }>; findings: Array<{ kind: string }> };
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
