export interface TabStop<T> {
  value: T;
  tabIndex: number;
  documentOrder: number;
}

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
