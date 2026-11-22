import { signal } from '@zuari/signals';
import { layoutSig } from './signals';
import type { LayoutMode } from './types';

export const viewportSig = signal({ w: 1920, h: 1080, dpr: 1, os: 'Desktop', posture: 'Desktop' });

export function initViewportSensor() {
  const qm = new URLSearchParams(window.location.search).get('mode') as LayoutMode | null; if (qm) layoutSig.value = qm;
  const measure = () => {
    const w = window.innerWidth, h = window.innerHeight, dpr = Number((window.devicePixelRatio || 1).toFixed(1)), ua = navigator.userAgent;
    const os = /Android/i.test(ua) ? 'Android APK' : (/iPhone|iPad/i.test(ua) ? 'iOS' : (/Win/i.test(ua) ? 'Windows' : (/Mac/i.test(ua) ? 'macOS' : 'Linux')));
    const posture = os === 'Android APK' || w < 820 || h > w * 1.15 ? 'Android' : (w >= 1800 ? 'Ultrawide' : 'Desktop');
    viewportSig.value = { w, h, dpr, os, posture }; document.documentElement.setAttribute('data-os', os.toLowerCase().split(' ')[0]); document.documentElement.setAttribute('data-posture', posture.toLowerCase());
    if (!qm && posture === 'Android' && layoutSig.value === 'studio') layoutSig.value = 'phone';
  };
  measure(); window.addEventListener('resize', measure);
}
