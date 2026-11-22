import { activeApiSig, apiUrl, jsonlSig, notify, refreshScript, segmentsSig } from '../../state';
import { CURATED_YT_PACK } from './yt_presets';

export function renderYtHarvester(): string {
  return `<div class="control"><input id="yt-url" type="text" placeholder="▶ YouTube URL (blank = 7-pack)..." /></div><div class="row-2"><select id="yt-kind"><option value="light_leak">✨ Leak (Screen)</option><option value="film_burn_sfx">🔥 Burn+SFX (Screen)</option><option value="vfx_sfx_pack">⚡ VFX+SFX (Add)</option><option value="paper_texture">📜 Paper (Multiply)</option><option value="grain">🎞 Grain (Overlay)</option></select><button id="yt-harvest" class="btn-primary" title="Harvest Clean Cuts">✂️ Slice</button></div><div id="yt-list" class="mini-note">${CURATED_YT_PACK.slice(0, 4).map((i) => `<span class="pill">▶ ${i.id.slice(0, 6)} · ${i.blend.filmcraft}</span>`).join(' ')}</div>`;
}
export function bindYtHarvester(body: HTMLElement) {
  body.querySelector<HTMLButtonElement>('#yt-harvest')!.onclick = async () => {
    const url = body.querySelector<HTMLInputElement>('#yt-url')!.value.trim(), kind = body.querySelector<HTMLSelectElement>('#yt-kind')!.value;
    const res = activeApiSig.value === 'static-demo' ? { items: CURATED_YT_PACK } : await fetch(apiUrl(`/api/youtube-fx/harvest?kind=${kind}${url ? `&url=${encodeURIComponent(url)}` : ''}`), { method: 'POST' }).then((r) => r.json()).catch(() => ({ items: CURATED_YT_PACK }));
    body.querySelector('#yt-list')!.innerHTML = (res.items || CURATED_YT_PACK).slice(0, 5).map((i: any) => `<span class="pill">▶ ${i.id.slice(0, 6)} · ${i.blend.filmcraft}</span>`).join(' ');
    segmentsSig.value = segmentsSig.value.map((s, idx) => (idx % 2 === 1 ? { ...s, light_leak: true, transition: kind, sfx: 'whoosh' } : s));
    await refreshScript(); jsonlSig.value = `${jsonlSig.value}\n{"id":"timeline.place","params":{"track":"V2","audioTrack":"A2","seconds":1.5,"insert":false}}\n{"id":"effects.setParam","params":{"effect":"opacity","param":"blend","value":"${(res.items?.[0]?.blend?.filmcraft) || 'Screen'}"}}`.trim(); notify(`✂️ ${(res.items || CURATED_YT_PACK).length} YT FX`);
  };
}
