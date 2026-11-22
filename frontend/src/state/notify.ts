import { toastSig } from './controls';

export function notify(msg: string) {
  toastSig.value = msg;
  setTimeout(() => { if (toastSig.value === msg) toastSig.value = ''; }, 2400);
}
