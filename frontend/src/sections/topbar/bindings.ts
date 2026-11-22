import { SEQUENCE_PRESETS, executeInFilmCraft, exportSequenceMp4, paletteOpenSig, refreshScript, sequenceSig, setLayout, uploadMediaFile } from '../../state';
import type { LayoutMode } from '../../state';
import { promptBackendUrl } from './backend_prompt';

export function bindTopBar(el: HTMLElement) {
  el.querySelectorAll<HTMLButtonElement>('[data-m]').forEach((b) => b.addEventListener('click', () => setLayout(b.dataset.m as LayoutMode)));
  el.querySelector<HTMLSelectElement>('#seq-select')!.addEventListener('change', (e) => { sequenceSig.value = { ...SEQUENCE_PRESETS[(e.target as HTMLSelectElement).value] }; refreshScript(); });
  el.querySelector<HTMLInputElement>('#media-upload')!.addEventListener('change', (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) uploadMediaFile(f); });
  el.querySelector('#btn-cmdk')!.addEventListener('click', () => (paletteOpenSig.value = true));
  el.querySelector('#btn-export')!.addEventListener('click', () => exportSequenceMp4());
  el.querySelector('#btn-send-fc')!.addEventListener('click', () => executeInFilmCraft());
  el.querySelector<HTMLElement>('#fc-status-pill')!.onclick = promptBackendUrl;
}
