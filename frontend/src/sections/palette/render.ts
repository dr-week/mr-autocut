import { paletteOpenSig } from '../../state';
import { PALETTE_COMMANDS } from './commands';

export function renderPaletteList(list: Element, q = '') {
  const items = PALETTE_COMMANDS.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  list.innerHTML = items.map((c, i) => `<button class="pal-item" data-i="${i}"><strong>${c.label}</strong><small>${c.hint}</small></button>`).join('');
  list.querySelectorAll<HTMLButtonElement>('.pal-item').forEach((b) => b.addEventListener('click', () => { items[Number(b.dataset.i)].run(); paletteOpenSig.value = false; }));
}
