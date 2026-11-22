import { segmentsSig, toggleSegment } from '../../state';

export function renderCutQueue(box: HTMLElement) {
  box.innerHTML = '';
  for (const s of segmentsSig.value) {
    const row = document.createElement('button');
    row.className = `queue-row ${s.enabled ? '' : 'disabled'}`;
    const tags = [s.scale > 1 ? `Zoom ${Math.round(s.scale * 100)}%` : '', s.transition ?? '', s.light_leak ? 'Leak' : '', s.sfx ? `SFX:${s.sfx}` : ''].filter(Boolean).join(' · ');
    row.innerHTML = `<div><strong>${s.label}</strong><small>${s.start.toFixed(2)}s→${s.end.toFixed(2)}s${tags ? ` · ${tags}` : ''}</small></div><span class="badge">${s.enabled ? 'ON' : 'SKIP'}</span>`;
    row.onclick = () => toggleSegment(s.index);
    box.appendChild(row);
  }
}
