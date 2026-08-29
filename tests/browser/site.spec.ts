import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { contrastRatio, parseCssColor } from '../../src/focus-indicator';

const execFile = promisify(execFileCallback);

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

test('@claim:demo-isolated keeps a combined checkout return out of real storage, resets sample data, and discards it on exit', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/?demo=1&license=adversarial-sentinel');
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.getByLabel('Demo controls')).toContainText('sample data, nothing is saved to your real data');
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['demo:krc:sample-report']);
  expect(await page.evaluate(() => Object.keys(sessionStorage))).toEqual([]);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByLabel('Demo controls')).toContainText('sample data, nothing is saved to your real data');
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['demo:krc:sample-report']);
  expect(await page.evaluate(() => Object.keys(sessionStorage))).toEqual([]);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  expect(await page.evaluate(() => Object.keys(sessionStorage))).toEqual([]);
  await expect(page.getByRole('heading', { name: 'Move your license to the extension' })).toHaveCount(0);
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:checkout-token-session-only keeps a checkout return in its tab, never localStorage, and clears it for a fresh browser session', async ({ browser }) => {
  const context = await browser.newContext();
  const returnPage = await context.newPage();
  await returnPage.goto('/?license=session-only-token');
  await expect(returnPage).toHaveURL(/\/$/);
  await expect(returnPage.getByLabel('Returned license token')).toHaveValue('session-only-token');
  expect(await returnPage.evaluate(() => localStorage.getItem('sb_license:keyboard-route-check'))).toBeNull();
  expect(await returnPage.evaluate(() => sessionStorage.getItem('krc:license-transfer'))).toBe('session-only-token');

  const otherTab = await context.newPage();
  await otherTab.goto('/');
  expect(await otherTab.evaluate(() => sessionStorage.getItem('krc:license-transfer'))).toBeNull();
  await context.close();

  const freshContext = await browser.newContext();
  const freshPage = await freshContext.newPage();
  await freshPage.goto('/');
  expect(await freshPage.evaluate(() => sessionStorage.getItem('krc:license-transfer'))).toBeNull();
  await expect(freshPage.getByRole('heading', { name: 'Move your license to the extension' })).toHaveCount(0);
  await freshContext.close();
});

test('@claim:free-report-export downloads the sample report without an account', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  const report = await exportedSample(page);
  expect(report.title).toBe('Sample booking page');
});

test('the landing page explains desktop installation and downloads an unpacked extension ZIP', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Download desktop Chrome extension ZIP' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Install in desktop Chrome or Chromium' })).toBeVisible();
  await expect(page.locator('.install')).toContainText('Extract the ZIP to a folder.');
  await expect(page.locator('.install')).toContainText('chrome://extensions');
  await expect(page.locator('.install')).toContainText('Load unpacked');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download desktop Chrome extension ZIP' }).click();
  const download = await downloadPromise;
  const { stdout } = await execFile('unzip', ['-Z1', await download.path()!]);
  expect(stdout.split(/\r?\n/)).toContain('manifest.json');
});

test('@claim:team-archive-unavailable states the local archive purchase status and does not show a dead checkout', async ({ page }) => {
  for (const route of ['/', '/terms']) {
    await page.goto(route);
    await expect(page.getByText('New local archive purchases are temporarily unavailable.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Buy local archive' })).toHaveCount(0);
  }
});

test('serves a styled unknown route with a real 404 status', async ({ page, request }) => {
  const response = await request.get('/no-such-route');
  expect(response.status()).toBe(404);
  await page.goto('/no-such-route');
  await expect(page).toHaveTitle('Page not found — Keyboard Route Check');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('We could not find that page.');
});

test('header routes and Back focus and announce each destination heading', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Demo', exact: true }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('[aria-live="polite"]').first()).toHaveText('Navigated to Review a keyboard route.');
  await page.screenshot({ path: '.factory/evidence/polish-4-route-focus.png', fullPage: false });
  await expect(page).toHaveTitle('Demo — Keyboard Route Check');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://keyboard-route-check.sociobot.in/demo');

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('[aria-live="polite"]').first()).toHaveText('Navigated to Record the route your keyboard takes.');
});

test('skip link moves focus past the repeated header and into main content', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/#main$/);
  await expect(page.locator('main#main')).toBeFocused();
  await expect(page.locator('main#main')).toHaveCSS('outline-style', 'solid');
  await expect(page.locator('main#main')).toHaveCSS('outline-width', '3px');

  await page.keyboard.press('Tab');
  expect(await page.locator(':focus').evaluate((element) => element.closest('main')?.id)).toBe('main');
  await expect(page.getByRole('link', { name: 'KRC Keyboard Route Check home' })).not.toBeFocused();
});

