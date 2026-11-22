import { effect } from '@zuari/signals';
import { bridgeAddrSig, cliCmdSig, filmoraPkgSig, jsonlSig, loggedEditsSig, notify, refreshScript, statsSig } from '../../state';
import { bindDraggableCard, makeCardHeader } from '../topbar/drag_card';
import { renderCutQueue } from './queue';

export function createBridgePanel(): HTMLElement {
  const el = document.createElement('aside'); el.className = 'panel zuari-card bridge';
  el.innerHTML = `${makeCardHeader('🔗 Queue & Bridge', 'Sync')}<div class="mini-stats" id="m-st"></div><div class="cut-queue" id="c-q"></div><div class="control"><input id="i-br" type="text" value="${bridgeAddrSig.value}" title="Bridge Address" /></div><div class="mini-code" id="c-cmd"></div><div class="bridge-footer"><button class="btn-ghost" id="b-flm-q" title="Copy Filmora JSON">📋 Filmora</button><button class="btn-ghost" id="b-cp" title="Copy FilmCraft JSONL">📋 JSONL</button></div>`;
  bindDraggableCard(el); el.querySelector<HTMLInputElement>('#i-br')!.onchange = (e) => { bridgeAddrSig.value = (e.target as HTMLInputElement).value.trim(); refreshScript(); };
  el.querySelector<HTMLButtonElement>('#b-cp')!.onclick = () => { navigator.clipboard.writeText(jsonlSig.value).catch(() => {}); notify('📋 JSONL Copied'); };
  el.querySelector<HTMLButtonElement>('#b-flm-q')!.onclick = () => { navigator.clipboard.writeText(filmoraPkgSig.value).catch(() => {}); notify(`📋 Filmora (${loggedEditsSig.value})`); };
  effect(() => { const st = statsSig.value; el.querySelector('#m-st')!.innerHTML = `<div class="stat"><small>⏱</small><strong>${st.kept}s</strong></div><div class="stat"><small>✂️</small><strong>-${st.removed}s</strong></div><div class="stat"><small>⚡</small><strong>${st.pct}%</strong></div>`; });
  effect(() => renderCutQueue(el.querySelector<HTMLElement>('#c-q')!));
  effect(() => { el.querySelector('#c-cmd')!.textContent = cliCmdSig.value || 'filmcraft-cli --demo run autocut.jsonl'; });
  return el;
}
