import { effect } from '@zuari/signals';
import { activeApiSig, busySig, layoutSig, mediaSig, sequenceSig, statusSig, viewportSig, zuariPresets } from '../../state';

export function bindTopBarEffects(el: HTMLElement) {
  effect(() => { el.querySelector('#seq-dim-pill')!.textContent = `${sequenceSig.value.width}×${sequenceSig.value.height}`; });
  effect(() => { const v = viewportSig.value; el.querySelector('#dpi-pill')!.textContent = `${v.w}×${v.h} · ${v.dpr}x`; });
  effect(() => { el.querySelector('#btn-theme')!.textContent = `◐ ${zuariPresets.theme.value}`; });
  effect(() => { el.querySelector('#fc-status-pill')!.innerHTML = `<i class="dot"></i> ${statusSig.value?.cli_version ? 'CLI' : (activeApiSig.value === 'static-demo' ? 'WASM' : 'API')}`; });
  effect(() => { el.querySelector('#media-label')!.textContent = mediaSig.value?.filename ? `🎬 ${mediaSig.value.filename.slice(0, 10)}` : '＋🎬'; });
  effect(() => { el.querySelectorAll<HTMLButtonElement>('[data-m]').forEach((b) => b.classList.toggle('active', b.dataset.m === layoutSig.value)); });
  effect(() => { el.querySelector<HTMLButtonElement>('#btn-send-fc')!.disabled = busySig.value; });
}