test('every route has complete route-specific metadata and clear external link text', async ({ page }) => {
  const routes = [
    ['/', 'Keyboard Route Check — Record a keyboard route', 'https://keyboard-route-check.sociobot.in/'],
    ['/demo', 'Demo — Keyboard Route Check', 'https://keyboard-route-check.sociobot.in/demo'],
    ['/privacy', 'Privacy — Keyboard Route Check', 'https://keyboard-route-check.sociobot.in/privacy'],
    ['/terms', 'Terms — Keyboard Route Check', 'https://keyboard-route-check.sociobot.in/terms'],
    ['/404', 'Page not found — Keyboard Route Check', 'https://keyboard-route-check.sociobot.in/404']
  ] as const;
  for (const [route, title, canonical] of routes) {
    await page.goto(route);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
    await expect(page.getByRole('link', { name: 'Built by Param Factory (external site)' })).toBeVisible();
  }
});

test('review copy uses useful section labels, plain terms, and an honest local archive name', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Keyboard route recorder')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sample keyboard route report' })).toBeVisible();
  await expect(page.getByText('SAMPLE REPORT', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Free report export; no account')).toBeVisible();
  await expect(page.getByText('Route data stays in this browser')).toBeVisible();
  await expect(page.getByText('Recording works offline; license checks need a connection')).toBeVisible();
  await expect(page.locator('.lede')).toHaveText('For keyboard users and web teams checking how focus moves through a page.');
  await expect(page.getByText('It cannot confirm that a page meets accessibility requirements.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Local report archive for existing licenses' })).toBeVisible();
  await expect(page.getByText('It does not sync or share them with teammates.')).toBeVisible();
  await expect(page.getByText('Record and export manual keyboard routes.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Route findings' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Export the report' })).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/FIELD RECORDER|ROUTE TAPE|team route archive|Tab loops|WCAG compliance|Generated artwork|Share the report|companion site/i);

  await page.goto('/privacy');
  await expect(page.getByText('The website keeps a returned checkout token in this tab until the tab closes, so you can copy it into the extension.')).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/companion[- ]site/i);

  await page.goto('/404');
  await expect(page.getByText('Page not found', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('We could not find that page.');
  await expect(page.locator('body')).not.toContainText('TAPE ENDS HERE');
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

test('every public-site keyboard focus ring has three-to-one contrast against its surface', async ({ page }) => {
  for (const route of ['/', '/demo', '/privacy', '/terms', '/404']) {
    await page.goto(route);
    const controls = page.locator('a[href], button:not([disabled]), input:not([disabled])');
    for (let index = 0; index < await controls.count(); index += 1) {
      const control = controls.nth(index);
      if (!await control.isVisible()) continue;
      await control.focus();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Tab');
      const focus = await control.evaluate((element) => {
        const style = getComputedStyle(element);
        let surface = element.parentElement;
        let backgroundColor = 'rgb(255, 255, 255)';
        while (surface) {
          const candidate = getComputedStyle(surface).backgroundColor;
          if (candidate !== 'transparent' && candidate !== 'rgba(0, 0, 0, 0)') {
            backgroundColor = candidate;
            break;
          }
          surface = surface.parentElement;
        }
        return {
          name: element.getAttribute('aria-label') || element.textContent?.trim() || element.getAttribute('name') || element.tagName,
          focusVisible: element.matches(':focus-visible'),
          outlineStyle: style.outlineStyle,
          outlineWidth: Number.parseFloat(style.outlineWidth),
          outlineColor: style.outlineColor,
          backgroundColor
        };
      });
      expect(focus.focusVisible, `${route}: ${focus.name} should show keyboard focus`).toBe(true);
      expect(focus.outlineStyle, `${route}: ${focus.name} should have an outline`).not.toBe('none');
      expect(focus.outlineWidth, `${route}: ${focus.name} should have a visible outline`).toBeGreaterThan(0);
      expect(
        contrastRatio(parseCssColor(focus.outlineColor)!, parseCssColor(focus.backgroundColor)!),
        `${route}: ${focus.name} focus ring contrast against ${focus.backgroundColor}`
      ).toBeGreaterThanOrEqual(3);
    }
  }
});

test('the complete first-read message fits the initial 390px viewport without horizontal overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/');
  for (const target of [
    page.getByRole('heading', { level: 1 }),
    page.locator('.lede'),
    page.getByRole('link', { name: 'Try it with sample data' }),
    page.getByText('See a route report right away.'),
    page.getByRole('link', { name: 'Download desktop Chrome extension ZIP' }),
    page.locator('.facts')
  ]) {
    const box = await target.boundingBox();
    expect(box, 'first-read element should be visible').not.toBeNull();
    expect(box!.y + box!.height, 'first-read element should fit before the fold').toBeLessThanOrEqual(844);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({ path: '.factory/evidence/polish-4-home-mobile.png', fullPage: false });
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
