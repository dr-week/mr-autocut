import { segmentsSig, toggleSegment } from '../../state';

export function renderCutQueue(qEl: HTMLElement) {
  qEl.innerHTML = segmentsSig.value
    .map((s) => `<button class="queue-row ${s.enabled ? '' : 'disabled'}" data-i="${s.index}"><div><strong>${s.label}</strong><small>${s.start.toFixed(1)}s–${s.end.toFixed(1)}s</small></div><span class="badge">${s.enabled ? 'ON' : 'OFF'}</span></button>`)
    .join('');
  qEl.querySelectorAll<HTMLButtonElement>('[data-i]').forEach((b) => (b.onclick = () => toggleSegment(Number(b.dataset.i))));
}
