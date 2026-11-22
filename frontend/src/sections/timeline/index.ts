import { bindDraggableCard } from '../topbar/drag_card';
import { TIMELINE_MARKUP } from './markup';
import { bindWaveform } from './waveform';
import { bindCuts } from './cuts';
import { bindPlayhead } from './playhead';

export function createTimelinePanel(): HTMLElement {
  const el = document.createElement('footer');
  el.className = 'panel zuari-card timeline-panel';
  el.innerHTML = TIMELINE_MARKUP;
  bindDraggableCard(el); bindWaveform(el); bindCuts(el); bindPlayhead(el);
  return el;
}
