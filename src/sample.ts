import type { RouteReport } from './types';

export const sampleReport: RouteReport = {
  version: 1,
  title: 'Sample booking page',
  url: 'https://sample.keyboard-route-check.local/booking',
  startedAt: 1788105600000,
  endedAt: 1788105633000,
  steps: [
    { id: 'nav-menu', role: 'button', label: 'Open menu', selector: 'button[aria-label="Open menu"]', direction: 'forward', visible: true, focusMark: true, timestamp: 1788105600000 },
    { id: 'date', role: 'button', label: 'Choose a date', selector: '#date-picker', direction: 'forward', visible: true, focusMark: true, timestamp: 1788105608000 },
    { id: 'next-month', role: 'button', label: 'Next month', selector: '.calendar-next', direction: 'forward', visible: true, focusMark: false, timestamp: 1788105615000 },
    { id: 'date', role: 'button', label: 'Choose a date', selector: '#date-picker', direction: 'forward', visible: true, focusMark: true, timestamp: 1788105620000 },
    { id: 'book', role: 'button', label: 'Book appointment', selector: '#book', direction: 'reverse', visible: true, focusMark: true, timestamp: 1788105633000 }
  ],
  findings: [
    { kind: 'invisible-focus', at: 2, message: 'Next month may not show a visible focus mark.' },
    { kind: 'skip', at: 3, message: 'Expected a date grid; focus moved to Choose a date.' },
    { kind: 'loop', at: 3, message: 'Focus returned to Choose a date without moving on.' }
  ]
};
