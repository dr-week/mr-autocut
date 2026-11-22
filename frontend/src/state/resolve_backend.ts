import { activeApiSig } from './api_sig';
import { backendCandidates } from './candidates';

export async function resolveBackend(): Promise<string> {
  for (const base of backendCandidates()) {
    try {
      const r = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(base.startsWith('https') ? 4000 : 1200) });
      if (r.ok) { activeApiSig.value = base || 'same-origin'; return base; }
    } catch { /* try next free host */ }
  }
  activeApiSig.value = 'static-demo';
  return '';
}
