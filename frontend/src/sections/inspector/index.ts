import { effect } from '@zuari/signals';
import { activeTabSig, type InspectorTab } from '../../state';
import { renderAutoCutTab } from './tab_autocut';
import { renderAssetsTab } from './tab_assets';
import { renderFxTab } from './tab_fx';
import { renderColorTab } from './tab_color';
import { renderCaptionsTab } from './tab_captions';
import { renderDirectorTab } from './tab_director';

const TABS: [InspectorTab, string][] = [['autocut', 'Auto-Cut'], ['assets', 'Assets'], ['fx', 'FX'], ['color', 'Color'], ['captions', 'Captions'], ['director', 'AI']];
const RENDERERS: Record<InspectorTab, (el: HTMLElement) => void> = { autocut: renderAutoCutTab, assets: renderAssetsTab, fx: renderFxTab, color: renderColorTab, captions: renderCaptionsTab, director: renderDirectorTab };

export function createInspectorPanel(): HTMLElement {
  const el = document.createElement('aside'); el.className = 'panel inspector'; el.innerHTML = `<div class="rail-tabs">${TABS.map(([id, l]) => `<button class="rail-tab" data-tab="${id}">${l}</button>`).join('')}</div><div class="inspector-body"></div>`;
  const body = el.querySelector<HTMLElement>('.inspector-body')!; el.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((b) => (b.onclick = () => (activeTabSig.value = b.dataset.tab as InspectorTab)));
  effect(() => { el.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === activeTabSig.value)); RENDERERS[activeTabSig.value](body); }); return el;
}
