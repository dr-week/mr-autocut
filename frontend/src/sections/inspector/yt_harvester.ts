import { activeApiSig, apiUrl, jsonlSig, notify, refreshScript, segmentsSig } from '../../state';
import { CURATED_YT_PACK } from './yt_presets';

export function renderYtHarvester(): string {
  return `<div class="section-label">YouTube Transition Harvester (No-Logo Slice + Blend)</div><div class="control"><input id="yt-url" type="text" placeholder="Paste YouTube transition URL (blank = 7-ref pack)..." /></div><div class="row-2"><select id="yt-kind"><option value="light_leak">Light Leak (Screen)</option><option value="film_burn_sfx">Film Burn + SFX (Screen)</option><option value="vfx_sfx_pack">VFX Flash + SFX (Add)</option><option value="paper_texture">Paper / Retro (Multiply)</option><option value="grain">Film Grain (Overlay)</option></select><button id="yt-harvest" class="btn-primary">Harvest Clean Cuts</button></div><div id="yt-list" class="mini-note">${CURATED_YT_PACK.map((i) => `<span class="pill">${i.id} · ${i.blend.filmcraft} (${i.start}s-${i.end}s)</span>`).join(' ')}</div>`;
}

export function bindYtHarvester(body: HTMLElement) {
  body.querySelector<HTMLButtonElement>('#yt-harvest')!.onclick = async () => {
    const url = body.querySelector<HTMLInputElement>('#yt-url')!.value.trim(), kind = body.querySelector<HTMLSelectElement>('#yt-kind')!.value;
    notify('Harvesting clean transitions & SFX (logos trimmed)...');
    const res = activeApiSig.value === 'static-demo' ? { items: CURATED_YT_PACK } : await fetch(apiUrl(`/api/youtube-fx/harvest?kind=${kind}${url ? `&url=${encodeURIComponent(url)}` : ''}`), { method: 'POST' }).then((r) => r.json()).catch(() => ({ items: CURATED_YT_PACK }));
    body.querySelector('#yt-list')!.innerHTML = (res.items || CURATED_YT_PACK).map((i: any) => `<span class="pill">${i.id} · ${i.blend.filmcraft} (${i.start}s-${i.end}s)</span>`).join(' ');
    segmentsSig.value = segmentsSig.value.map((s, idx) => (idx % 2 === 1 ? { ...s, light_leak: true, transition: kind, sfx: 'whoosh' } : s));
    await refreshScript(); jsonlSig.value = `${jsonlSig.value}\n{"id":"timeline.place","params":{"track":"V2","audioTrack":"A2","seconds":1.5,"insert":false}}\n{"id":"effects.setParam","params":{"effect":"opacity","param":"blend","value":"${(res.items?.[0]?.blend?.filmcraft) || 'Screen'}"}}`.trim(); notify(`Harvested ${(res.items || CURATED_YT_PACK).length} clean transitions + V2 blend!`);
  };
}
