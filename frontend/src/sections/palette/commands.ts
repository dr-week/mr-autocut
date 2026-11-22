import { activeTabSig, executeInFilmCraft, exportSequenceMp4, notify, runAnalyze } from '../../state';
import type { PaletteCmd } from './types';
import { optimizeQubo } from './qubo';
import { VIEW_COMMANDS } from './commands_view';
export type { PaletteCmd } from './types';

export const PALETTE_COMMANDS: PaletteCmd[] = [
  { label: 'Run Auto-Cut Analysis', hint: 'Silence + SFX + Leaks', run: () => runAnalyze() },
  { label: 'Run 3-Pass Auto-Improve', hint: 'Critic Pass 1 → 2 → 3', run: () => { activeTabSig.value = 'assets'; notify('Click Run 3-Pass Auto-Improve in Assets'); } },
  { label: 'Open Google Flow (AI B-Roll)', hint: 'labs.google/fx/tools/flow', run: () => window.open('https://labs.google/fx/tools/flow', '_blank') },
  { label: 'Optimize 15s Reel (QUBO)', hint: 'Quantum-inspired selector', run: () => optimizeQubo() },
  { label: 'Send Batch to FilmCraft', hint: 'filmcraft-cli --bridge', run: () => executeInFilmCraft() },
  { label: 'Export Sequence MP4', hint: 'Matches sequence size', run: () => exportSequenceMp4() },
  ...VIEW_COMMANDS,
];
