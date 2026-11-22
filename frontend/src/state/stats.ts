import { computed } from '@zuari/signals';
import { segmentsSig, sourceDurationSig } from './signals';

export const statsSig = computed(() => {
  const dur = sourceDurationSig.value;
  const kept = segmentsSig.value.filter((s) => s.enabled).reduce((a, b) => a + b.duration, 0);
  const removed = Math.max(0, dur - kept);
  return { kept: kept.toFixed(1), removed: removed.toFixed(1), pct: (dur > 0 ? (removed / dur) * 100 : 0).toFixed(1) };
});
