import { apiUrl, filmoraPkgSig, ic, jsonlSig, notify, refreshScript, segmentsSig, textBehindSig } from '../../state';

export function renderRefCloner(): string {
  return `<div class="sub-body"><div class="row-2"><input id="ref-url" type="text" value="https://www.youtube.com/shorts/C9D6jiz4ILk" placeholder="Reference Video URL..." /><select id="ref-pace" style="width:68px;"><option value="1.2">1.2x</option><option value="1.0" selected>1.0x</option><option value="1.45">1.45x</option></select></div><div class="control"><input id="ref-raw" type="text" value="hook.mp4, crowd.mp4, drop.mp4, brand.mp4" placeholder="Client Raw Clips..." /></div><div class="bridge-footer"><button class="btn-primary" id="b-clone">${ic('layers', 12)} Clone</button><button class="btn-ghost" id="b-lan" title="Dual-Screen Pop-Out & Android APK">${ic('phone', 12)} APK / Dock</button></div><div id="ref-out" class="mini-note"></div></div>`;
}
export function bindRefCloner(body: HTMLElement) {
  body.querySelector<HTMLButtonElement>('#b-clone')!.onclick = async () => {
    const ref = body.querySelector<HTMLInputElement>('#ref-url')!.value.trim(), raw = body.querySelector<HTMLInputElement>('#ref-raw')!.value.split(',').map((s) => s.trim()).filter(Boolean), pace = Number(body.querySelector<HTMLSelectElement>('#ref-pace')!.value || 1);
    const d = await fetch(apiUrl(`/api/reference/clone?ref_source=${encodeURIComponent(ref)}&client_brief=Event&pacing=${pace}`), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(raw) }).then((r) => r.json()).catch(() => ({ segments: raw.map((c, i) => ({ index: i + 1, start: i * 1.4, end: (i + 1) * 1.4, duration: 1.4, kind: i === 0 ? 'hook' : 'beat', scale: i % 2 ? 1.14 : 1, transition: 'flash_screen', light_leak: true, sfx: 'whoosh', enabled: true, label: `${i + 1}·${c}` })), filmora_package: { target: ['Filmora', 'FilmCraft'], mode: 'reference_clone', raw } }));
    if (d.segments?.length) { segmentsSig.value = d.segments; textBehindSig.value = 'EVENT LIVE'; filmoraPkgSig.value = JSON.stringify(d.filmora_package, null, 2); await refreshScript(); if (d.filmcraft_jsonl) jsonlSig.value = `${jsonlSig.value}\n${d.filmcraft_jsonl}`.trim(); notify(`Cloned ${d.segments.length} slots`); }
  };
  body.querySelector<HTMLButtonElement>('#b-lan')!.onclick = async () => {
    const info = await fetch(apiUrl('/api/lan/info')).then((r) => r.json()).catch(() => ({ lan_ip: window.location.hostname || '192.168.1.10' })); window.open('?mode=dock', 'MRAutoCutFilmoraDock', 'width=360,height=740,menubar=no,toolbar=no');
    body.querySelector('#ref-out')!.innerHTML = `<span class="pill">${ic('phone', 11)} ${info.lan_ip}</span>`; notify(`Android Remote: ${info.lan_ip}`);
  };
}
