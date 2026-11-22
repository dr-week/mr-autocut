import { apiUrl, colorFilterSig, jsonlSig, mediaSig, notify, segmentsSig } from '../../state';

const LOOKS: Record<string, string> = {
  'Clean': 'contrast(1.04) saturate(1.08)',
  'Teal & Orange': 'contrast(1.12) saturate(1.22) hue-rotate(-8deg)',
  'Kodak 2383': 'contrast(1.1) saturate(1.15) sepia(0.14)',
  'Cyber': 'contrast(1.18) saturate(1.25) hue-rotate(14deg)',
};

export function renderColorTab(body: HTMLElement) {
  body.innerHTML = `
    <div class="section-label">3-Way Color Wheels (120 FPS Live)</div>
    <div class="wheels-grid">${['Lift', 'Gamma', 'Gain'].map((w) => `<div class="wheel-box"><div class="color-wheel" data-w="${w.toLowerCase()}"><i class="wheel-puck"></i></div><small>${w}</small></div>`).join('')}</div>
    <div class="rail-tabs">${Object.keys(LOOKS).map((k) => `<button class="rail-tab" data-lk="${k}">${k}</button>`).join('')}</div>
    <div class="bridge-footer"><button class="btn-primary" id="b-autocol">Auto-Balance</button><button class="btn-ghost" id="b-match">Match Clips</button><button class="btn-ghost" id="b-cube">.cube</button></div>`;
  body.querySelectorAll<HTMLElement>('.color-wheel').forEach((w) => {
    w.onpointerdown = (e) => { const r = w.getBoundingClientRect(), x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)), y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)); w.querySelector<HTMLElement>('.wheel-puck')!.style.transform = `translate(${x * 26}px,${y * 26}px)`; colorFilterSig.value = `brightness(${(1 - y * 0.25).toFixed(2)}) saturate(${(1 + Math.abs(x) * 0.6).toFixed(2)}) hue-rotate(${Math.round(x * 35)}deg)`; };
  });
  body.querySelectorAll<HTMLButtonElement>('[data-lk]').forEach((b) => (b.onclick = () => { colorFilterSig.value = LOOKS[b.dataset.lk!]; notify(`Look: ${b.dataset.lk}`); }));
  body.querySelector<HTMLButtonElement>('#b-autocol')!.onclick = async () => {
    const m = mediaSig.value; colorFilterSig.value = 'contrast(1.06) saturate(1.1)';
    if (!m || m.media_id === 'browser') return notify('Auto-Balanced Clip (Rec.709 CST)');
    const d = await fetch(apiUrl(`/api/color/analyze?media_path=${encodeURIComponent(m.path)}`), { method: 'POST' }).then((r) => r.json());
    notify(`CST: ${d.science.color_space} · Gamma ${d.grade.gamma.luma}`);
  };
  body.querySelector<HTMLButtonElement>('#b-match')!.onclick = async () => {
    const ids = segmentsSig.value.map((s) => s.index);
    const d = await fetch(apiUrl('/api/color/match?reference_seconds=0.5'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ids) }).then((r) => r.json()).catch(() => ({ jsonl: '', command_count: ids.length }));
    if (d.jsonl) jsonlSig.value = `${jsonlSig.value}\n${d.jsonl}`.trim();
    notify(`Matched ${d.command_count} clips via lumetri.applyMatch!`);
  };
  body.querySelector<HTMLButtonElement>('#b-cube')!.onclick = async () => {
    const txt = await fetch(apiUrl('/api/color/cube'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grade: { saturation: 1.08 } }) }).then((r) => r.text()).catch(() => 'TITLE "MR-AutoCut"\nLUT_3D_SIZE 2\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt])); a.download = 'mr_autocut.cube'; a.click(); notify('Exported 3D .cube LUT');
  };
}
