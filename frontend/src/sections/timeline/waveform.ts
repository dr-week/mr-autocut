import { effect } from '@zuari/signals';
import { waveformSig } from '../../state';

export function bindWaveform(el: HTMLElement) {
  effect(() => { el.querySelector('#t-w')!.innerHTML = waveformSig.value.map((p) => `<span class="wbar" style="height:${Math.round(p * 100)}%"></span>`).join(''); });
}
