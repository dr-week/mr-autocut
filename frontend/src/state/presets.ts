import type { FxItem, SequenceSpec } from './types';

export const SEQUENCE_PRESETS: Record<string, SequenceSpec> = {
  '16:9 HD': { width: 1920, height: 1080, fps: 30, fit_mode: 'fill' },
  '9:16 Reel': { width: 1080, height: 1920, fps: 30, fit_mode: 'fill' },
  '1:1 Square': { width: 1080, height: 1080, fps: 30, fit_mode: 'fill' },
  '4:5 Portrait': { width: 1080, height: 1350, fps: 30, fit_mode: 'fill' },
  '4K Cinema': { width: 3840, height: 2160, fps: 24, fit_mode: 'fill' },
};

export const FX_LIBRARY: FxItem[] = [
  { id: 'punch-112', cat: 'Camera', name: 'Micro Punch-In 112%', meta: '0.18s · cubic-out', anim: 'fx-zoom' },
  { id: 'whip-pan', cat: 'Transition', name: 'Optical Whip Pan', meta: '0.24s · expo-in-out', anim: 'fx-whip' },
  { id: 'light-leak', cat: 'Light Leak', name: 'Warm Film Light Leak', meta: 'Screen · Amber Flare', anim: 'fx-leak' },
  { id: 'flash-cut', cat: 'Transition', name: '1-Frame Exposure Flash', meta: '0.12s · Beat Drop', anim: 'fx-flash' },
  { id: 'whoosh-sfx', cat: 'SFX', name: 'Optical Whoosh Snap', meta: 'A2 · Centered on Cut', anim: 'fx-whip' },
  { id: 'lumetri-match', cat: 'Color', name: 'Lumetri Auto-Match', meta: 'FilmCraft Face-Aware', anim: 'fx-leak' },
];
