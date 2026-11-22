import { effect } from '@zuari/signals';
import { bridgeAddrSig, cliCmdSig, jsonlSig, loggedEditsSig, notify, refreshScript, statsSig } from '../../state';
import { renderCutQueue } from './queue';

export function createBridgePanel(): HTMLElement {
  const el = document.createElement('aside');
  el.className = 'panel bridge';
  el.innerHTML = `<div class="section-label">Cut Queue & Bridge</div><div class="mini-stats" id="m-st"></div><div class="cut-queue" id="c-q"></div><div class="control"><label>--bridge Address</label><input id="i-br" type="text" value="${bridgeAddrSig.value}" /></div><div class="mini-code" id="c-cmd"></div><div class="bridge-footer"><span class="pill" id="l-p">Colab: 0</span><button class="btn-ghost" id="b-cp">Copy JSONL</button></div>`;
  el.querySelector<HTMLInputElement>('#i-br')!.onchange = (e) => { bridgeAddrSig.value = (e.target as HTMLInputElement).value.trim(); refreshScript(); };
  el.querySelector<HTMLButtonElement>('#b-cp')!.onclick = () => { navigator.clipboard.writeText(jsonlSig.value).catch(() => {}); notify('Copied FilmCraft JSONL'); };
  effect(() => { const st = statsSig.value; el.querySelector('#m-st')!.innerHTML = `<div class="stat"><small>Kept</small><strong>${st.kept}s</strong></div><div class="stat"><small>Trim</small><strong>-${st.removed}s</strong></div><div class="stat"><small>Gain</small><strong>${st.pct}%</strong></div>`; });
  effect(() => renderCutQueue(el.querySelector<HTMLElement>('#c-q')!));
  effect(() => { el.querySelector('#c-cmd')!.textContent = cliCmdSig.value || 'filmcraft-cli --demo run autocut.jsonl'; el.querySelector('#l-p')!.textContent = `Colab: ${loggedEditsSig.value}`; });
  return el;
}
