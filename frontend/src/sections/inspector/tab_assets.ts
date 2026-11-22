import { apiUrl, notify, refreshScript, segmentsSig, sequenceSig } from '../../state';

export function renderAssetsTab(body: HTMLElement) {
  body.innerHTML = `
    <div class="section-label">Project Folder & Free Asset Hub</div>
    <div class="control"><label>Local Folder (footage/ broll/ music/ sfx/ overlays/)</label><input id="inp-root" type="text" placeholder="/path/to/project" /></div>
    <div class="bridge-footer"><button class="btn-primary" id="btn-scan">Scan Folder</button><button class="btn-ghost" id="btn-flow">Open Google Flow</button></div>
    <div class="bridge-footer" style="margin-top:8px;"><button class="btn-primary" id="btn-mp" style="width:100%;">Run 3-Pass Auto-Improve</button></div>
    <pre class="mini-code" id="scan-out">Free Sources: Google Flow · Pexels · Pixabay · Freesound · Openverse</pre>`;
  body.querySelector<HTMLButtonElement>('#btn-scan')!.onclick = async () => {
    const root = body.querySelector<HTMLInputElement>('#inp-root')!.value.trim();
    if (!root) return notify('Enter a folder path');
    const d = await fetch(apiUrl(`/api/assets/scan?root=${encodeURIComponent(root)}`)).then((r) => r.json());
    body.querySelector('#scan-out')!.textContent = `Footage:${d.footage.length} B-Roll:${d.broll.length} Music:${d.music.length} SFX:${d.sfx.length} Leaks:${d.overlays.length}`;
  };
  body.querySelector<HTMLButtonElement>('#btn-flow')!.onclick = () => {
    const s = sequenceSig.value, aspect = s.height > s.width ? '9:16' : '16:9';
    navigator.clipboard.writeText(`Cinematic B-roll cutaway, ${aspect} framing, smooth camera motion, 4k photorealistic`).catch(() => {});
    window.open('https://labs.google/fx/tools/flow', '_blank'); notify('Copied Flow prompt & opened Google Flow!');
  };
  body.querySelector<HTMLButtonElement>('#btn-mp')!.onclick = async () => {
    const d = await fetch(apiUrl('/api/multipass/improve?max_passes=3'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(segmentsSig.value) }).then((r) => r.json()).catch(() => null);
    if (d?.passes?.length) { const last = d.passes[d.passes.length - 1]; segmentsSig.value = last.segments; await refreshScript(); body.querySelector('#scan-out')!.textContent = d.passes.map((p: any) => `Pass ${p.pass_num}: ${p.score}/100 · ${p.fixes_applied[0]}`).join('\n'); notify(`3-Pass Complete: ${last.score}/100!`); }
    else notify('3-Pass Auto-Improve ready (connect backend)');
  };
}
