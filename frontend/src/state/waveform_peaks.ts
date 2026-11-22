export function waveformPeaks(ch: Float32Array, bars = 120): number[] {
  const step = Math.max(1, Math.floor(ch.length / bars));
  return Array.from({ length: bars }, (_, i) => {
    let m = 0;
    for (let j = i * step; j < Math.min(ch.length, (i + 1) * step); j++) m = Math.max(m, Math.abs(ch[j]));
    return Math.max(0.04, Number(m.toFixed(3)));
  });
}
