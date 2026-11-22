import { layoutSig } from './signals';
import type { LayoutMode } from './types';

export function setLayout(mode: LayoutMode) {
  layoutSig.value = mode;
  localStorage.setItem('mr_layout', mode);
}
