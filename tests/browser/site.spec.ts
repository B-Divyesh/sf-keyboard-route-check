import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function exportedSample(page: import('@playwright/test').Page) {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export sample report' }).click();
  const download = await downloadPromise;
  return JSON.parse(await readFile(await download.path()!, 'utf8'));
}

test('demo export contains labels and roles, never form values or external requests', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo');
  const report = await exportedSample(page);

  expect(report.steps[0]).toMatchObject({ label: 'Open menu', role: 'button' });
  expect(JSON.stringify(report)).not.toContain('do-not-record-this-secret');
  expect(JSON.stringify(report)).not.toMatch(/"value"\s*:/);
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBeTruthy();
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['demo:krc:sample-report']);
});

test('demo exports a route report with labels, roles, order, and findings', async ({ page }) => {
  await page.goto('/demo');
  const report = await exportedSample(page);

  expect(report.steps.map((step: { label: string }) => step.label)).toEqual([
    'Open menu', 'Choose a date', 'Next month', 'Choose a date', 'Book appointment'
  ]);
  expect(report.steps[2]).toMatchObject({ role: 'button', focusMark: false });
  expect(report.findings.map((finding: { kind: string }) => finding.kind)).toContain('invisible-focus');
});

test('@claim:demo-isolated stores only sample data separately, resets it, and discards it on exit', async ({ page }) => {
  await page.goto('/demo');
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['demo:krc:sample-report']);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByLabel('Demo controls')).toContainText('sample data, nothing is saved to your real data');
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['demo:krc:sample-report']);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});

test('@claim:free-report-export downloads the sample report without an account', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  const report = await exportedSample(page);
  expect(report.title).toBe('Sample booking page');
});

test('@claim:team-archive-unavailable states the archive purchase status and does not show a dead checkout', async ({ page }) => {
  for (const route of ['/', '/terms']) {
    await page.goto(route);
    await expect(page.getByText('New team archive purchases are temporarily unavailable.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Buy team archive' })).toHaveCount(0);
  }
});

test('serves a styled unknown route with a real 404 status', async ({ page, request }) => {
  const response = await request.get('/no-such-route');
  expect(response.status()).toBe(404);
  await page.goto('/no-such-route');
  await expect(page).toHaveTitle('Page not found — Keyboard Route Check');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('That page is not on this tape.');
});

test('all landing and demo controls meet the 44px touch target baseline at 390px', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  for (const route of ['/', '/demo']) {
    await page.goto(route);
    const undersized = await page.locator('a, button, input').evaluateAll((controls) => controls
      .filter((control) => {
        const style = getComputedStyle(control);
        const box = control.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && (box.width < 44 || box.height < 44);
      })
      .map((control) => ({ text: (control.textContent || (control as HTMLInputElement).value || '').trim(), box: control.getBoundingClientRect().toJSON() })));
    expect(undersized, `${route} has undersized touch controls`).toEqual([]);
  }
  await context.close();
});

test('landing and demo have no serious or critical axe accessibility violations at desktop and 390px', async ({ browser }) => {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    for (const route of ['/', '/demo', '/privacy', '/terms']) {
      await page.goto(route);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || '')),
        `${route} axe violations at ${viewport.width}px`).toEqual([]);
    }
    await context.close();
  }
});

test('demo remains usable after its first load goes offline and respects reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/demo');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('href', '#main');
  expect(await page.locator('.report').evaluate((report) => getComputedStyle(report).transitionDuration)).toBe('0s');
  await context.setOffline(true);
  const report = await exportedSample(page);
  expect(report.title).toBe('Sample booking page');
  expect(errors).toEqual([]);
  await context.close();
});

test('static deployment policy preserves known routes and sends unknown routes to 404', async () => {
  const config = JSON.parse(await readFile('public/staticwebapp.config.json', 'utf8')) as {
    navigationFallback?: unknown;
    responseOverrides: Record<string, { rewrite: string; statusCode: number }>;
    globalHeaders: Record<string, string>;
  };
  expect(config.navigationFallback).toBeUndefined();
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
  expect(config.globalHeaders['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
});
