import { paletteOpenSig } from '../../state';

export function bindPaletteKeys() {
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); paletteOpenSig.value = !paletteOpenSig.value; }
    else if (e.key === 'Escape') paletteOpenSig.value = false;
  });
}
