import { effect } from '@zuari/signals';
import {
  InspectorTab,
  activeTabSig,
  autoLightLeakSig,
  autoSfxSig,
  captionTextSig,
  directorOutputSig,
  directorPromptSig,
  minSilenceSig,
  notify,
  paddingSig,
  punchInSig,
  refreshScript,
  runAnalyze,
  segmentsSig,
  sequenceSig,
  silenceDbSig,
} from '../state';

const TABS: { id: InspectorTab; label: string }[] = [
  { id: 'autocut', label: 'Auto-Cut' },
  { id: 'assets', label: 'Assets' },
  { id: 'motion', label: 'Motion & Leaks' },
  { id: 'captions', label: 'Captions' },
  { id: 'director', label: 'AI Director' },
];

export function createInspectorPanel(): HTMLElement {
  const el = document.createElement('aside');
  el.className = 'panel inspector';

  const nav = document.createElement('div');
  nav.className = 'rail-tabs';
  for (const t of TABS) {
    const btn = document.createElement('button');
    btn.className = 'rail-tab';
    btn.dataset.tab = t.id;
    btn.textContent = t.label;
    btn.addEventListener('click', () => activeTabSig.value = t.id);
    nav.appendChild(btn);
  }

  const body = document.createElement('div');
  body.className = 'inspector-body';
  el.append(nav, body);

  effect(() => {
    const tab = activeTabSig.value;
    nav.querySelectorAll<HTMLButtonElement>('.rail-tab').forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });

    if (tab === 'autocut') {
      body.innerHTML = `
        <div class="section-label">Smart Silence & Pacing</div>
        <div class="control">
          <label>Silence Threshold <span id="val-db">${silenceDbSig.value} dB</span></label>
          <input id="rng-db" type="range" min="-55" max="-18" step="1" value="${silenceDbSig.value}" />
        </div>
        <div class="control">
          <label>Min Silence <span id="val-min">${minSilenceSig.value.toFixed(2)}s</span></label>
          <input id="rng-min" type="range" min="0.15" max="1.5" step="0.05" value="${minSilenceSig.value}" />
        </div>
        <div class="control">
          <label>Breath Padding <span id="val-pad">${paddingSig.value.toFixed(2)}s</span></label>
          <input id="rng-pad" type="range" min="0" max="0.3" step="0.02" value="${paddingSig.value}" />
        </div>
        <label class="toggle-row"><input id="chk-punch" type="checkbox" ${punchInSig.value ? 'checked' : ''} /> Alternate 112% Punch-In</label>
        <label class="toggle-row"><input id="chk-sfx" type="checkbox" ${autoSfxSig.value ? 'checked' : ''} /> Auto-SFX (Whoosh / Hit)</label>
        <label class="toggle-row"><input id="chk-leak" type="checkbox" ${autoLightLeakSig.value ? 'checked' : ''} /> Auto Light Leaks on Accents</label>
        <button class="btn-primary" id="btn-reanalyze">Run Auto-Cut Analysis</button>
      `;
      body.querySelector<HTMLInputElement>('#rng-db')!.addEventListener('input', (e) => {
        const v = Number((e.target as HTMLInputElement).value);
        silenceDbSig.value = v;
        body.querySelector('#val-db')!.textContent = `${v} dB`;
      });
      body.querySelector<HTMLInputElement>('#rng-min')!.addEventListener('input', (e) => {
        const v = Number((e.target as HTMLInputElement).value);
        minSilenceSig.value = v;
        body.querySelector('#val-min')!.textContent = `${v.toFixed(2)}s`;
      });
      body.querySelector<HTMLInputElement>('#rng-pad')!.addEventListener('input', (e) => {
        const v = Number((e.target as HTMLInputElement).value);
        paddingSig.value = v;
        body.querySelector('#val-pad')!.textContent = `${v.toFixed(2)}s`;
      });
      body.querySelector<HTMLInputElement>('#chk-punch')!.addEventListener('change', (e) =>
        punchInSig.value = (e.target as HTMLInputElement).checked,
      );
      body.querySelector<HTMLInputElement>('#chk-sfx')!.addEventListener('change', (e) =>
        autoSfxSig.value = (e.target as HTMLInputElement).checked,
      );
      body.querySelector<HTMLInputElement>('#chk-leak')!.addEventListener('change', (e) =>
        autoLightLeakSig.value = (e.target as HTMLInputElement).checked,
      );
      body.querySelector('#btn-reanalyze')!.addEventListener('click', () => runAnalyze());
    } else if (tab === 'assets') {
      body.innerHTML = `
        <div class="section-label">Project Folder Asset Scanner</div>
        <div class="control">
          <label>Folder Path (footage/ broll/ music/ sfx/ overlays/)</label>
          <input id="inp-root" type="text" placeholder="/path/to/project-assets" />
        </div>
        <button class="btn-primary" id="btn-scan">Scan Project Folder</button>
        <pre class="mini-code" id="scan-out">Point to any local folder to auto-index B-roll, SFX whooshes/risers, music, and light leaks.</pre>
      `;
      body.querySelector('#btn-scan')!.addEventListener('click', async () => {
        const root = body.querySelector<HTMLInputElement>('#inp-root')!.value.trim();
        if (!root) return notify('Enter a folder path');
        const res = await fetch(`/api/assets/scan?root=${encodeURIComponent(root)}`);
        const d = await res.json();
        body.querySelector('#scan-out')!.textContent =
          `Footage: ${d.footage.length} · B-Roll: ${d.broll.length}\nMusic: ${d.music.length} · SFX: ${d.sfx.length} · Overlays: ${d.overlays.length}`;
      });
    } else if (tab === 'motion') {
      body.innerHTML = `
        <div class="section-label">Mr Horse-Style Motion & Light Leaks</div>
        <div class="fx-list">
          <div class="fx-card"><strong>Micro Punch-In 112%</strong><small>Camera · Cubic-Out · Hides jump cuts</small></div>
          <div class="fx-card"><strong>Optical Whip Pan</strong><small>Transition · 0.24s · Synced with Whoosh SFX</small></div>
          <div class="fx-card"><strong>Warm Film Light Leak</strong><small>Overlay · Screen Blend · Centered on accents</small></div>
          <div class="fx-card"><strong>1-Frame Exposure Flash</strong><small>Transition · 0.12s · Hook & beat drops</small></div>
          <div class="fx-card"><strong>Lumetri Auto-Match</strong><small>Color · FilmCraft native face-aware match</small></div>
        </div>
      `;
    } else if (tab === 'captions') {
      body.innerHTML = `
        <div class="section-label">Lightweight Kinetic Captions (ASS)</div>
        <div class="control">
          <label>Hook Caption Preview (auto-scaled to sequence)</label>
          <input id="inp-cap" type="text" value="${captionTextSig.value}" />
        </div>
        <p class="hint">Captions scale automatically to the active sequence height (${sequenceSig.value.height}px) and burn cleanly via FFmpeg ASS.</p>
      `;
      body.querySelector<HTMLInputElement>('#inp-cap')!.addEventListener('input', (e) => {
        captionTextSig.value = (e.target as HTMLInputElement).value;
      });
    } else if (tab === 'director') {
      body.innerHTML = `
        <div class="section-label">AI Director (Free AI / Colab)</div>
        <div class="control">
          <label>What should the AI edit?</label>
          <textarea id="inp-dir" rows="3" placeholder="e.g. Make a punchy 30s edit, keep best hook, add light leaks on topic shifts...">${directorPromptSig.value}</textarea>
        </div>
        <button class="btn-primary" id="btn-gen-prompt">Copy Director Prompt for Free AI</button>
        <div class="control" style="margin-top:12px;">
          <label>Paste Structured JSON EditPlan</label>
          <textarea id="inp-json" rows="4" placeholder='{"segments": [...]}'>${directorOutputSig.value}</textarea>
        </div>
        <button class="btn-ghost" id="btn-apply-json" style="width:100%;">Apply JSON EditPlan</button>
      `;
      body.querySelector('#btn-gen-prompt')!.addEventListener('click', async () => {
        const inst = body.querySelector<HTMLTextAreaElement>('#inp-dir')!.value.trim() || 'Create a punchy edit';
        directorPromptSig.value = inst;
        const res = await fetch('/api/director/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instruction: inst,
            sequence: sequenceSig.value,
            segments: segmentsSig.value,
          }),
        });
        const d = await res.json();
        await navigator.clipboard.writeText(d.prompt).catch(() => {});
        notify('Director prompt copied — paste into Colab / Gemini / ChatGPT!');
      });
      body.querySelector('#btn-apply-json')!.addEventListener('click', async () => {
        const raw = body.querySelector<HTMLTextAreaElement>('#inp-json')!.value.trim();
        directorOutputSig.value = raw;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.segments)) {
            segmentsSig.value = parsed.segments.map((s: any, i: number) => ({ enabled: true, index: i + 1, ...s }));
            await refreshScript();
            notify(`Applied ${parsed.segments.length} AI Director cuts!`);
          }
        } catch {
          notify('Invalid JSON EditPlan');
        }
      });
    }
  });

  return el;
}
