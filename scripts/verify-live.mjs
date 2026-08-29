import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.KRC_LIVE_URL || 'https://keyboard-route-check.sociobot.in';
const canonicalBase = 'https://keyboard-route-check.sociobot.in';
const evidenceDir = process.env.KRC_EVIDENCE_DIR || '.factory/evidence/live';
await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const consoleErrors = [];
const requests = [];

async function assertNoSeriousAxe(page) {
  const axe = await new AxeBuilder({ page }).analyze();
  assert.deepEqual(axe.violations.filter((item) => ['serious', 'critical'].includes(item.impact || '')), []);
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));

  await page.goto(`${base}/?cold=${Date.now()}`, { waitUntil: 'networkidle' });
  assert.equal(await page.title(), 'Keyboard Route Check — Record a keyboard route');
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('main').count(), 1);
  assert.match(await page.getByRole('heading', { level: 1 }).innerText(), /Record the route/);
  assert.equal(await page.getByText('Free report export; no account').count(), 1);
  assert.equal(await page.getByText('Route data stays in this browser').count(), 1);
  assert.equal(await page.getByText('Recording works offline; license checks need a connection').count(), 1);
  assert.equal(await page.getByRole('link', { name: 'Download desktop Chrome extension ZIP' }).count(), 1);
  assert.equal(await page.getByRole('heading', { name: 'Install in desktop Chrome or Chromium' }).count(), 1);
  assert.equal(await page.locator('.install').getByText('Load unpacked').count(), 1);
  assert.equal(await page.getByRole('heading', { name: 'Local report archive for existing licenses' }).count(), 1);
  assert.equal(await page.getByText('It does not sync or share them with teammates.').count(), 1);
  assert.equal(await page.getByRole('link', { name: 'Built by Param Factory (external site)' }).count(), 1);
  await assertNoSeriousAxe(page);
  await page.locator('footer').screenshot({ path: `${evidenceDir}/footer.png` });

  await page.keyboard.press('Tab');
  assert.equal(await page.getByRole('link', { name: 'Skip to content' }).evaluate((link) => link === document.activeElement), true);
  await page.keyboard.press('Enter');
  assert.equal(new URL(page.url()).hash, '#main');
  assert.equal(await page.locator('main#main').evaluate((main) => main === document.activeElement), true);
  assert.deepEqual(await page.locator('main#main').evaluate((main) => {
    const style = getComputedStyle(main);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  }), { outlineStyle: 'solid', outlineWidth: '3px' });
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').evaluate((element) => element.closest('main')?.id), 'main');
  await page.screenshot({ path: `${evidenceDir}/skip-link-focus.png`, fullPage: false });

  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  assert.match(page.url(), /\?demo=1$/);
  assert.match(await page.getByLabel('Demo controls').innerText(), /nothing is saved to your real data/);
  assert.equal(await page.locator('.route-list li').count(), 5);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), ['demo:krc:sample-report']);
  await assertNoSeriousAxe(page);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), ['demo:krc:sample-report']);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export sample report' }).click();
  assert.equal((await downloadPromise).suggestedFilename(), 'sample-keyboard-route-report.json');
  await page.getByRole('link', { name: 'Start for real' }).click();
  assert.equal(new URL(page.url()).pathname, '/');
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);

  await page.goto(`${base}/?demo=1&license=adversarial-sentinel`, { waitUntil: 'networkidle' });
  assert.match(page.url(), /\?demo=1$/);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), ['demo:krc:sample-report']);
  assert.deepEqual(await page.evaluate(() => Object.keys(sessionStorage)), []);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), ['demo:krc:sample-report']);
  assert.deepEqual(await page.evaluate(() => Object.keys(sessionStorage)), []);
  await page.getByRole('link', { name: 'Start for real' }).click();
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  assert.deepEqual(await page.evaluate(() => Object.keys(sessionStorage)), []);
  assert.equal(await page.getByRole('heading', { name: 'Move your license to the extension' }).count(), 0);

  await page.goto(`${base}/?license=session-only-live-token`, { waitUntil: 'networkidle' });
  assert.equal(new URL(page.url()).pathname, '/');
  assert.equal(new URL(page.url()).search, '');
  assert.equal(await page.evaluate(() => localStorage.getItem('sb_license:keyboard-route-check')), null);
  assert.equal(await page.evaluate(() => sessionStorage.getItem('krc:license-transfer')), 'session-only-live-token');
  assert.equal(await page.getByLabel('Returned license token').inputValue(), 'session-only-live-token');
  const otherTab = await context.newPage();
  await otherTab.goto(`${base}/`, { waitUntil: 'networkidle' });
  assert.equal(await otherTab.evaluate(() => sessionStorage.getItem('krc:license-transfer')), null);
  await otherTab.close();

  await page.getByRole('link', { name: 'Demo', exact: true }).click();
  assert.equal(await page.locator('h1').evaluate((heading) => heading === document.activeElement), true);
  await page.waitForFunction(() => document.querySelector('.sr-only[aria-live="polite"]')?.textContent?.startsWith('Navigated to'));
  assert.equal(await page.locator('.sr-only[aria-live="polite"]').innerText(), 'Navigated to Review a keyboard route.');
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `${canonicalBase}/demo`);
  await page.screenshot({ path: `${evidenceDir}/route-focus.png`, fullPage: false });
  await page.goBack();
  assert.equal(await page.locator('h1').evaluate((heading) => heading === document.activeElement), true);
  await page.waitForFunction(() => document.querySelector('.sr-only[aria-live="polite"]')?.textContent === 'Navigated to Record the route your keyboard takes.');
  assert.equal(await page.locator('.sr-only[aria-live="polite"]').innerText(), 'Navigated to Record the route your keyboard takes.');

  for (const [route, title, canonical] of [
    ['/privacy', 'Privacy — Keyboard Route Check', `${canonicalBase}/privacy`],
    ['/terms', 'Terms — Keyboard Route Check', `${canonicalBase}/terms`],
    ['/404', 'Page not found — Keyboard Route Check', `${canonicalBase}/404`]
  ]) {
    await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    assert.equal(await page.title(), title);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), canonical);
    if (route === '/privacy') {
      assert.equal(await page.getByText('The website keeps a returned checkout token in this tab until the tab closes, so you can copy it into the extension.').count(), 1);
      assert.equal((await page.locator('body').innerText()).toLowerCase().includes('companion site'), false);
    }
    await assertNoSeriousAxe(page);
  }
  assert.equal((await context.request.get(`${base}/not-a-real-route-${Date.now()}`)).status(), 404);
  assert.deepEqual(consoleErrors, []);
  assert.equal(requests.every((url) => new URL(url).origin === new URL(base).origin), true);
  await context.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(`${base}/?cold=${Date.now()}`, { waitUntil: 'networkidle' });
  for (const selector of ['h1', '.lede', '.hero-actions', '.facts']) {
    const box = await mobilePage.locator(selector).boundingBox();
    assert.ok(box && box.y + box.height <= 844, `${selector} must fit in the first viewport`);
  }
  assert.equal(await mobilePage.evaluate(() => document.documentElement.scrollWidth), 390);
  const mobileDownload = await mobilePage.getByRole('link', { name: 'Download desktop Chrome extension ZIP' }).boundingBox();
  assert.ok(mobileDownload && mobileDownload.y + mobileDownload.height <= 844, 'desktop-only download must fit in the first mobile viewport');
  await mobilePage.screenshot({ path: `${evidenceDir}/home-mobile.png`, fullPage: false });
  await mobilePage.getByRole('link', { name: 'Try it with sample data' }).click();
  await mobile.setOffline(true);
  const offlineDownload = mobilePage.waitForEvent('download');
  await mobilePage.getByRole('button', { name: 'Export sample report' }).click();
  assert.equal((await offlineDownload).suggestedFilename(), 'sample-keyboard-route-report.json');
  await mobile.close();

  console.log(JSON.stringify({ base, consoleErrors, routes: 5, mobile: true, demo: true, offlineExport: true }));
} finally {
  await browser.close();
}
