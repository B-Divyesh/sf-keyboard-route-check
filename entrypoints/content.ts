import type { Direction, RecorderMessage, RouteStep } from '../src/types';
import { elementIdentity } from '../src/element-identity';
import { hasVisibleFocusIndicator } from '../src/focus-indicator';
import { orderTabStops } from '../src/tab-order';
import { defineContentScript } from 'wxt/utils/define-content-script';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
let enabled = false;
let direction: Direction = 'direct';
let expected: { id: string; label: string } | undefined;

function safeText(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim().slice(0, 80);
}

function labelFor(el: HTMLElement): string {
  const aria = safeText(el.getAttribute('aria-label'));
  if (aria) return aria;
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const label = labelledBy.split(/\s+/).map((id) => safeText(document.getElementById(id)?.textContent)).filter(Boolean).join(' ');
    if (label) return label;
  }
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    const label = safeText(document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent);
    if (label) return label;
  }
  const title = safeText(el.getAttribute('title'));
  if (title) return title;
  const controlText = safeText(el.textContent);
  if (controlText) return controlText;
  return `Unnamed ${roleFor(el)}`;
}

function roleFor(el: HTMLElement): string {
  if (el.getAttribute('role')) return el.getAttribute('role')!;
  if (el instanceof HTMLButtonElement) return 'button';
  if (el instanceof HTMLAnchorElement) return 'link';
  if (el instanceof HTMLInputElement) return el.type === 'checkbox' ? 'checkbox' : el.type === 'radio' ? 'radio' : 'input';
  if (el instanceof HTMLSelectElement) return 'select';
  if (el instanceof HTMLTextAreaElement) return 'textarea';
  return el.tagName.toLowerCase();
}

function elementId(el: HTMLElement): string {
  return elementIdentity(el);
}

function isVisible(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
}

function hasFocusMark(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  let parent = el.parentElement;
  while (parent) {
    const background = getComputedStyle(parent).backgroundColor;
    if (background && background !== 'transparent' && background !== 'rgba(0, 0, 0, 0)') {
      return hasVisibleFocusIndicator(style, background);
    }
    parent = parent.parentElement;
  }
  return hasVisibleFocusIndicator(style);
}

function tabbables(): HTMLElement[] {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]'))
    .filter((node) => isVisible(node) && node.tabIndex >= 0);
  return orderTabStops(candidates.map((node, documentOrder) => ({ value: node, tabIndex: node.tabIndex, documentOrder })));
}

document.addEventListener('keydown', (event) => {
  if (!enabled || event.key !== 'Tab') return;
  direction = event.shiftKey ? 'reverse' : 'forward';
  const candidates = tabbables();
  if (!candidates.length) { expected = undefined; return; }
  const index = candidates.indexOf(document.activeElement as HTMLElement);
  const nextIndex = index < 0
    ? (event.shiftKey ? candidates.length - 1 : 0)
    : (index + (event.shiftKey ? -1 : 1) + candidates.length) % candidates.length;
  const next = candidates[nextIndex];
  expected = { id: elementId(next), label: labelFor(next) };
}, true);

document.addEventListener('focusin', (event) => {
  if (!enabled || !(event.target instanceof HTMLElement)) return;
  const el = event.target;
  const step: RouteStep = {
    id: elementId(el), role: roleFor(el), label: labelFor(el), selector: elementId(el), direction,
    visible: isVisible(el), focusMark: hasFocusMark(el), timestamp: Date.now()
  };
  const packet: RecorderMessage = { type: 'KRC_STEP', step, expected };
  void chrome.runtime.sendMessage(packet);
  direction = 'direct';
  expected = undefined;
}, true);

chrome.runtime.onMessage.addListener((message: RecorderMessage, _sender, respond) => {
  if (message.type === 'KRC_START') enabled = true;
  if (message.type === 'KRC_STOP' || message.type === 'KRC_CLEAR') enabled = false;
  respond({ ok: true });
});
  }
});
