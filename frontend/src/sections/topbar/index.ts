import { topBarMarkup } from './view';
import { bindTopBar } from './bindings';
import { bindTopBarEffects } from './effects';
import { bindUpdatePill } from './update_pill';

export function createTopBar(): HTMLElement {
  const el = document.createElement('header');
  el.className = 'topbar';
  el.innerHTML = topBarMarkup();
  bindTopBar(el); bindTopBarEffects(el); bindUpdatePill(el);
  return el;
}
