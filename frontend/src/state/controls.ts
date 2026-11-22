import { computed, signal } from '@zuari/signals';
import { segmentsSig, sourceDurationSig } from './signals';

export const safeZonesSig = signal<boolean>(true);
export const silenceDbSig = signal<number>(-32);
export const minSilenceSig = signal<number>(0.28);
export const paddingSig = signal<number>(0.06);
export const punchInSig = signal<boolean>(true);
export const autoSfxSig = signal<boolean>(true);
export const autoLightLeakSig = signal<boolean>(true);
export const fxSearchSig = signal<string>('');
export const captionTextSig = signal<string>('MR-AUTOCUT · SEQUENCE ADAPTIVE');
export const bridgeAddrSig = signal<string>('127.0.0.1:9001');
export const jsonlSig = signal<string>('');
export const cliCmdSig = signal<string>('');
export const toastSig = signal<string>('');
export const loggedEditsSig = signal<number>(0);
export const colorFilterSig = signal<string>('none');

export const statsSig = computed(() => {
  const dur = sourceDurationSig.value;
  const kept = segmentsSig.value.filter((s) => s.enabled).reduce((a, b) => a + b.duration, 0);
  const removed = Math.max(0, dur - kept);
  return { kept: kept.toFixed(1), removed: removed.toFixed(1), pct: (dur > 0 ? (removed / dur) * 100 : 0).toFixed(1) };
});
