import type { SequenceSpec } from './types';

export const SEQUENCE_PRESETS: Record<string, SequenceSpec> = {
  '16:9 HD': { width: 1920, height: 1080, fps: 30, fit_mode: 'fill' },
  '9:16 Reel': { width: 1080, height: 1920, fps: 30, fit_mode: 'fill' },
  '1:1 Square': { width: 1080, height: 1080, fps: 30, fit_mode: 'fill' },
  '4:5 Portrait': { width: 1080, height: 1350, fps: 30, fit_mode: 'fill' },
  '4K Cinema': { width: 3840, height: 2160, fps: 24, fit_mode: 'fill' },
};
