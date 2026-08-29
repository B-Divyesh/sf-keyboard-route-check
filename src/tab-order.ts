export interface TabStop<T> {
  value: T;
  tabIndex: number;
  documentOrder: number;
}

const sequentialFocusSelector = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  'iframe',
  'object',
  'embed',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]',
  '[tabindex]'
].join(',');

/**
 * Browsers visit positive tabindex values first (ascending), then ordinary
 * controls in document order. Keeping this separately from DOM selection
 * makes the recorder's expected-next check match an actual Tab keypress.
 */
export function orderTabStops<T>(stops: TabStop<T>[]): T[] {
  return [...stops]
    .sort((left, right) => {
      const leftPositive = left.tabIndex > 0;
      const rightPositive = right.tabIndex > 0;
      if (leftPositive && rightPositive) return left.tabIndex - right.tabIndex || left.documentOrder - right.documentOrder;
      if (leftPositive) return -1;
      if (rightPositive) return 1;
      return left.documentOrder - right.documentOrder;
    })
    .map((stop) => stop.value);
}

function isRenderedForTab(node: HTMLElement): boolean {
  if (!node.isConnected || !node.getClientRects().length) return false;
  for (let ancestor: HTMLElement | null = node; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.hasAttribute('hidden') || ancestor.hasAttribute('inert')) return false;
    const style = getComputedStyle(ancestor);
    if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || style.contentVisibility === 'hidden') {
      return false;
    }
  }
  return true;
}

function isImplicitEditingHost(node: HTMLElement): boolean {
  if (!node.isContentEditable || node.hasAttribute('tabindex')) return false;
  return !node.parentElement?.isContentEditable;
}

/**
 * `tabIndex` is -1 for an implicit editing host even though Tab reaches it.
 * Explicit tabindex still wins, including tabindex=-1 which removes it.
 */
function sequentialTabIndex(node: HTMLElement): number | undefined {
  if (node.hasAttribute('tabindex')) return node.tabIndex >= 0 ? node.tabIndex : undefined;
  if (isImplicitEditingHost(node)) return 0;
  return node.tabIndex >= 0 ? node.tabIndex : undefined;
}

function isEligibleTabStop(node: HTMLElement): boolean {
  if (node.matches(':disabled')) return false;
  if (node instanceof HTMLInputElement && node.type === 'hidden') return false;
  return isRenderedForTab(node) && sequentialTabIndex(node) !== undefined;
}

function isRadio(node: HTMLElement): node is HTMLInputElement {
  return node instanceof HTMLInputElement && node.type === 'radio';
}

/** Native radio groups contribute one sequential stop: the checked radio, or the first eligible member. */
function sameRadioGroup(left: HTMLInputElement, right: HTMLInputElement): boolean {
  if (!left.name || !right.name) return left === right;
  return left.name === right.name && left.form === right.form && left.getRootNode() === right.getRootNode();
}

function radioGroupStop(node: HTMLInputElement, candidates: HTMLElement[]): boolean {
  const group = candidates.filter(isRadio).filter((candidate) => sameRadioGroup(node, candidate));
  if (group.length < 2) return true;
  return node === group.find((candidate) => candidate.checked) || node === group[0];
}

/**
 * Approximate the browser's sequential focus-navigation list rather than its
 * DOM query order. This is deliberately separate from route rendering so a
 * reported skipped control always reflects a control the browser would visit.
 */
export function sequentialTabStops(root: Document = document): HTMLElement[] {
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(sequentialFocusSelector))
    .filter(isEligibleTabStop);
  const stops = candidates.filter((node) => !isRadio(node) || radioGroupStop(node, candidates));
  return orderTabStops(stops.map((node, documentOrder) => ({
    value: node,
    tabIndex: sequentialTabIndex(node)!,
    documentOrder
  })));
}

/**
 * An arrow key can leave an unchecked radio focused. Treat that member as its
 * group's one Tab stop so the following Tab predicts the browser's next stop.
 */
export function tabStopForActiveElement(active: Element | null, stops: HTMLElement[]): HTMLElement | undefined {
  if (!(active instanceof HTMLElement)) return undefined;
  if (isRadio(active)) return stops.find((candidate) => isRadio(candidate) && sameRadioGroup(active, candidate));
  return stops.find((candidate) => candidate === active);
}
