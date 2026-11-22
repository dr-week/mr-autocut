import { SEQUENCE_PRESETS, activeTabSig, executeInFilmCraft, exportSequenceMp4, refreshScript, runAnalyze, sequenceSig, setLayout } from '../../state';

export interface PaletteCmd { label: string; hint: string; run: () => void; }

export const PALETTE_COMMANDS: PaletteCmd[] = [
  { label: 'Run Auto-Cut Analysis', hint: 'Silence + SFX + Leaks', run: () => runAnalyze() },
  { label: 'Send Batch to FilmCraft', hint: 'filmcraft-cli --bridge', run: () => executeInFilmCraft() },
  { label: 'Export Sequence MP4', hint: 'Matches sequence size', run: () => exportSequenceMp4() },
  { label: 'Layout: Dock Panel (340px)', hint: 'Adobe UXP style', run: () => setLayout('dock') },
  { label: 'Layout: Wide Studio', hint: '3-column deck', run: () => setLayout('studio') },
  { label: 'Layout: Mini-HUD', hint: '1-row keyboard bar', run: () => setLayout('hud') },
  { label: 'Sequence: 9:16 Vertical Reel', hint: '1080×1920', run: () => { sequenceSig.value = { ...SEQUENCE_PRESETS['9:16 Reel'] }; refreshScript(); } },
  { label: 'Sequence: 16:9 HD Master', hint: '1920×1080', run: () => { sequenceSig.value = { ...SEQUENCE_PRESETS['16:9 HD'] }; refreshScript(); } },
  { label: 'Open Motion & Light Leaks FX', hint: 'Mr Horse Browser', run: () => { activeTabSig.value = 'fx'; } },
  { label: 'Open AI Director', hint: 'Free AI / Colab', run: () => { activeTabSig.value = 'director'; } },
];
