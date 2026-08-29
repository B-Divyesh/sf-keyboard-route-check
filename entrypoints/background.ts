import { addStep, createReport } from '../src/route';
import type { RecorderMessage, RouteReport } from '../src/types';
import { defineBackground } from 'wxt/utils/define-background';

export default defineBackground(() => {
const reportKey = (tabId: number) => `report:${tabId}`;
const activeKey = (tabId: number) => `active:${tabId}`;
const tabQueues = new Map<number, Promise<void>>();

async function state(tabId: number): Promise<RouteReport | undefined> {
  return (await chrome.storage.session.get(reportKey(tabId)))[reportKey(tabId)] as RouteReport | undefined;
}

/**
 * Focus events can arrive more quickly than a storage read/write round trip.
 * Serialize each tab's report updates so a fast Tab sequence cannot lose
 * earlier stops through concurrent read-modify-write operations.
 */
function queueTabUpdate(tabId: number, update: () => Promise<void>): Promise<void> {
  const previous = tabQueues.get(tabId) || Promise.resolve();
  const queued = previous.catch(() => undefined).then(update);
  tabQueues.set(tabId, queued);
  void queued.then(
    () => { if (tabQueues.get(tabId) === queued) tabQueues.delete(tabId); },
    () => { if (tabQueues.get(tabId) === queued) tabQueues.delete(tabId); }
  );
  return queued;
}

chrome.runtime.onMessage.addListener((message: RecorderMessage, sender, respond) => {
  const requestedTabId = (message as RecorderMessage & { tabId?: number }).tabId;
  // Popup messages name the inspected tab explicitly. Content-script steps
  // must remain tied to their sender tab so a page cannot write elsewhere.
  const tabId = message.type === 'KRC_START' || message.type === 'KRC_STOP' || message.type === 'KRC_CLEAR'
    ? requestedTabId ?? sender.tab?.id
    : sender.tab?.id;
  if (!tabId) return;
  void queueTabUpdate(tabId, async () => {
    if (message.type === 'KRC_START') {
      const tab = await chrome.tabs.get(tabId);
      const report = createReport(tab.title || 'Untitled page', tab.url || '');
      await chrome.storage.session.set({ [reportKey(tabId)]: report, [activeKey(tabId)]: true });
      respond({ ok: true, report });
    }
    if (message.type === 'KRC_STOP') {
      const report = await state(tabId);
      if (report) await chrome.storage.session.set({ [reportKey(tabId)]: { ...report, endedAt: Date.now() }, [activeKey(tabId)]: false });
      respond({ ok: true });
    }
    if (message.type === 'KRC_CLEAR') {
      await chrome.storage.session.remove([reportKey(tabId), activeKey(tabId)]);
      respond({ ok: true });
    }
    if (message.type === 'KRC_STEP') {
      const active = (await chrome.storage.session.get(activeKey(tabId)))[activeKey(tabId)];
      const report = await state(tabId);
      if (active && report) await chrome.storage.session.set({ [reportKey(tabId)]: addStep(report, message.step, message.expected) });
      respond({ ok: true });
    }
  }).catch(() => respond({ ok: false }));
  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabQueues.delete(tabId);
  void chrome.storage.session.remove([reportKey(tabId), activeKey(tabId)]);
});
});
