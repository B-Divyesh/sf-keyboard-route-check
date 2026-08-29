import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.KRC_LIVE_URL || 'https://keyboard-route-check.sociobot.in';
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
  assert.equal(await page.getByRole('heading', { name: 'Install in desktop Chrome or Chromium' }).count(), 1);
  assert.equal(await page.locator('.install').getByText('Load unpacked').count(), 1);
  assert.equal(await page.getByRole('heading', { name: 'Local report archive for existing licenses' }).count(), 1);
  assert.equal(await page.getByText('It does not sync or share them with teammates.').count(), 1);
  assert.equal(await page.getByRole('link', { name: 'Built by Param Factory (external site)' }).count(), 1);
  await assertNoSeriousAxe(page);
  await page.locator('footer').screenshot({ path: '.factory/evidence/polish-2-live-footer.png' });

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

  await page.getByRole('link', { name: 'Demo', exact: true }).click();
  assert.equal(await page.locator('h1').evaluate((heading) => heading === document.activeElement), true);
  await page.waitForFunction(() => document.querySelector('.sr-only[aria-live="polite"]')?.textContent?.startsWith('Navigated to'));
  assert.equal(await page.locator('.sr-only[aria-live="polite"]').innerText(), 'Navigated to Review a keyboard route.');
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `${base}/demo`);
  await page.screenshot({ path: '.factory/evidence/polish-2-live-route-focus.png', fullPage: false });
  await page.goBack();
  assert.equal(await page.locator('h1').evaluate((heading) => heading === document.activeElement), true);
  await page.waitForFunction(() => document.querySelector('.sr-only[aria-live="polite"]')?.textContent === 'Navigated to Record the route your keyboard takes.');
  assert.equal(await page.locator('.sr-only[aria-live="polite"]').innerText(), 'Navigated to Record the route your keyboard takes.');

  for (const [route, title, canonical] of [
    ['/privacy', 'Privacy — Keyboard Route Check', `${base}/privacy`],
    ['/terms', 'Terms — Keyboard Route Check', `${base}/terms`],
    ['/404', 'Page not found — Keyboard Route Check', `${base}/404`]
  ]) {
    await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    assert.equal(await page.title(), title);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), canonical);
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
  await mobilePage.screenshot({ path: '.factory/evidence/polish-2-live-home-mobile.png', fullPage: false });
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
