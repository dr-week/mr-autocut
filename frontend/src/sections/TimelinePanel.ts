import { effect } from '@zuari/signals';
import {
  playheadSig,
  segmentsSig,
  sourceDurationSig,
  toggleSegment,
  waveformSig,
} from '../state';

export function createTimelinePanel(): HTMLElement {
  const el = document.createElement('footer');
  el.className = 'panel timeline-panel';

  el.innerHTML = `
    <div class="timeline-head">
      <span class="section-label" style="margin:0;">120 FPS Waveform & Smart Multi-Track Timeline</span>
      <span class="hint" style="margin:0;">Click any cut block to toggle keep/skip (logs to Colab style trainer)</span>
    </div>
    <div class="timeline-track" id="tl-track">
      <div class="waveform-bars" id="tl-wave"></div>
      <div class="cut-layer" id="tl-cuts"></div>
      <div class="playhead" id="tl-head"></div>
    </div>
  `;

  const waveEl = el.querySelector('#tl-wave')!;
  const cutsEl = el.querySelector('#tl-cuts')!;
  const headEl = el.querySelector<HTMLElement>('#tl-head')!;

  effect(() => {
    const peaks = waveformSig.value;
    waveEl.innerHTML = peaks
      .map((p) => `<span class="wbar" style="height:${Math.round(p * 100)}%"></span>`)
      .join('');
  });

  effect(() => {
    const segs = segmentsSig.value;
    const dur = Math.max(0.1, sourceDurationSig.value);
    cutsEl.innerHTML = '';
    for (const s of segs) {
      const block = document.createElement('div');
      const cls = ['seg-block'];
      if (!s.enabled) cls.push('skipped');
      else if (s.kind === 'hook') cls.push('hook');
      else if (s.scale > 1) cls.push('punch');
      block.className = cls.join(' ');
      block.style.left = `${(s.start / dur) * 100}%`;
      block.style.width = `${Math.max(1.8, (s.duration / dur) * 100)}%`;
      block.title = `${s.label} (${s.start.toFixed(2)}s - ${s.end.toFixed(2)}s)`;
      block.innerHTML = `<span>${s.label}</span>${s.light_leak ? '<i class="leak-dot"></i>' : ''}`;
      block.addEventListener('click', () => toggleSegment(s.index));
      cutsEl.appendChild(block);
    }
  });

  effect(() => {
    const dur = Math.max(0.1, sourceDurationSig.value);
    const pct = Math.min(100, Math.max(0, (playheadSig.value / dur) * 100));
    headEl.style.left = `${pct}%`;
  });

  return el;
}
