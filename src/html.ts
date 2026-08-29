/**
 * Turns page-supplied text into inert HTML text before it is inserted into a
 * template string. Route labels and roles come from the inspected page, so
 * they must never be trusted as popup markup.
 */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]!);
}
