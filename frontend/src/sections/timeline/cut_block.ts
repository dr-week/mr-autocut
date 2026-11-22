import { toggleSegment } from '../../state';
import type { Segment } from '../../state';

export function cutBlock(s: Segment, dur: number): HTMLElement {
  const b = document.createElement('div');
  b.className = `seg-block ${!s.enabled ? 'skipped' : s.kind === 'hook' ? 'hook' : s.scale > 1 ? 'punch' : ''}`;
  b.style.left = `${(s.start / dur) * 100}%`; b.style.width = `${Math.max(1.8, (s.duration / dur) * 100)}%`;
  b.innerHTML = `<span>${s.label}</span>${s.light_leak ? '<i class="leak-dot"></i>' : ''}`;
  b.onclick = () => toggleSegment(s.index);
  return b;
}
