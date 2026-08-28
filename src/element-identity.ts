/**
 * Return a selector that names one control in the current document without
 * relying on presentation classes. Route reports are evidence, so a generic
 * `a.` or `button.` fallback is not useful: adjacent controls would become
 * indistinguishable and create false loop findings.
 */
function unique(selector: string, root: Document): boolean {
  try {
    return root.querySelectorAll(selector).length === 1;
  } catch {
    return false;
  }
}

function escaped(value: string): string {
  return CSS.escape(value);
}

function attributeSelector(el: HTMLElement, root: Document): string | undefined {
  const tag = el.tagName.toLowerCase();
  const candidates: string[] = [];
  for (const attribute of ['data-krc-id', 'data-testid', 'data-test', 'id']) {
    const value = el.getAttribute(attribute);
    if (value) candidates.push(attribute === 'id' ? `#${escaped(value)}` : `${tag}[${attribute}="${escaped(value)}"]`);
  }
  const name = el.getAttribute('name');
  if (name) candidates.push(`${tag}[name="${escaped(name)}"]`);
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) candidates.push(`${tag}[aria-label="${escaped(ariaLabel)}"]`);
  if (el instanceof HTMLAnchorElement && el.getAttribute('href')) candidates.push(`a[href="${escaped(el.getAttribute('href')!)}"]`);
  return candidates.find((candidate) => unique(candidate, root));
}

function nthOfType(el: HTMLElement): number {
  let index = 1;
  let sibling = el.previousElementSibling;
  while (sibling) {
    if (sibling.tagName === el.tagName) index += 1;
    sibling = sibling.previousElementSibling;
  }
  return index;
}

/** A stable, unique selector for a control at the time it is recorded. */
export function elementIdentity(el: HTMLElement, root: Document = document): string {
  const direct = attributeSelector(el, root);
  if (direct) return direct;

  const segments: string[] = [];
  let node: HTMLElement | null = el;
  while (node && node !== root.documentElement) {
    const anchor = attributeSelector(node, root);
    if (anchor) {
      segments.unshift(anchor);
      const selector = segments.join(' > ');
      if (unique(selector, root)) return selector;
      break;
    }
    segments.unshift(`${node.tagName.toLowerCase()}:nth-of-type(${nthOfType(node)})`);
    const selector = segments.join(' > ');
    if (unique(selector, root)) return selector;
    node = node.parentElement;
  }

  // The full type path is class-free and distinguishes adjacent generic
  // controls even when a page supplies no semantic attributes at all.
  return `html > ${segments.join(' > ')}`;
}
