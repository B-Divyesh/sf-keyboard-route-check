import { describe, expect, it } from 'vitest';
import { orderTabStops } from '../src/tab-order';

describe('browser Tab order', () => {
  it('puts positive tabindex controls first in ascending order', () => {
    const ordered = orderTabStops([
      { value: 'Alpha', tabIndex: 2, documentOrder: 0 },
      { value: 'Beta', tabIndex: 1, documentOrder: 1 },
      { value: 'Gamma', tabIndex: 0, documentOrder: 2 }
    ]);
    expect(ordered).toEqual(['Beta', 'Alpha', 'Gamma']);
  });

  it('preserves document order for equal tabindex values', () => {
    const ordered = orderTabStops([
      { value: 'First', tabIndex: 0, documentOrder: 0 },
      { value: 'Second', tabIndex: 0, documentOrder: 1 }
    ]);
    expect(ordered).toEqual(['First', 'Second']);
  });
});
