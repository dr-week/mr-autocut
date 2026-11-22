import type { Segment } from './types';
import { makeSegment } from './make_segment';

export function detectSegments(waveform: number[], dbThreshold: number, dur: number): Segment[] {
  const lin = Math.pow(10, dbThreshold / 20), bars = waveform.length, dt = dur / bars;
  const segs: Segment[] = [];
  let s = -1;
  waveform.forEach((p, i) => {
    if (p >= lin && s < 0) s = i * dt;
    else if ((p < lin || i === bars - 1) && s >= 0) { const e = Number((i * dt).toFixed(2)); if (e - s >= 0.35) segs.push(makeSegment(segs.length, s, e)); s = -1; }
  });
  return segs;
}
