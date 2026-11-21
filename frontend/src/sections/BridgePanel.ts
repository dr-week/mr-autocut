import { effect } from '@zuari/signals';
import {
  bridgeAddrSig,
  cliCmdSig,
  jsonlSig,
  loggedEditsSig,
  notify,
  refreshScript,
  segmentsSig,
  statsSig,
  toggleSegment,
} from '../state';

export function createBridgePanel(): HTMLElement {
  const el = document.createElement('aside');
  el.className = 'panel bridge';

  el.innerHTML = `
    <div class="section-label">Cut Queue & FilmCraft Bridge</div>
    <div class="mini-stats" id="mini-stats"></div>
    <div class="cut-queue" id="cut-queue"></div>

    <div class="bridge-box">
      <div class="control">
        <label>FilmCraft --bridge Address</label>
        <input id="inp-bridge" type="text" value="${bridgeAddrSig.value}" placeholder="127.0.0.1:9001" />
      </div>
      <div class="mini-code" id="cli-cmd"></div>
      <div class="bridge-footer">
        <span class="pill" id="learn-pill">Colab Edits Logged: 0</span>
        <button class="btn-ghost" id="btn-copy-jsonl">Copy JSONL</button>
      </div>
    </div>
  `;

  const statsBox = el.querySelector('#mini-stats')!;
  const queueBox = el.querySelector('#cut-queue')!;
  const cliBox = el.querySelector('#cli-cmd')!;
  const learnPill = el.querySelector('#learn-pill')!;

  el.querySelector<HTMLInputElement>('#inp-bridge')!.addEventListener('change', (e) => {
    bridgeAddrSig.value = (e.target as HTMLInputElement).value.trim();
    refreshScript();
  });

  el.querySelector('#btn-copy-jsonl')!.addEventListener('click', () => {
    navigator.clipboard.writeText(jsonlSig.value).catch(() => {});
    notify('Copied FilmCraft JSONL script');
  });

  effect(() => {
    const st = statsSig.value;
    statsBox.innerHTML = `
      <div class="stat"><small>Kept</small><strong>${st.kept}s</strong></div>
      <div class="stat"><small>Trimmed</small><strong>-${st.removed}s</strong></div>
      <div class="stat"><small>Gain</small><strong>${st.pct}%</strong></div>
    `;
  });

  effect(() => {
    const segs = segmentsSig.value;
    queueBox.innerHTML = '';
    for (const s of segs) {
      const row = document.createElement('button');
      row.className = `queue-row ${s.enabled ? '' : 'disabled'}`;
      const tags = [
        s.scale > 1 ? `Zoom ${Math.round(s.scale * 100)}%` : '',
        s.transition ? s.transition : '',
        s.light_leak ? 'Leak' : '',
        s.sfx ? `SFX:${s.sfx}` : '',
      ]
        .filter(Boolean)
        .join(' · ');
      row.innerHTML = `
        <div>
          <strong>${s.label}</strong>
          <small>${s.start.toFixed(2)}s → ${s.end.toFixed(2)}s${tags ? ` · ${tags}` : ''}</small>
        </div>
        <span class="badge">${s.enabled ? 'ON' : 'SKIP'}</span>
      `;
      row.addEventListener('click', () => toggleSegment(s.index));
      queueBox.appendChild(row);
    }
  });

  effect(() => {
    cliBox.textContent = cliCmdSig.value || 'filmcraft-cli --demo run autocut.jsonl';
  });

  effect(() => {
    learnPill.textContent = `Colab Edits: ${loggedEditsSig.value}`;
  });

  return el;
}
