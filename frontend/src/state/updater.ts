import { signal } from '@zuari/signals';
import { apiUrl } from './api';

export interface UpdateInfo { current_version: string; latest_version: string; update_available: boolean; release_url: string; }
export const updateSig = signal<UpdateInfo | null>(null);

export async function checkUpdates() {
  try {
    const r = await fetch(apiUrl('/api/updater/check'));
    if (r.ok) updateSig.value = await r.json();
  } catch { /* offline */ }
}
