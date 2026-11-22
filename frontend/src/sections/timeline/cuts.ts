import { effect } from '@zuari/signals';
import { segmentsSig, sourceDurationSig } from '../../state';
import { cutBlock } from './cut_block';

export function bindCuts(el: HTMLElement) {
  effect(() => {
    const dur = Math.max(0.1, sourceDurationSig.value);
    const box = el.querySelector('#t-c')!; box.innerHTML = '';
    for (const s of segmentsSig.value) box.appendChild(cutBlock(s, dur));
  });
}
