import type { Segment } from './types';

export function makeSegment(n: number, s: number, e: number): Segment {
  return { index: n + 1, start: Number(s.toFixed(2)), end: e, duration: Number((e - s).toFixed(2)), kind: n ? 'speech' : 'hook', scale: n % 2 ? 1.12 : 1.0, light_leak: n > 0 && n % 3 === 0, sfx: n % 3 === 0 ? 'whoosh' : null, enabled: true, label: `Cut ${String(n + 1).padStart(2, '0')}` };
}
