import { signal } from '@zuari/signals';

export interface UpdateInfo { current_version: string; latest_version: string; update_available: boolean; release_url: string; }
export const updateSig = signal<UpdateInfo | null>(null);
