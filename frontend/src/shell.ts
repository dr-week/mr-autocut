import { effect } from '@zuari/signals';
import { layoutSig, toastSig } from './state';
import { createTopBar } from './sections/topbar';
import { createCommandPalette } from './sections/palette';
import { createInspectorPanel } from './sections/inspector';
import { createMonitorPanel } from './sections/monitor';
import { createBridgePanel } from './sections/bridge';
import { createTimelinePanel } from './sections/timeline';

export function createShell(): HTMLElement {
  const shell = document.createElement('div'), grid = document.createElement('div'), toast = document.createElement('div'), top = createTopBar();
  grid.className = 'studio-grid'; toast.className = 'toast'; grid.append(createInspectorPanel(), createMonitorPanel(), createBridgePanel());
  top.onpointerdown = (e) => { if (layoutSig.value !== 'float' || (e.target as HTMLElement).closest('button,select,input,label')) return; const r = shell.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top, mv = (ev: PointerEvent) => { shell.style.left = `${Math.max(4, ev.clientX - ox)}px`; shell.style.top = `${Math.max(4, ev.clientY - oy)}px`; }; window.addEventListener('pointermove', mv); window.addEventListener('pointerup', () => window.removeEventListener('pointermove', mv), { once: true }); };
  effect(() => { shell.className = `studio-shell mode-${layoutSig.value}`; if (layoutSig.value !== 'float') { shell.style.left = ''; shell.style.top = ''; } toast.textContent = toastSig.value; toast.classList.toggle('visible', Boolean(toastSig.value)); });
  shell.append(top, grid, createTimelinePanel(), createCommandPalette(), toast); return shell;
}
