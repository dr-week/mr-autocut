import { apiUrl, notify, refreshScript, segmentsSig, sequenceSig } from '../../state';

export function renderAssetsTab(body: HTMLElement) {
  body.innerHTML = `
    <div class="section-label">Free Stock & SFX Fetcher</div>
    <div class="bridge-footer"><input id="st-q" type="text" placeholder="Search B-roll / SFX (e.g. neon, whoosh)..." style="flex:1;padding:7px;border-radius:8px;border:1px solid var(--border);background:rgba(0,0,0,.4);color:var(--text);font-size:12px;" /><select id="st-src" style="padding:7px;border-radius:8px;border:1px solid var(--border);background:#0d111a;color:var(--text);font-size:11px;"><option value="openverse">Openverse</option><option value="pexels">Pexels</option><option value="pixabay">Pixabay</option><option value="freesound">Freesound</option></select></div>
    <div class="bridge-footer"><button class="btn-primary" id="btn-find">Search Free</button><button class="btn-ghost" id="btn-flow">Google Flow</button><button class="btn-ghost" id="btn-mp">3-Pass</button></div>
    <div class="fx-list" id="st-res"></div>
    <pre class="mini-code" id="scan-out">Search royalty-free assets or run 3-Pass Auto-Improve.</pre>`;
  body.querySelector<HTMLButtonElement>('#btn-find')!.onclick = async () => {
    const q = body.querySelector<HTMLInputElement>('#st-q')!.value.trim(), src = body.querySelector<HTMLSelectElement>('#st-src')!.value;
    if (!q) return notify('Enter a search keyword');
    const ori = sequenceSig.value.height > sequenceSig.value.width ? 'portrait' : 'landscape';
    const d = await fetch(apiUrl(`/api/assets/search?q=${encodeURIComponent(q)}&source=${src}&orientation=${ori}`)).then((r) => r.json()).catch(() => ({ items: [] }));
    const box = body.querySelector('#st-res')!;
    box.innerHTML = (d.items || []).slice(0, 4).map((it: any, i: number) => `<div class="fx-card"><div class="fx-head"><strong>${it.title}</strong><button class="btn-ghost" data-dl="${i}">Save</button></div><small>${it.source} · ${it.license}</small></div>`).join('') || '<div class="hint">No results (set API key or use Openverse CC0)</div>';
    box.querySelectorAll<HTMLButtonElement>('[data-dl]').forEach((b) => (b.onclick = async () => { const it = d.items[Number(b.dataset.dl)]; await fetch(apiUrl(`/api/assets/download?url=${encodeURIComponent(it.download_url)}&filename=${encodeURIComponent(it.title.replace(/\W+/g, '_') + '.bin')}`), { method: 'POST' }); notify(`Saved ${it.title}`); }));
  };
  body.querySelector<HTMLButtonElement>('#btn-flow')!.onclick = () => { navigator.clipboard.writeText(`Cinematic B-roll, ${sequenceSig.value.height > sequenceSig.value.width ? '9:16' : '16:9'}, 4k`).catch(() => {}); window.open('https://labs.google/fx/tools/flow', '_blank'); notify('Opened Google Flow!'); };
  body.querySelector<HTMLButtonElement>('#btn-mp')!.onclick = async () => {
    const d = await fetch(apiUrl('/api/multipass/improve?max_passes=3'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(segmentsSig.value) }).then((r) => r.json()).catch(() => null);
    if (d?.passes?.length) { const last = d.passes[d.passes.length - 1]; segmentsSig.value = last.segments; await refreshScript(); body.querySelector('#scan-out')!.textContent = d.passes.map((p: any) => `Pass ${p.pass_num}: ${p.score}/100`).join(' · '); notify(`3-Pass: ${last.score}/100!`); }
  };
}
