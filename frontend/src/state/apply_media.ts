import { mediaSig, sourceDurationSig, waveformSig } from './signals';
import type { MediaInfo } from './types';

export function applyMedia(info: MediaInfo) {
  mediaSig.value = info; waveformSig.value = info.waveform; sourceDurationSig.value = info.duration;
}
