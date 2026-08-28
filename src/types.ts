export type Direction = 'forward' | 'reverse' | 'direct';

export type FindingKind = 'loop' | 'skip' | 'invisible-focus';

export interface RouteFinding {
  kind: FindingKind;
  message: string;
  at: number;
}

export interface RouteStep {
  id: string;
  role: string;
  label: string;
  selector: string;
  direction: Direction;
  visible: boolean;
  focusMark: boolean;
  timestamp: number;
}

export interface RouteReport {
  version: 1;
  title: string;
  url: string;
  startedAt: number;
  endedAt?: number;
  steps: RouteStep[];
  findings: RouteFinding[];
}

export type RecorderMessage =
  | { type: 'KRC_START' }
  | { type: 'KRC_STOP' }
  | { type: 'KRC_CLEAR' }
  | { type: 'KRC_STEP'; step: RouteStep; expected?: { id: string; label: string } }
  | { type: 'KRC_STATUS'; recording: boolean };
