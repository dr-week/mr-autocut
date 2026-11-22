import { effect } from '@zuari/signals';
import { paletteOpenSig } from '../../state';
import { renderPaletteList } from './render';
import { bindPaletteKeys } from './keys';

export function createCommandPalette(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'palette-backdrop';
  el.innerHTML = `<div class="palette-box"><input id="pal-q" placeholder="Type a command (Auto-Cut, 9:16, Dock, FilmCraft)..." /><div id="pal-list"></div></div>`;
  const input = el.querySelector<HTMLInputElement>('#pal-q')!, list = el.querySelector('#pal-list')!;
  input.addEventListener('input', () => renderPaletteList(list, input.value));
  el.addEventListener('click', (e) => { if (e.target === el) paletteOpenSig.value = false; });
  bindPaletteKeys();
  effect(() => { el.classList.toggle('open', paletteOpenSig.value); if (paletteOpenSig.value) { input.value = ''; renderPaletteList(list); input.focus(); } });
  return el;
}
