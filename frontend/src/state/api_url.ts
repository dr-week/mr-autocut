import { activeApiSig } from './api_sig';

export function apiUrl(path: string): string {
  const b = activeApiSig.value;
  return b && b !== 'same-origin' && b !== 'static-demo' ? `${b}${path}` : path;
}
