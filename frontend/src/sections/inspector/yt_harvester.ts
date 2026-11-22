import { activeApiSig, apiUrl, ic, jsonlSig, notify, refreshScript, segmentsSig } from '../../state';
import { CURATED_YT_PACK } from './yt_presets';

export function renderYtHarvester(): string {
  const opts = CURATED_YT_PACK.map((i, idx) => `<option value="${idx}">${i.name} (${i.blend.filmcraft} · ${i.start}s-${i.end}s)</option>`).join('');
  return `<div class="control"><label>${ic('film', 12)} 44 Sliced YouTube Transitions</label><select id="yt-preset-sel" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);background:oklch(0% 0 0/.4);color:var(--text);font-size:11px;">${opts}</select></div><div class="row-2"><input id="yt-url" type="text" placeholder="Or paste YouTube transition URL..." /><button id="yt-harvest" class="btn-primary" title="Slice & Apply Transition">${ic('scissors', 12)} Apply</button></div>`;
}
export function bindYtHarvester(body: HTMLElement) {
  body.querySelector<HTMLButtonElement>('#yt-harvest')!.onclick = async () => {
    const url = body.querySelector<HTMLInputElement>('#yt-url')!.value.trim(), selIdx = Number(body.querySelector<HTMLSelectElement>('#yt-preset-sel')!.value || 0), chosen = CURATED_YT_PACK[selIdx] || CURATED_YT_PACK[0];
    const res = !url || activeApiSig.value === 'static-demo' ? { items: [chosen] } : await fetch(apiUrl(`/api/youtube-fx/harvest?kind=${chosen.kind}&url=${encodeURIComponent(url)}`), { method: 'POST' }).then((r) => r.json()).catch(() => ({ items: [chosen] }));
    const it = res.items?.[0] || chosen;
    segmentsSig.value = segmentsSig.value.map((s, idx) => (idx % 2 === 1 ? { ...s, light_leak: true, transition: it.kind, sfx: 'whoosh' } : s));
    await refreshScript(); jsonlSig.value = `${jsonlSig.value}\n{"id":"timeline.place","params":{"track":"V2","audioTrack":"A2","seconds":1.5,"insert":false}}\n{"id":"effects.setParam","params":{"effect":"opacity","param":"blend","value":"${it.blend.filmcraft}"}}`.trim(); notify(`${it.name || it.id} (${it.blend.filmcraft})`);
  };
}
