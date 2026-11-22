import { apiUrl, notify, refreshScript } from '../../state';

export function renderYtHarvester(): string {
  return `<div class="section-label">YouTube Transition Harvester (No-Logo Slice + Blend)</div><div class="control"><input id="yt-url" type="text" placeholder="Paste YouTube transition URL (blank = 7-ref pack)..." /></div><div class="row-2"><select id="yt-kind"><option value="light_leak">Light Leak (Screen)</option><option value="film_burn_sfx">Film Burn + SFX (Screen)</option><option value="vfx_sfx_pack">VFX Flash + SFX (Add)</option><option value="paper_texture">Paper / Retro (Multiply)</option><option value="grain">Film Grain (Overlay)</option></select><button id="yt-harvest" class="btn-primary">Harvest Clean Cuts</button></div><div id="yt-list" class="mini-note">Strips intro/outro logos · detects flash peaks · extracts V2 overlay + A2 SFX</div>`;
}

export function bindYtHarvester(body: HTMLElement) {
  body.querySelector<HTMLButtonElement>('#yt-harvest')!.onclick = async () => {
    const url = body.querySelector<HTMLInputElement>('#yt-url')!.value.trim(), kind = body.querySelector<HTMLSelectElement>('#yt-kind')!.value;
    notify('Harvesting clean transitions & SFX...');
    const res = await fetch(apiUrl(`/api/youtube-fx/harvest?kind=${kind}${url ? `&url=${encodeURIComponent(url)}` : ''}`), { method: 'POST' }).then((r) => r.json());
    body.querySelector('#yt-list')!.innerHTML = (res.items || []).map((i: any) => `<span class="pill">${i.id} · ${i.blend.filmcraft} (${i.start}s-${i.end}s)</span>`).join(' ');
    notify(`Harvested ${(res.items || []).length} transition clips`);
    refreshScript();
  };
}
