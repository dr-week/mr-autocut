import { signal } from '@zuari/signals';

export const safeZonesSig = signal<boolean>(true);
export const silenceDbSig = signal<number>(-32);
export const minSilenceSig = signal<number>(0.28);
export const paddingSig = signal<number>(0.06);
export const punchInSig = signal<boolean>(true);
export const autoSfxSig = signal<boolean>(true);
export const autoLightLeakSig = signal<boolean>(true);
export const fxSearchSig = signal<string>('');
export const captionTextSig = signal<string>('MR-AUTOCUT · SEQUENCE ADAPTIVE');
export const bridgeAddrSig = signal<string>('127.0.0.1:9001');
export const jsonlSig = signal<string>('');
export const cliCmdSig = signal<string>('');
export * from './controls_extra';
export * from './stats';
