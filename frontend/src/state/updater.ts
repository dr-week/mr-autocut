import { apiUrl } from './api';
import { updateSig } from './update_sig';
export * from './update_sig';

export async function checkUpdates() {
  try {
    const r = await fetch(apiUrl('/api/updater/check'));
    if (r.ok) updateSig.value = await r.json();
  } catch { /* offline */ }
}
