import { notify } from '../../state';

export function renderAssetsTab(body: HTMLElement) {
  body.innerHTML = `
    <div class="section-label">Project Folder Asset Scanner</div>
    <div class="control"><label>Folder (footage/ broll/ music/ sfx/ overlays/)</label><input id="inp-root" type="text" placeholder="/path/to/project" /></div>
    <button class="btn-primary" id="btn-scan">Scan Project Folder</button>
    <pre class="mini-code" id="scan-out">Indexes B-roll, SFX whooshes/risers, music & light leaks.</pre>`;
  body.querySelector<HTMLButtonElement>('#btn-scan')!.onclick = async () => {
    const root = body.querySelector<HTMLInputElement>('#inp-root')!.value.trim();
    if (!root) return notify('Enter a folder path');
    const d = await fetch(`/api/assets/scan?root=${encodeURIComponent(root)}`).then((r) => r.json());
    body.querySelector('#scan-out')!.textContent = `Footage:${d.footage.length} B-Roll:${d.broll.length} Music:${d.music.length} SFX:${d.sfx.length} Leaks:${d.overlays.length}`;
  };
}
