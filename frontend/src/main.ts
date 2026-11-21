import './styles.css';
import { effect } from '@zuari/signals';
import { initStudio, toastSig } from './state';
import { createTopBar } from './sections/TopBar';
import { createInspectorPanel } from './sections/InspectorPanel';
import { createMonitorPanel } from './sections/MonitorPanel';
import { createBridgePanel } from './sections/BridgePanel';
import { createTimelinePanel } from './sections/TimelinePanel';

const root = document.getElementById('app')!;
const shell = document.createElement('div');
shell.className = 'studio-shell';

const grid = document.createElement('div');
grid.className = 'studio-grid';
grid.append(createInspectorPanel(), createMonitorPanel(), createBridgePanel());

const toast = document.createElement('div');
toast.className = 'toast';
effect(() => {
  const msg = toastSig.value;
  toast.textContent = msg;
  toast.classList.toggle('visible', Boolean(msg));
});

shell.append(createTopBar(), grid, createTimelinePanel(), toast);
root.appendChild(shell);

initStudio();
