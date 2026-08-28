import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { addStep, createReport, routeExport } from '../src/route';
import type { RouteStep } from '../src/types';

const step = (id: string, label = 'Open menu', visible = true, focusMark = true): RouteStep => ({ id, label, role: 'button', selector: `#${id}`, direction: 'forward', visible, focusMark, timestamp: 1 });

describe('route report', () => {
  it('@claim:route-data-local keeps values out of a route report', () => {
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
  it('@claim:report-export exports labels, roles, order, and findings', () => {
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
});
