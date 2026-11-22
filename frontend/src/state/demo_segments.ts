import type { Segment } from './types';

export const DEMO_SEGMENTS: Segment[] = [
  { index: 1, start: 0.85, end: 4.2, duration: 3.35, kind: 'hook', scale: 1.0, light_leak: false, sfx: 'hit', enabled: true, label: 'Cut 01' },
  { index: 2, start: 5.15, end: 9.8, duration: 4.65, kind: 'speech', scale: 1.12, light_leak: false, sfx: null, enabled: true, label: 'Cut 02 · Punch' },
  { index: 3, start: 11.4, end: 16.1, duration: 4.7, kind: 'speech', scale: 1.0, transition: 'whip-pan', light_leak: true, sfx: 'whoosh', enabled: true, label: 'Cut 03' },
  { index: 4, start: 17.05, end: 22.5, duration: 5.45, kind: 'speech', scale: 1.12, light_leak: false, sfx: null, enabled: true, label: 'Cut 04 · Punch' },
];
