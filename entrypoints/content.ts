import type { Direction, RecorderMessage, RouteStep } from '../src/types';
import { elementIdentity } from '../src/element-identity';
import { hasVisibleFocusIndicator, type FocusStyle } from '../src/focus-indicator';
import { sequentialTabStops, tabStopForActiveElement } from '../src/tab-order';
import { defineContentScript } from 'wxt/utils/define-content-script';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
let enabled = false;
let direction: Direction = 'direct';
let expected: { id: string; label: string } | undefined;
let pendingFocusStyles: { target: HTMLElement; styles: Map<HTMLElement, FocusStyle> } | undefined;

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
  const labels = (el as HTMLElement & { labels?: NodeListOf<HTMLLabelElement> | null }).labels;
  if (labels?.length) {
    const label = Array.from(labels).map((item) => safeText(item.textContent)).filter(Boolean).join(' ');
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

function focusStyle(el: HTMLElement): FocusStyle {
  const style = getComputedStyle(el);
  return {
    outlineStyle: style.outlineStyle,
    outlineWidth: style.outlineWidth,
    outlineColor: style.outlineColor,
    boxShadow: style.boxShadow,
    backgroundColor: style.backgroundColor,
    color: style.color,
    borderTopColor: style.borderTopColor,
    borderRightColor: style.borderRightColor,
    borderBottomColor: style.borderBottomColor,
    borderLeftColor: style.borderLeftColor,
    borderTopWidth: style.borderTopWidth,
    borderRightWidth: style.borderRightWidth,
    borderBottomWidth: style.borderBottomWidth,
    borderLeftWidth: style.borderLeftWidth
  };
}

/**
 * CSSOM only exposes the current (focused) style. Sample an inert clone in the
 * same parent to compare focus-only fills and borders without blurring the
 * control the keyboard user is currently using.
 */
function unfocusedStyle(el: HTMLElement): FocusStyle {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.setAttribute('aria-hidden', 'true');
  clone.style.setProperty('position', 'fixed', 'important');
  clone.style.setProperty('visibility', 'hidden', 'important');
  clone.style.setProperty('pointer-events', 'none', 'important');
  clone.style.setProperty('inset', '-9999px', 'important');
  el.after(clone);
  try {
    return focusStyle(clone);
  } finally {
    clone.remove();
  }
}

function focusChain(el: HTMLElement): HTMLElement[] {
  const chain: HTMLElement[] = [];
  let node: HTMLElement | null = el;
  while (node && node !== document.body && node !== document.documentElement) {
    chain.push(node);
    node = node.parentElement;
  }
  return chain;
}

function backgroundBehind(el: HTMLElement): string | undefined {
  let parent = el.parentElement;
  while (parent) {
    const background = getComputedStyle(parent).backgroundColor;
    if (background && background !== 'transparent' && background !== 'rgba(0, 0, 0, 0)') {
      return background;
    }
    parent = parent.parentElement;
  }
  return undefined;
}

function focusStyleChanged(focused: FocusStyle, unfocused: FocusStyle): boolean {
  return (Object.keys(focused) as Array<keyof FocusStyle>)
    .some((property) => focused[property] !== unfocused[property]);
}

function focusStylesBefore(el: HTMLElement): Map<HTMLElement, FocusStyle> {
  return new Map(focusChain(el).map((node) => [node, focusStyle(node)]));
}

function hasFocusMark(el: HTMLElement): boolean {
  const beforeStyles = pendingFocusStyles?.target === el ? pendingFocusStyles.styles : undefined;
  return focusChain(el).some((node) => {
    const focused = focusStyle(node);
    const unfocused = beforeStyles?.get(node) || (node === el ? unfocusedStyle(el) : undefined);
    if (unfocused && !focusStyleChanged(focused, unfocused)) return false;
    return hasVisibleFocusIndicator(focused, backgroundBehind(node), unfocused);
  });
}

function tabbables(): HTMLElement[] {
  return sequentialTabStops(document);
}

document.addEventListener('keydown', (event) => {
  if (!enabled || event.key !== 'Tab') return;
  direction = event.shiftKey ? 'reverse' : 'forward';
  const candidates = tabbables();
  if (!candidates.length) {
    expected = undefined;
    pendingFocusStyles = undefined;
    return;
  }
  const index = candidates.indexOf(tabStopForActiveElement(document.activeElement, candidates) || document.activeElement as HTMLElement);
  const nextIndex = index < 0
    ? (event.shiftKey ? candidates.length - 1 : 0)
    : (index + (event.shiftKey ? -1 : 1) + candidates.length) % candidates.length;
  const next = candidates[nextIndex];
  expected = { id: elementId(next), label: labelFor(next) };
  pendingFocusStyles = { target: next, styles: focusStylesBefore(next) };
}, true);

document.addEventListener('focusin', (event) => {
  if (!enabled || !(event.target instanceof HTMLElement)) return;
  const el = event.target;
  const focusMark = hasFocusMark(el);
  const step: RouteStep = {
    id: elementId(el), role: roleFor(el), label: labelFor(el), selector: elementId(el), direction,
    visible: isVisible(el), focusMark, timestamp: Date.now()
  };
  const packet: RecorderMessage = { type: 'KRC_STEP', step, expected };
  void chrome.runtime.sendMessage(packet);
  direction = 'direct';
  expected = undefined;
  pendingFocusStyles = undefined;
}, true);

chrome.runtime.onMessage.addListener((message: RecorderMessage, _sender, respond) => {
  if (message.type === 'KRC_START') {
    enabled = true;
    expected = undefined;
    pendingFocusStyles = undefined;
  }
  if (message.type === 'KRC_STOP' || message.type === 'KRC_CLEAR') {
    enabled = false;
    expected = undefined;
    pendingFocusStyles = undefined;
  }
  respond({ ok: true });
});
  }
});
