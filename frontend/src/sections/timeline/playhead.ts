import { effect } from '@zuari/signals';
import { playheadSig, sourceDurationSig } from '../../state';

export function bindPlayhead(el: HTMLElement) {
  effect(() => { el.querySelector<HTMLElement>('#t-h')!.style.left = `${Math.min(100, (playheadSig.value / Math.max(0.1, sourceDurationSig.value)) * 100)}%`; });
}
