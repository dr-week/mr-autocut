import { effect } from '@zuari/signals';
import { SEQUENCE_PRESETS, activeApiSig, busySig, executeInFilmCraft, exportSequenceMp4, layoutSig, mediaSig, notify, paletteOpenSig, refreshScript, resolveBackend, sequenceSig, setLayout, statusSig, uploadMediaFile } from '../../state';
import type { LayoutMode } from '../../state';
import { topBarMarkup } from './markup';

export function createTopBar(): HTMLElement {
  const el = document.createElement('header');
  el.className = 'topbar';
  el.innerHTML = topBarMarkup();
  el.querySelectorAll<HTMLButtonElement>('[data-m]').forEach((b) => b.addEventListener('click', () => setLayout(b.dataset.m as LayoutMode)));
  el.querySelector<HTMLSelectElement>('#seq-select')!.addEventListener('change', (e) => { sequenceSig.value = { ...SEQUENCE_PRESETS[(e.target as HTMLSelectElement).value] }; refreshScript(); });
  el.querySelector<HTMLInputElement>('#media-upload')!.addEventListener('change', (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) uploadMediaFile(f); });
  el.querySelector('#btn-cmdk')!.addEventListener('click', () => (paletteOpenSig.value = true));
  el.querySelector('#btn-export')!.addEventListener('click', () => exportSequenceMp4());
  el.querySelector('#btn-send-fc')!.addEventListener('click', () => executeInFilmCraft());
  el.querySelector<HTMLElement>('#fc-status-pill')!.onclick = async () => { const u = prompt('Custom Backend URL (HF Space / Render / Colab / Local):', localStorage.getItem('mr_api_url') || ''); if (u !== null) { localStorage.setItem('mr_api_url', u.trim()); await resolveBackend(); notify(`Engine: ${activeApiSig.value}`); } };
  effect(() => { el.querySelector('#seq-dim-pill')!.textContent = `${sequenceSig.value.width}×${sequenceSig.value.height}`; });
  effect(() => { el.querySelector('#fc-status-pill')!.innerHTML = `<i class="dot"></i> ${statusSig.value?.cli_version ?? (activeApiSig.value === 'static-demo' ? 'Browser WASM' : activeApiSig.value || 'CLI')}`; });
  effect(() => { el.querySelector('#media-label')!.textContent = mediaSig.value?.filename ?? '+ Media'; });
  effect(() => { el.querySelectorAll<HTMLButtonElement>('[data-m]').forEach((b) => b.classList.toggle('active', b.dataset.m === layoutSig.value)); });
  effect(() => { el.querySelector<HTMLButtonElement>('#btn-send-fc')!.disabled = busySig.value; });
  return el;
}
