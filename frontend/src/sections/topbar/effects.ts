import { effect } from '@zuari/signals';
import { activeApiSig, busySig, layoutSig, mediaSig, sequenceSig, statusSig } from '../../state';

export function bindTopBarEffects(el: HTMLElement) {
  effect(() => { el.querySelector('#seq-dim-pill')!.textContent = `${sequenceSig.value.width}×${sequenceSig.value.height}`; });
  effect(() => { el.querySelector('#fc-status-pill')!.innerHTML = `<i class="dot"></i> ${statusSig.value?.cli_version ?? (activeApiSig.value === 'static-demo' ? 'Browser WASM' : activeApiSig.value || 'CLI')}`; });
  effect(() => { el.querySelector('#media-label')!.textContent = mediaSig.value?.filename ?? '+ Media'; });
  effect(() => { el.querySelectorAll<HTMLButtonElement>('[data-m]').forEach((b) => b.classList.toggle('active', b.dataset.m === layoutSig.value)); });
  effect(() => { el.querySelector<HTMLButtonElement>('#btn-send-fc')!.disabled = busySig.value; });
}
