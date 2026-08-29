import { expect, test, chromium } from '@playwright/test';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { contrastRatio, parseCssColor } from '../../src/focus-indicator';

async function workerFor(context: import('@playwright/test').BrowserContext) {
  return context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
}

async function launchPackagedExtension() {
  const profile = await mkdtemp(resolve(tmpdir(), 'krc-playwright-'));
  const extensionPath = resolve('.output/chrome-mv3');
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    headless: true,
    downloadsPath: resolve(profile, 'downloads'),
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

test('@claim:route-data-local @claim:report-export records real extension data without values, private URL parts, or outgoing report requests', async () => {
  const { context, worker, extensionId } = await launchPackagedExtension();

  try {
    const requests: string[] = [];
    context.on('request', (request) => requests.push(request.url()));
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/fixtures/route-page.html?session_token=secret-query-value#private-fragment');
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

    const report = await worker.evaluate(async (id) => (await chrome.storage.session.get(`report:${id}`))[`report:${id}`], tabId) as { title: string; url: string; steps: Array<{ id: string; label: string; role: string }>; findings: Array<{ kind: string }> };
    expect(report.steps.map((step) => step.label)).toEqual(['License token', 'Verify license', 'Privacy', 'Terms']);
    expect(new Set(report.steps.map((step) => step.id)).size).toBe(4);
    expect(report.findings.filter((finding) => finding.kind === 'loop')).toEqual([]);
    expect(report.steps[0]).toMatchObject({ role: 'input' });
    expect(report.title).toBe('Page title not collected');
    expect(report.url).toBe('http://127.0.0.1:4173/fixtures/route-page.html');
    expect(JSON.stringify(report)).not.toContain('do-not-record-this-secret');
    expect(JSON.stringify(report)).not.toContain('secret-query-value');
    expect(JSON.stringify(report)).not.toContain('private-fragment');
    await popup.getByRole('button', { name: 'Export report' }).click();
    await expect.poll(async () => worker.evaluate(() => chrome.downloads.search({}))).toHaveLength(1);
    const downloads = await worker.evaluate(() => chrome.downloads.search({}));
    await expect.poll(async () => {
      try {
        return (await readFile(downloads[0].filename)).byteLength;
      } catch {
        return 0;
      }
    }).toBeGreaterThan(0);
    const downloaded = JSON.parse(await readFile(downloads[0].filename, 'utf8')) as typeof report;
    expect(downloaded.url).toBe('http://127.0.0.1:4173/fixtures/route-page.html');
    expect(JSON.stringify(downloaded)).not.toContain('do-not-record-this-secret');
    expect(JSON.stringify(downloaded)).not.toContain('secret-query-value');
    expect(requests.every((url) => {
      const parsed = new URL(url);
      return parsed.protocol === 'chrome-extension:' || parsed.origin === 'http://127.0.0.1:4173';
    })).toBeTruthy();
  } finally {
    await context.close();
  }
});

test('@claim:invisible-focus-reporting detects a transparent focus outline in a packed extension route report', async () => {
  const { context, worker, extensionId } = await launchPackagedExtension();
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/fixtures/invisible-focus-page.html');
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.getByRole('button', { name: 'Record this tab' }).click();
    await page.bringToFront();
    await page.keyboard.press('Tab');
    const tabId = await tabIdFor(worker, '/fixtures/invisible-focus-page.html');
    const report = await waitForStops(worker, tabId, 1) as { steps: Array<{ focusMark: boolean }>; findings: Array<{ kind: string; message: string }> };
    expect(report.steps[0].focusMark).toBe(false);
    expect(report.findings).toContainEqual(expect.objectContaining({ kind: 'invisible-focus', message: 'Invisible focus may not show a visible focus mark.' }));
  } finally {
    await context.close();
  }
});

test('does not report a visible background-color focus treatment as invisible', async () => {
  const { context, worker, extensionId } = await launchPackagedExtension();
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/fixtures/background-focus-page.html');
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.getByRole('button', { name: 'Record this tab' }).click();
    await page.bringToFront();
    await page.keyboard.press('Tab');
    const tabId = await tabIdFor(worker, '/fixtures/background-focus-page.html');
    const report = await waitForStops(worker, tabId, 1) as { steps: Array<{ focusMark: boolean }>; findings: Array<{ kind: string }> };
    expect(report.steps[0].focusMark).toBe(true);
    expect(report.findings.filter((finding) => finding.kind === 'invisible-focus')).toEqual([]);
  } finally {
    await context.close();
  }
});

test('records an implicit label and its visible wrapper focus-within treatment', async () => {
  const { context, worker, extensionId } = await launchPackagedExtension();
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/fixtures/implicit-label-focus-page.html');
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.getByRole('button', { name: 'Record this tab' }).click();
    await page.bringToFront();
    await page.keyboard.press('Tab');
    const tabId = await tabIdFor(worker, '/fixtures/implicit-label-focus-page.html');
    const report = await waitForStops(worker, tabId, 1) as {
      steps: Array<{ label: string; role: string; focusMark: boolean }>;
      findings: Array<{ kind: string }>;
    };
    expect(report.steps[0]).toMatchObject({ label: 'Work email', role: 'input', focusMark: true });
    expect(report.findings.filter((finding) => finding.kind === 'invisible-focus')).toEqual([]);
    expect(JSON.stringify(report)).not.toContain('do-not-record-secret');
  } finally {
    await context.close();
  }
});

