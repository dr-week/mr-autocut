import { effect } from '@zuari/signals';
import { activeApiSig, busySig, ic, layoutSig, mediaSig, sequenceSig, statusSig, viewportSig, zuariPresets } from '../../state';

export function bindTopBarEffects(el: HTMLElement) {
  effect(() => { el.querySelector('#seq-dim-pill')!.textContent = `Seq: ${sequenceSig.value.width}x${sequenceSig.value.height}`; });
  effect(() => { const v = viewportSig.value; el.querySelector('#dpi-pill')!.textContent = `${v.os} · ${v.w}x${v.h} (${v.dpr}x)`; });
  effect(() => { el.querySelector('#btn-theme')!.innerHTML = `${ic('palette', 14)}`; el.querySelector('#btn-theme')!.setAttribute('title', `Zuari Theme: ${zuariPresets.theme.value}`); });
  effect(() => { el.querySelector('#fc-status-pill')!.innerHTML = `<i class="dot"></i> ${statusSig.value?.cli_version ? 'FilmCraft CLI' : (activeApiSig.value === 'static-demo' ? 'Web Audio WASM' : 'Remote API')}`; });
  effect(() => { el.querySelector('#media-label')!.innerHTML = mediaSig.value?.filename ? `${ic('film', 14)}` : `${ic('plus', 14)}`; });
  effect(() => { el.querySelectorAll<HTMLButtonElement>('[data-m]').forEach((b) => b.classList.toggle('active', b.dataset.m === layoutSig.value)); });
  effect(() => { el.querySelector<HTMLButtonElement>('#btn-send-fc')!.disabled = busySig.value; });
}
