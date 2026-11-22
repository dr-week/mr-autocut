export type LayoutMode = 'studio' | 'dock' | 'float' | 'phone' | 'hud';
export type InspectorTab = 'vfx' | 'autocut' | 'assets' | 'fx' | 'color' | 'captions' | 'director';
export type FxCategory = 'All' | 'Camera' | 'Transition' | 'Light Leak' | 'SFX' | 'Color';

export interface SequenceSpec { width: number; height: number; fps: number; fit_mode: 'fill' | 'fit'; }
export interface FilmCraftStatus { cli_available: boolean; cli_version: string | null; ffmpeg_available: boolean; }
export interface MediaInfo {
  media_id: string; filename: string; path: string; duration: number;
  width: number; height: number; fps: number; has_audio: boolean; waveform: number[];
}
export interface Segment {
  index: number; start: number; end: number; duration: number; kind: string; scale: number;
  transition?: string | null; light_leak?: boolean; sfx?: string | null; enabled: boolean; label: string;
}
export interface FxItem { id: string; cat: FxCategory; name: string; meta: string; anim: string; }
