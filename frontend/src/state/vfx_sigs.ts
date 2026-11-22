import { signal } from '@zuari/signals';

export const vfxPromptSig = signal('Car edit: phonk beat speed ramp 300%->40%, subject mask + cyan saber glow, text behind car, YouTube flash transition');
export const vfxScriptSig = signal('VELOCITY\nNO CUT CAR EDIT\nPURE ADRENALINE');
export const textBehindSig = signal<string | null>('VELOCITY');
export const maskGlowSig = signal(true);
export const speedRampSig = signal('300% → 40% Optical Flow');
export const vfxTagsSig = signal<string[]>(['Speed Ramp (300%->40%)', 'Subject Mask + Saber Glow', "Text Behind Subject ('VELOCITY')", 'Camera Shake + RGB Split']);
export const filmoraPkgSig = signal<string>('{"target":["Filmora","FilmCraft","Premiere"],"speed_curve":"velocity_300_40"}');
