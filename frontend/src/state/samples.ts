import { applyVfxPrompt } from './run_vfx';
import { mediaSig, sequenceSig, sourceDurationSig } from './signals';

export const BUNDLED_SAMPLES = [
  { id: 'event', glyph: 'film', label: 'Event Reel', file: './samples/ref_event_master.mp4', dur: 6.0, w: 720, h: 1280, prompt: 'Car edit: phonk beat speed ramp 300%->40%, subject mask + cyan saber glow, text behind subject' },
  { id: 'retro', glyph: 'layers', label: 'Retro 9:16', file: './samples/ref_retro_reel.mp4', dur: 1.3, w: 1080, h: 1920, prompt: '3D bold text behind subject + YouTube retro film screen blend' },
  { id: 'leak', glyph: 'sparkle', label: 'Light Leak', file: './samples/ref_lightleak_sfx.mp4', dur: 1.1, w: 1080, h: 1920, prompt: 'Mask subject + neon edge saber glow + light leak transition' },
  { id: 'burn', glyph: 'flame', label: '4K Burn', file: './samples/ref_filmburn_4k.mp4', dur: 1.3, w: 1920, h: 1080, prompt: 'Gen Z hyper cut + film burn transition + whoosh sfx' },
];

export async function loadSampleVideo(sampleId: string = 'event') {
  const s = BUNDLED_SAMPLES.find((x) => x.id === sampleId) || BUNDLED_SAMPLES[0];
  sequenceSig.value = { width: s.w, height: s.h, fps: 24, fit_mode: 'fill' }; sourceDurationSig.value = s.dur;
  mediaSig.value = { media_id: 'browser', filename: s.label, path: s.file, duration: s.dur, width: s.w, height: s.h, fps: 24, has_audio: true, waveform: Array.from({ length: 120 }, (_, i) => 0.2 + Math.abs(Math.sin(i * 0.45)) * 0.75) };
  await applyVfxPrompt(s.prompt);
}