test('packed popup keyboard focus has a three-to-one focus ring on each reported paper control', async () => {
  const { context, worker, extensionId } = await launchPackagedExtension();
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/fixtures/route-page.html');
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.getByRole('button', { name: 'Record this tab' }).click();
    await page.bringToFront();
    await page.focus('#license');
    const tabId = await tabIdFor(worker, '/fixtures/route-page.html');
    await waitForStops(worker, tabId, 1);
    for (const name of ['Local archive license', 'Clear route']) {
      const control = popup.getByRole('button', { name });
      await control.focus();
      await popup.keyboard.press('Tab');
      await popup.keyboard.press('Shift+Tab');
      const focus = await control.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          focusVisible: element.matches(':focus-visible'),
          outlineColor: style.outlineColor,
          outlineWidth: style.outlineWidth,
          paper: getComputedStyle(document.documentElement).backgroundColor
        };
      });
      expect(focus.focusVisible, `${name} should receive keyboard focus`).toBe(true);
      expect(focus.outlineWidth, `${name} should have a 3px focus ring`).toBe('3px');
      const outline = parseCssColor(focus.outlineColor)!;
      const paper = parseCssColor(focus.paper)!;
      expect(contrastRatio(outline, paper), `${name} focus ring contrast`).toBeGreaterThanOrEqual(3);
    }
  } finally {
    await context.close();
  }
});

test('@claim:team-archive-local @claim:license-transfer-handoff @claim:license-check-destination exposes a checkout-return token and unlocks the extension after paste-and-verify', async () => {
  const { context, worker, extensionId } = await launchPackagedExtension();
  try {
    const requests: string[] = [];
    context.on('request', (request) => requests.push(request.url()));
    const returnPage = await context.newPage();
    await returnPage.goto('http://127.0.0.1:4173/?license=verification-transfer-token');
    await expect(returnPage).toHaveURL('http://127.0.0.1:4173/');
    await expect(returnPage.getByRole('heading', { name: 'Move your license to the extension' })).toBeVisible();
    await expect(returnPage.getByLabel('Returned license token')).toHaveValue('verification-transfer-token');
    await expect(returnPage.getByText('Copy it, open the extension, choose Local archive license, paste it, and verify it.')).toBeVisible();
    await returnPage.close();

    await context.route(/https:\/\/api\.sociobot\.in\/api\/v1\/products\/keyboard-route-check\/verify\?license=/, async (route) => {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/fixtures/route-page.html');
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.getByRole('button', { name: 'Record this tab' }).click();
    await page.bringToFront();
    await page.focus('#license');
    const tabId = await tabIdFor(worker, '/fixtures/route-page.html');
    await waitForStops(worker, tabId, 1);
    await popup.getByRole('button', { name: 'Local archive license' }).click();
    await popup.getByLabel('Paste local archive license').fill('verification-transfer-token');
    await popup.getByRole('button', { name: 'Verify license' }).click();
    await expect(popup.getByRole('button', { name: /Save to local archive/ })).toBeVisible();
    expect(await worker.evaluate(async () => (await chrome.storage.local.get('sb_license:keyboard-route-check'))['sb_license:keyboard-route-check'])).toBe('verification-transfer-token');
    await popup.getByRole('button', { name: /Save to local archive/ }).click();
    const archive = await worker.evaluate(async () => (await chrome.storage.local.get('krc:team-archive'))['krc:team-archive']) as unknown[];
    expect(archive).toHaveLength(1);
    expect(requests.filter((url) => url.startsWith('https://api.sociobot.in/'))).toHaveLength(1);
    expect(requests.some((url) => /sync|share|archive/.test(new URL(url).pathname))).toBe(false);
    expect(requests.every((url) => {
      const parsed = new URL(url);
      return parsed.protocol === 'chrome-extension:' || parsed.origin === 'http://127.0.0.1:4173' || parsed.origin === 'https://api.sociobot.in';
    })).toBe(true);
  } finally {
    await context.close();
  }
});

test('keeps a proven archive verdict while offline and announces invalid or missing license input', async () => {
  const { context, worker, extensionId } = await launchPackagedExtension();
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/fixtures/route-page.html');
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.getByRole('button', { name: 'Record this tab' }).click();
    await page.bringToFront();
    await page.focus('#license');
    const tabId = await tabIdFor(worker, '/fixtures/route-page.html');
    await waitForStops(worker, tabId, 1);

    await popup.getByRole('button', { name: 'Local archive license' }).click();
    await popup.getByRole('button', { name: 'Verify license' }).click();
    await expect(popup.getByRole('alert')).toHaveText('Paste your license token first.');
    await context.route(/https:\/\/api\.sociobot\.in\/api\/v1\/products\/keyboard-route-check\/verify\?license=/, async (route) => {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'invalid' }) });
    });
    await popup.getByLabel('Paste local archive license').fill('not-a-license');
    await popup.getByRole('button', { name: 'Verify license' }).click();
    await expect(popup.getByRole('alert')).toHaveText('This license is not active. Check the token and try again.');
    await expect(popup.getByLabel('Paste local archive license')).toBeVisible();

    await context.unrouteAll();
    await worker.evaluate(() => chrome.storage.local.set({
      'sb_license:keyboard-route-check': 'known-good-token',
      'sb_license_verdict:keyboard-route-check': { valid: true, checkedAt: Date.now() - 86_400_001 }
    }));
    await context.setOffline(true);
    await popup.reload();
    await expect(popup.getByRole('button', { name: /Save to local archive/ })).toBeVisible();
    await expect.poll(async () => worker.evaluate(async () => (await chrome.storage.local.get('sb_license_verdict:keyboard-route-check'))['sb_license_verdict:keyboard-route-check'])).toMatchObject({ valid: true });
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
