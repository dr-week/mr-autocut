import { signal } from '@zuari/signals';
import { layoutSig } from './signals';

export const viewportSig = signal({ w: 1920, h: 1080, dpr: 1, posture: 'Desktop' });

export function initViewportSensor() {
  const measure = () => {
    const w = window.innerWidth, h = window.innerHeight, dpr = Number((window.devicePixelRatio || 1).toFixed(1));
    const posture = w < 820 || h > w * 1.15 ? 'VN-Phone' : (w >= 1800 ? 'Ultrawide' : 'Desktop');
    viewportSig.value = { w, h, dpr, posture };
    document.documentElement.setAttribute('data-posture', posture.toLowerCase());
    if (posture === 'VN-Phone' && layoutSig.value === 'studio') layoutSig.value = 'phone';
  };
  measure(); window.addEventListener('resize', measure);
}
