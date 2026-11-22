import { signal } from '@zuari/signals';

export const activeApiSig = signal<string>('');
const CANDIDATES = () => [localStorage.getItem('mr_api_url') || '', '', 'http://127.0.0.1:8000'].filter((v, i, a) => a.indexOf(v) === i);

export async function resolveBackend(): Promise<string> {
  for (const base of CANDIDATES()) {
    try {
      const r = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(1200) });
      if (r.ok) { activeApiSig.value = base || 'same-origin'; return base; }
    } catch { /* try next free host */ }
  }
  activeApiSig.value = 'static-demo';
  return '';
}

export function apiUrl(path: string): string {
  const b = activeApiSig.value;
  return b && b !== 'same-origin' && b !== 'static-demo' ? `${b}${path}` : path;
}
