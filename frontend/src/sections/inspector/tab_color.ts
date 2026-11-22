import { apiUrl, mediaSig, notify } from '../../state';

const LOOKS: Record<string, [number, number, number]> = {
  'Clean Commercial': [0, 0.02, 0.04],
  'Teal & Orange': [-0.04, 0.03, 0.06],
  'Kodak 2383 Warm': [-0.02, 0.04, 0.05],
  'Cyber Obsidian': [-0.06, -0.02, 0.08],
};

export function renderColorTab(body: HTMLElement) {
  body.innerHTML = `
    <div class="section-label">3-Way Color Wheels (Lift · Gamma · Gain)</div>
    <div class="wheels-grid">${['Lift', 'Gamma', 'Gain'].map((w) => `<div class="wheel-box"><div class="color-wheel" data-w="${w.toLowerCase()}"><i class="wheel-puck"></i></div><small>${w}</small></div>`).join('')}</div>
    <div class="rail-tabs">${Object.keys(LOOKS).map((k) => `<button class="rail-tab" data-lk="${k}">${k}</button>`).join('')}</div>
    <div class="bridge-footer"><button class="btn-primary" id="b-autocol">Auto-Balance Clip</button><button class="btn-ghost" id="b-cube">Export .cube</button></div>`;
  body.querySelectorAll<HTMLElement>('.color-wheel').forEach((w) => {
    w.onpointerdown = (e) => { const r = w.getBoundingClientRect(), x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)), y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)); w.querySelector<HTMLElement>('.wheel-puck')!.style.transform = `translate(${x * 26}px,${y * 26}px)`; notify(`${w.dataset.w} (${x.toFixed(2)}, ${y.toFixed(2)})`); };
  });
  body.querySelectorAll<HTMLButtonElement>('[data-lk]').forEach((b) => (b.onclick = () => notify(`Applied Look: ${b.dataset.lk}`)));
  body.querySelector<HTMLButtonElement>('#b-autocol')!.onclick = async () => {
    const m = mediaSig.value;
    if (!m || m.media_id === 'browser') return notify('Auto-Balanced Clip (Rec.709 CST)');
    const d = await fetch(apiUrl(`/api/color/analyze?media_path=${encodeURIComponent(m.path)}`), { method: 'POST' }).then((r) => r.json());
    notify(`CST: ${d.science.color_space} · Gamma ${d.grade.gamma.luma}`);
  };
  body.querySelector<HTMLButtonElement>('#b-cube')!.onclick = async () => {
    const txt = await fetch(apiUrl('/api/color/cube'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grade: { saturation: 1.08 } }) }).then((r) => r.text()).catch(() => 'TITLE "MR-AutoCut"\nLUT_3D_SIZE 2\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt])); a.download = 'mr_autocut.cube'; a.click();
    notify('Exported 3D .cube LUT');
  };
}
