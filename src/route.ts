import type { Direction, RouteFinding, RouteReport, RouteStep } from './types';

export function createReport(title: string, url: string, now = Date.now()): RouteReport {
  return { version: 1, title, url, startedAt: now, steps: [], findings: [] };
}

export function addStep(report: RouteReport, step: RouteStep, expected?: { id: string; label: string }): RouteReport {
  const previous = report.steps.at(-1);
  const findings: RouteFinding[] = [...report.findings];
  if (!step.visible || !step.focusMark) {
    findings.push({ kind: 'invisible-focus', at: report.steps.length, message: `${step.label} may not show a visible focus mark.` });
  }
  if (previous?.id === step.id) {
    findings.push({ kind: 'loop', at: report.steps.length, message: `Focus returned to ${step.label} without moving on.` });
  }
  if (expected && expected.id !== step.id && step.direction !== 'direct') {
    findings.push({ kind: 'skip', at: report.steps.length, message: `Expected ${expected.label}; focus moved to ${step.label}.` });
  }
  return { ...report, steps: [...report.steps, step], findings };
}

export function routeExport(report: RouteReport): string {
  return JSON.stringify({ ...report, endedAt: report.endedAt ?? Date.now() }, null, 2);
}

export function nextDirection(shift: boolean, tab: boolean): Direction {
  return tab ? (shift ? 'reverse' : 'forward') : 'direct';
}
