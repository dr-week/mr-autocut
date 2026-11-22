import { signal } from '@zuari/signals';
import type { FilmCraftStatus, FxCategory, InspectorTab, LayoutMode, MediaInfo, Segment, SequenceSpec } from './types';

export const layoutSig = signal<LayoutMode>((localStorage.getItem('mr_layout') as LayoutMode) || 'studio');
export const paletteOpenSig = signal<boolean>(false);
export const busySig = signal<boolean>(false);
export const statusSig = signal<FilmCraftStatus | null>(null);
export const sequenceSig = signal<SequenceSpec>({ width: 1920, height: 1080, fps: 30, fit_mode: 'fill' });
export const activeTabSig = signal<InspectorTab>('autocut');
export const mediaSig = signal<MediaInfo | null>(null);
export const waveformSig = signal<number[]>(Array.from({ length: 120 }, (_, i) => 0.15 + Math.abs(Math.sin(i * 0.27)) * 0.8));
export const segmentsSig = signal<Segment[]>([]);
export const sourceDurationSig = signal<number>(42.0);
export const playheadSig = signal<number>(0);
export const fxCatSig = signal<FxCategory>('All');
export const favFxSig = signal<string[]>(['punch-112', 'light-leak']);
