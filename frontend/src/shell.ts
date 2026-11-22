import { effect } from '@zuari/signals';
import { layoutSig, toastSig } from './state';
import { createTopBar } from './sections/topbar';
import { createCommandPalette } from './sections/palette';
import { createInspectorPanel } from './sections/inspector';
import { createMonitorPanel } from './sections/monitor';
import { createBridgePanel } from './sections/bridge';
import { createTimelinePanel } from './sections/timeline';

export function createShell(): HTMLElement {
  const shell = document.createElement('div'), grid = document.createElement('div'), toast = document.createElement('div');
  grid.className = 'studio-grid'; toast.className = 'toast'; grid.append(createInspectorPanel(), createMonitorPanel(), createBridgePanel());
  effect(() => { shell.className = `studio-shell mode-${layoutSig.value}`; toast.textContent = toastSig.value; toast.classList.toggle('visible', Boolean(toastSig.value)); });
  shell.append(createTopBar(), grid, createTimelinePanel(), createCommandPalette(), toast);
  return shell;
}
