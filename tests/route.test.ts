import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { addStep, createReport, routeExport, safeReportUrl } from '../src/route';
import { escapeHtml } from '../src/html';
import { hasVisibleFocusIndicator } from '../src/focus-indicator';
import type { RouteStep } from '../src/types';

const step = (id: string, label = 'Open menu', visible = true, focusMark = true, direction: RouteStep['direction'] = 'forward'): RouteStep => ({ id, label, role: 'button', selector: `#${id}`, direction, visible, focusMark, timestamp: 1 });

describe('route report', () => {
  it('keeps values out of a route report', () => {
    const report = addStep(createReport('Page', 'https://example.test'), step('menu'));
    const output = routeExport(report);
    expect(output).toContain('Open menu');
    expect(output).not.toContain('password');
    expect(output).not.toContain('value');
    const recorder = readFileSync(new URL('../entrypoints/content.ts', import.meta.url), 'utf8');
    const background = readFileSync(new URL('../entrypoints/background.ts', import.meta.url), 'utf8');
    expect(recorder).not.toMatch(/\.value\b/);
    expect(background).not.toContain('fetch(');
  });
  it('removes page titles, credentials, query values, and fragments from report context', () => {
    const report = createReport('A private patient record', 'https://name:password@example.test/check?session_token=secret-query-value#private-note');
    expect(report.title).toBe('Page title not collected');
    expect(report.url).toBe('https://example.test/check');
    expect(routeExport(report)).not.toContain('secret-query-value');
    expect(routeExport(report)).not.toContain('private patient');
    expect(safeReportUrl('not a URL')).toBe('');
  });
  it('does not mistake transparent or low-contrast CSS for a visible focus indicator', () => {
    expect(hasVisibleFocusIndicator({ outlineStyle: 'solid', outlineWidth: '3px', outlineColor: 'rgba(0, 0, 0, 0)', boxShadow: 'none' }, 'rgb(255, 255, 255)')).toBe(false);
    expect(hasVisibleFocusIndicator({ outlineStyle: 'solid', outlineWidth: '3px', outlineColor: 'rgb(255, 255, 255)', boxShadow: 'none' }, 'rgb(255, 255, 255)')).toBe(false);
    expect(hasVisibleFocusIndicator({ outlineStyle: 'none', outlineWidth: '0px', outlineColor: 'transparent', boxShadow: 'rgba(0, 0, 0, 0) 0px 0px 0px 3px' }, 'rgb(255, 255, 255)')).toBe(false);
    expect(hasVisibleFocusIndicator({ outlineStyle: 'solid', outlineWidth: '3px', outlineColor: 'rgb(23, 33, 28)', boxShadow: 'none' }, 'rgb(255, 255, 255)')).toBe(true);
  });
  it('exports labels, roles, order, and findings', () => {
    const first = addStep(createReport('Page', 'https://example.test'), step('menu'));
    const report = addStep(first, step('calendar', 'Next month', true, false), { id: 'expected', label: 'Choose a date' });
    const output = JSON.parse(routeExport(report));
    expect(output.steps).toHaveLength(2);
    expect(output.steps[1]).toMatchObject({ label: 'Next month', role: 'button' });
    expect(output.findings.map((finding: { kind: string }) => finding.kind)).toContain('invisible-focus');
    expect(output.findings.map((finding: { kind: string }) => finding.kind)).toContain('skip');
  });
  it('flags a focus loop', () => {
    const first = addStep(createReport('Page', 'https://example.test'), step('menu'));
    expect(addStep(first, step('menu')).findings[0]?.kind).toBe('loop');
  });
  it('flags a repeated forward two-control focus cycle', () => {
    const alpha = addStep(createReport('Page', 'https://example.test'), step('alpha', 'Alpha'));
    const beta = addStep(alpha, step('beta', 'Beta'));
    const cycle = addStep(beta, step('alpha', 'Alpha'));
    expect(cycle.findings).toEqual([{
      kind: 'loop', at: 2, message: 'Focus returned to Alpha in the same Tab direction.'
    }]);
  });
  it('does not call intentional reverse navigation a focus cycle', () => {
    const alpha = addStep(createReport('Page', 'https://example.test'), step('alpha', 'Alpha'));
    const beta = addStep(alpha, step('beta', 'Beta'));
    const back = addStep(beta, step('alpha', 'Alpha', true, true, 'reverse'));
    expect(back.findings).toEqual([]);
  });
  it('does not flag adjacent controls with distinct identities as a loop', () => {
    const first = addStep(createReport('Page', 'https://example.test'), step('a:nth-of-type(1)', 'Privacy'));
    const second = addStep(first, step('a:nth-of-type(2)', 'Terms'));
    expect(second.findings).toHaveLength(0);
  });
  it('escapes page-provided report text before HTML rendering', () => {
    expect(escapeHtml('</span><button id="injected-control">Fake export</button><span>'))
      .toBe('&lt;/span&gt;&lt;button id=&quot;injected-control&quot;&gt;Fake export&lt;/button&gt;&lt;span&gt;');
  });
});
