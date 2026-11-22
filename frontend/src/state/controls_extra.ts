import { signal } from '@zuari/signals';

export const toastSig = signal<string>('');
export const loggedEditsSig = signal<number>(0);
export const colorFilterSig = signal<string>('none');
