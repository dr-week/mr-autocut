import { effect } from '@zuari/signals';
import { paletteOpenSig } from '../../state';
import { PALETTE_COMMANDS } from './commands';

export function createCommandPalette(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'palette-backdrop';
  el.innerHTML = `<div class="palette-box"><input id="pal-q" placeholder="Type a command (Auto-Cut, 9:16, Dock, FilmCraft)..." /><div id="pal-list"></div></div>`;
  const input = el.querySelector<HTMLInputElement>('#pal-q')!;
  const list = el.querySelector('#pal-list')!;
  const render = (q = '') => {
    const items = PALETTE_COMMANDS.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
    list.innerHTML = items.map((c, i) => `<button class="pal-item" data-i="${i}"><strong>${c.label}</strong><small>${c.hint}</small></button>`).join('');
    list.querySelectorAll<HTMLButtonElement>('.pal-item').forEach((b) => b.addEventListener('click', () => { items[Number(b.dataset.i)].run(); paletteOpenSig.value = false; }));
  };
  input.addEventListener('input', () => render(input.value));
  el.addEventListener('click', (e) => { if (e.target === el) paletteOpenSig.value = false; });
  window.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); paletteOpenSig.value = !paletteOpenSig.value; } else if (e.key === 'Escape') paletteOpenSig.value = false; });
  effect(() => { el.classList.toggle('open', paletteOpenSig.value); if (paletteOpenSig.value) { input.value = ''; render(); input.focus(); } });
  return el;
}
