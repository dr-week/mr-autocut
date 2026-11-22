import { effect } from '@zuari/signals';
import { activeTabSig, ic, type InspectorTab } from '../../state';
import { bindDraggableCard, makeCardHeader } from '../topbar/drag_card';
import { renderVfxTab } from './tab_vfx';
import { renderAutoCutTab } from './tab_autocut';
import { renderAssetsTab } from './tab_assets';
import { renderFxTab } from './tab_fx';
import { renderColorTab } from './tab_color';
import { renderCaptionsTab } from './tab_captions';
import { renderDirectorTab } from './tab_director';

const TABS: [InspectorTab, string, string][] = [['vfx', 'sparkle', 'VFX'], ['autocut', 'scissors', 'Cut'], ['fx', 'film', 'YT'], ['color', 'palette', 'LUT'], ['assets', 'layers', 'Stock'], ['captions', 'msg', 'Text'], ['director', 'cmd', 'AI']];
const RENDERERS: Record<InspectorTab, (el: HTMLElement) => void> = { vfx: renderVfxTab, autocut: renderAutoCutTab, assets: renderAssetsTab, fx: renderFxTab, color: renderColorTab, captions: renderCaptionsTab, director: renderDirectorTab };
export function createInspectorPanel(): HTMLElement {
  const el = document.createElement('aside'); el.className = 'panel zuari-card inspector'; el.innerHTML = `${makeCardHeader('Studio', 'VFX', 'sparkle')}<div class="rail-tabs">${TABS.map(([id, g, l]) => `<button class="rail-tab" data-tab="${id}">${ic(g, 12)} ${l}</button>`).join('')}</div><div class="inspector-body"></div>`; const body = el.querySelector<HTMLElement>('.inspector-body')!; bindDraggableCard(el); el.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((b) => (b.onclick = () => (activeTabSig.value = b.dataset.tab as InspectorTab))); effect(() => { el.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === activeTabSig.value)); RENDERERS[activeTabSig.value](body); }); return el;
}
