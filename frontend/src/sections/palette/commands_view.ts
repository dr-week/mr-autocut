import { SEQUENCE_PRESETS, activeTabSig, refreshScript, sequenceSig, setLayout } from '../../state';
import type { PaletteCmd } from './types';

export const VIEW_COMMANDS: PaletteCmd[] = [
  { label: 'Layout: Dock Panel (340px)', hint: 'Adobe UXP style', run: () => setLayout('dock') },
  { label: 'Layout: Wide Studio', hint: '3-column deck', run: () => setLayout('studio') },
  { label: 'Layout: Mini-HUD', hint: '1-row keyboard bar', run: () => setLayout('hud') },
  { label: 'Sequence: 9:16 Vertical Reel', hint: '1080×1920', run: () => { sequenceSig.value = { ...SEQUENCE_PRESETS['9:16 Reel'] }; refreshScript(); } },
  { label: 'Sequence: 16:9 HD Master', hint: '1920×1080', run: () => { sequenceSig.value = { ...SEQUENCE_PRESETS['16:9 HD'] }; refreshScript(); } },
  { label: 'Open Motion & Light Leaks FX', hint: 'Mr Horse Browser', run: () => { activeTabSig.value = 'fx'; } },
  { label: 'Open AI Director', hint: 'Free AI / Colab', run: () => { activeTabSig.value = 'director'; } },
];
