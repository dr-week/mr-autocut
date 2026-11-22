import { effect } from '@zuari/signals';
import { bridgeAddrSig, cliCmdSig, filmoraPkgSig, ic, jsonlSig, notify, refreshScript, statsSig } from '../../state';
import { bindDraggableCard, makeCardHeader } from '../topbar/drag_card';
import { renderCutQueue } from './queue';

export function createBridgePanel(): HTMLElement {
  const el = document.createElement('aside'); el.className = 'panel zuari-card bridge';
  el.innerHTML = `${makeCardHeader('Cuts', '0s', 'scissors')}<div class="cut-queue" id="c-q"></div><div class="bridge-footer"><button class="btn-primary" id="b-flm-q" title="Copy Filmora Package">${ic('copy', 12)} Filmora</button><button class="btn-ghost" id="b-cp" title="Copy FilmCraft JSONL">${ic('copy', 12)} JSONL</button></div><details class="sub-box"><summary>${ic('tuner', 12)} Bridge & CLI Diagnostics</summary><div class="sub-body"><div class="control"><input id="i-br" type="text" value="${bridgeAddrSig.value}" title="Bridge Address" /></div><div class="mini-code" id="c-cmd"></div></div></details>`;
  bindDraggableCard(el); el.querySelector<HTMLInputElement>('#i-br')!.onchange = (e) => { bridgeAddrSig.value = (e.target as HTMLInputElement).value.trim(); refreshScript(); };
  el.querySelector<HTMLButtonElement>('#b-cp')!.onclick = () => { navigator.clipboard.writeText(jsonlSig.value).catch(() => {}); notify('JSONL Copied'); };
  el.querySelector<HTMLButtonElement>('#b-flm-q')!.onclick = () => { navigator.clipboard.writeText(filmoraPkgSig.value).catch(() => {}); notify('Filmora Copied'); };
  effect(() => { const st = statsSig.value; el.querySelector('.badge')!.textContent = `${st.kept}s (-${st.pct}%)`; });
  effect(() => renderCutQueue(el.querySelector<HTMLElement>('#c-q')!));
  effect(() => { el.querySelector('#c-cmd')!.textContent = cliCmdSig.value || 'filmcraft-cli --demo run autocut.jsonl'; });
  return el;
}
