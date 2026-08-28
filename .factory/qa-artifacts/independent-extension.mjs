import { chromium } from '@playwright/test';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const profile = await mkdtemp(resolve(tmpdir(), 'krc-independent-'));
const context = await chromium.launchPersistentContext(profile, {
  channel: 'chromium',
  headless: true,
  args: [
    `--disable-extensions-except=${resolve('.output/chrome-mv3')}`,
    `--load-extension=${resolve('.output/chrome-mv3')}`,
  ],
});

const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
const extensionId = new URL(worker.url()).host;

async function scenario(name, setup, actions, inspectPopup = false) {
  for (const openPage of context.pages()) await openPage.close();
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/fixtures/route-page.html');
  await setup(page);
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popup.getByRole('button', { name: 'Record this tab' }).click();
  await page.bringToFront();
  await actions(page);
  await page.waitForTimeout(250);
  const tabId = await worker.evaluate(async () => {
    const tabs = await chrome.tabs.query({});
    return tabs.find((tab) => tab.url?.includes('/fixtures/route-page.html'))?.id;
  });
  const report = await worker.evaluate(async (id) =>
    (await chrome.storage.session.get(`report:${id}`))[`report:${id}`], tabId);
  let popupEvidence = null;
  if (inspectPopup) {
    await popup.reload();
    popupEvidence = {
      injectedControlCount: await popup.locator('#injected-control').count(),
      injectedControlText: await popup.locator('#injected-control').allTextContents(),
    };
  }
  console.log(JSON.stringify({ name, report, popupEvidence }));
}

await scenario('normal-forward', async (page) => {
  await page.evaluate(() => { document.body.innerHTML = '<button id="a">Alpha</button><button id="b">Beta</button><button id="c">Gamma</button>'; });
}, async (page) => {
  await page.locator('#a').focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
});

await scenario('two-control-loop', async (page) => {
  await page.evaluate(() => {
    document.body.innerHTML = '<button id="a">Alpha</button><button id="b">Beta</button>';
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      event.preventDefault();
      document.querySelector(document.activeElement?.id === 'a' ? '#b' : '#a')?.focus();
    });
  });
}, async (page) => {
  await page.locator('#a').focus();
  for (let index = 0; index < 4; index += 1) await page.keyboard.press('Tab');
});

await scenario('positive-tabindex', async (page) => {
  await page.evaluate(() => { document.body.innerHTML = '<button id="a" tabindex="2">Alpha</button><button id="b" tabindex="1">Beta</button><button id="c">Gamma</button>'; });
}, async (page) => {
  await page.locator('#b').focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
});

await scenario('invisible-focus', async (page) => {
  await page.evaluate(() => { document.body.innerHTML = '<style>button:focus{outline:none!important;box-shadow:none!important}</style><button id="a">Alpha</button><button id="b">Beta</button>'; });
}, async (page) => {
  await page.locator('#a').focus();
  await page.keyboard.press('Tab');
});

await scenario('untrusted-label-markup', async (page) => {
  await page.evaluate(() => {
    document.body.innerHTML = '<button id="a">Alpha</button>';
    document.querySelector('#a').setAttribute('aria-label', '</span><button id="injected-control">Fake export</button><span>');
  });
}, async (page) => {
  await page.locator('#a').focus();
}, true);

await context.close();
