import { effect } from '@zuari/signals';
import {
  captionTextSig,
  mediaSig,
  playheadSig,
  safeZonesSig,
  sequenceSig,
  sourceDurationSig,
} from '../state';

export function createMonitorPanel(): HTMLElement {
  const el = document.createElement('section');
  el.className = 'panel monitor';

  el.innerHTML = `
    <div class="monitor-header">
      <span class="section-label" style="margin:0;">Sequence Preview Monitor</span>
      <label class="toggle-row" style="margin:0;">
        <input id="chk-safe" type="checkbox" checked /> Safe Zones
      </label>
    </div>
    <div class="viewport-stage">
      <div class="viewport-frame" id="vp-frame">
        <video id="vp-video" playsinline></video>
        <div class="vp-placeholder" id="vp-empty">
          <strong>Sequence-Adaptive Viewport</strong>
          <span id="vp-ratio-text">1920 × 1080</span>
        </div>
        <div class="safe-zone-guide" id="vp-safe"></div>
        <div class="caption-overlay" id="vp-caption"></div>
      </div>
    </div>
    <div class="transport">
      <button class="btn-ghost" id="btn-play">Play / Pause</button>
      <span class="timecode" id="vp-tc">00:00.00 / 00:42.00</span>
    </div>
  `;

  const frame = el.querySelector<HTMLElement>('#vp-frame')!;
  const video = el.querySelector<HTMLVideoElement>('#vp-video')!;
  const empty = el.querySelector<HTMLElement>('#vp-empty')!;
  const ratioText = el.querySelector<HTMLElement>('#vp-ratio-text')!;
  const safe = el.querySelector<HTMLElement>('#vp-safe')!;
  const cap = el.querySelector<HTMLElement>('#vp-caption')!;
  const tc = el.querySelector<HTMLElement>('#vp-tc')!;

  el.querySelector<HTMLInputElement>('#chk-safe')!.addEventListener('change', (e) => {
    safeZonesSig.value = (e.target as HTMLInputElement).checked;
  });

  el.querySelector('#btn-play')!.addEventListener('click', () => {
    if (!mediaSig.value) return;
    if (video.paused) video.play();
    else video.pause();
  });

  video.addEventListener('timeupdate', () => playheadSig.value = video.currentTime);

  effect(() => {
    const seq = sequenceSig.value;
    frame.style.aspectRatio = `${seq.width} / ${seq.height}`;
    ratioText.textContent = `${seq.width} × ${seq.height} (${seq.fit_mode.toUpperCase()})`;
  });

  effect(() => {
    const m = mediaSig.value;
    if (m) {
      video.src = `/api/media/${m.media_id}/stream`;
      video.style.display = 'block';
      empty.style.display = 'none';
    } else {
      video.style.display = 'none';
      empty.style.display = 'flex';
    }
  });

  effect(() => {
    safe.style.display = safeZonesSig.value ? 'block' : 'none';
  });

  effect(() => {
    cap.textContent = captionTextSig.value;
  });

  effect(() => {
    const t = playheadSig.value;
    const d = sourceDurationSig.value;
    tc.textContent = `${t.toFixed(2)}s / ${d.toFixed(2)}s`;
  });

  return el;
}
