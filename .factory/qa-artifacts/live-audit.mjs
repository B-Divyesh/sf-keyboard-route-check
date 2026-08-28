import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const base = 'https://keyboard-route-check.sociobot.in';
const routes = ['/', '/demo', '/privacy', '/terms', '/no-such-route'];
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];
const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport });
  for (const route of routes) {
    const page = await context.newPage();
    const errors = [];
    const requests = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('request', (request) => requests.push(request.url()));
    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    const axe = await new AxeBuilder({ page }).analyze();
    const dom = await page.evaluate(() => {
      const controls = [...document.querySelectorAll('a,button,input')].filter((element) => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0;
      });
      return {
        title: document.title,
        lang: document.documentElement.lang,
        h1: [...document.querySelectorAll('h1')].map((element) => element.textContent?.trim()),
        main: document.querySelectorAll('main').length,
        missingAlt: [...document.images].filter((image) => !image.hasAttribute('alt')).length,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        undersized: controls.map((element) => {
          const box = element.getBoundingClientRect();
          return { text: (element.textContent || element.getAttribute('aria-label') || '').trim(), width: box.width, height: box.height };
        }).filter((item) => item.width < 44 || item.height < 44),
        headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((heading) => `${heading.tagName}:${heading.textContent?.trim()}`),
      };
    });
    if (route === '/' || route === '/demo') {
      await page.screenshot({ path: `.factory/qa-artifacts/live-${viewport.name}-${route === '/' ? 'home' : 'demo'}.png`, fullPage: true });
    }
    results.push({
      viewport: viewport.name,
      route,
      status: response?.status(),
      headers: response?.headers(),
      errors,
      requests,
      axe: axe.violations.map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.length })),
      seriousCritical: axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || '')).map((violation) => violation.id),
      dom,
    });
    await page.close();
  }
  await context.close();
}

const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(`${base}/demo`);
const moving = await reducedPage.locator('*').evaluateAll((elements) => elements.map((element) => {
  const style = getComputedStyle(element);
  return { tag: element.tagName, transition: style.transitionDuration, animation: style.animationDuration };
}).filter((item) => item.transition.split(',').some((value) => parseFloat(value) > 0) || item.animation.split(',').some((value) => parseFloat(value) > 0)));
await reducedContext.close();

const flowContext = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const flowPage = await flowContext.newPage();
const flowRequests = [];
const flowErrors = [];
flowPage.on('request', (request) => flowRequests.push({ method: request.method(), url: request.url(), type: request.resourceType() }));
flowPage.on('console', (message) => { if (message.type() === 'error') flowErrors.push(`console: ${message.text()}`); });
flowPage.on('pageerror', (error) => flowErrors.push(`pageerror: ${error.message}`));
await flowPage.goto(base, { waitUntil: 'networkidle' });
await flowPage.getByRole('link', { name: 'Try it with sample data' }).click();
const afterDemoClick = {
  url: flowPage.url(),
  banner: await flowPage.getByRole('status').innerText(),
  h1: await flowPage.getByRole('heading', { level: 1 }).innerText(),
  storage: await flowPage.evaluate(() => ({ ...localStorage })),
};
await flowPage.getByRole('button', { name: 'Reset demo' }).click();
const resetStorage = await flowPage.evaluate(() => ({ ...localStorage }));
const downloadEvent = flowPage.waitForEvent('download');
await flowPage.getByRole('button', { name: 'Export sample report' }).click();
const download = await downloadEvent;
const downloadInfo = { filename: download.suggestedFilename(), size: (await import('node:fs/promises')).stat(await download.path()).then((stat) => stat.size) };
downloadInfo.size = await downloadInfo.size;
await flowPage.getByRole('link', { name: 'Start for real' }).click();
const afterExit = { url: flowPage.url(), storage: await flowPage.evaluate(() => ({ ...localStorage })) };
await flowPage.getByRole('button', { name: 'Verify license' }).click();
const emptyLicense = await flowPage.locator('#license-note').innerText();
await flowPage.locator('#license').fill('invalid-independent-qa');
await flowPage.getByRole('button', { name: 'Verify license' }).click();
await flowPage.locator('#license-note').filter({ hasText: /not active|Could not/ }).waitFor();
const invalidLicense = await flowPage.locator('#license-note').innerText();
const flowStorage = await flowPage.evaluate(() => ({ ...localStorage }));

const focusContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const focusPage = await focusContext.newPage();
await focusPage.goto(base);
const focusStops = [];
for (let index = 0; index < 30; index += 1) {
  await focusPage.keyboard.press('Tab');
  const stop = await focusPage.evaluate(() => {
    const element = document.activeElement;
    const style = element ? getComputedStyle(element) : null;
    const box = element?.getBoundingClientRect();
    return {
      tag: element?.tagName,
      text: (element?.textContent || element?.getAttribute?.('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 80),
      id: element?.id,
      href: element?.getAttribute?.('href'),
      outlineColor: style?.outlineColor,
      outlineWidth: style?.outlineWidth,
      outlineStyle: style?.outlineStyle,
      background: style?.backgroundColor,
      rect: box ? { x: box.x, y: box.y, width: box.width, height: box.height } : null,
    };
  });
  focusStops.push(stop);
  if (index > 0 && stop.text === focusStops[0].text && stop.href === focusStops[0].href) break;
}
await focusPage.screenshot({ path: '.factory/qa-artifacts/live-focus-last.png', fullPage: false });
await focusContext.close();

console.log(JSON.stringify({ results, reducedMotion: { moving }, flow: { afterDemoClick, resetStorage, downloadInfo, afterExit, emptyLicense, invalidLicense, storage: flowStorage, requests: flowRequests, errors: flowErrors }, focusStops }, null, 2));
await flowContext.close();
await browser.close();
