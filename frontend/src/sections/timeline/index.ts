import { effect } from '@zuari/signals';
import { playheadSig, segmentsSig, sourceDurationSig, toggleSegment, waveformSig } from '../../state';

export function createTimelinePanel(): HTMLElement {
  const el = document.createElement('footer');
  el.className = 'panel timeline-panel';
  el.innerHTML = `<div class="timeline-head"><span class="section-label" style="margin:0;">120 FPS Waveform Timeline</span><span class="hint" style="margin:0;">Click cuts to toggle · logs to Colab</span></div><div class="timeline-track"><div class="waveform-bars" id="t-w"></div><div class="cut-layer" id="t-c"></div><div class="playhead" id="t-h"></div></div>`;
  effect(() => { el.querySelector('#t-w')!.innerHTML = waveformSig.value.map((p) => `<span class="wbar" style="height:${Math.round(p * 100)}%"></span>`).join(''); });
  effect(() => {
    const dur = Math.max(0.1, sourceDurationSig.value);
    const box = el.querySelector('#t-c')!; box.innerHTML = '';
    for (const s of segmentsSig.value) {
      const b = document.createElement('div');
      b.className = `seg-block ${!s.enabled ? 'skipped' : s.kind === 'hook' ? 'hook' : s.scale > 1 ? 'punch' : ''}`;
      b.style.left = `${(s.start / dur) * 100}%`; b.style.width = `${Math.max(1.8, (s.duration / dur) * 100)}%`;
      b.innerHTML = `<span>${s.label}</span>${s.light_leak ? '<i class="leak-dot"></i>' : ''}`;
      b.onclick = () => toggleSegment(s.index); box.appendChild(b);
    }
  });
  effect(() => { el.querySelector<HTMLElement>('#t-h')!.style.left = `${Math.min(100, (playheadSig.value / Math.max(0.1, sourceDurationSig.value)) * 100)}%`; });
  return el;
}
