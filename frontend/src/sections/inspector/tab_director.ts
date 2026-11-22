import { notify, refreshScript, segmentsSig, sequenceSig } from '../../state';

export function renderDirectorTab(body: HTMLElement) {
  body.innerHTML = `
    <div class="section-label">AI Director (Free AI / Colab)</div>
    <div class="control"><textarea id="inp-dir" rows="3" placeholder="Make a punchy 30s edit with light leaks..."></textarea></div>
    <button class="btn-primary" id="btn-cp">Copy Prompt for Free AI</button>
    <div class="control" style="margin-top:8px;"><textarea id="inp-js" rows="3" placeholder='{"segments":[...]}'></textarea></div>
    <button class="btn-ghost" id="btn-ap" style="width:100%;">Apply JSON EditPlan</button>`;
  body.querySelector<HTMLButtonElement>('#btn-cp')!.onclick = async () => {
    const inst = body.querySelector<HTMLTextAreaElement>('#inp-dir')!.value.trim() || 'Create a punchy edit';
    const d = await fetch('/api/director/prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ instruction: inst, sequence: sequenceSig.value, segments: segmentsSig.value }) }).then((r) => r.json());
    await navigator.clipboard.writeText(d.prompt).catch(() => {});
    notify('Director prompt copied for Colab / Gemini / ChatGPT!');
  };
  body.querySelector<HTMLButtonElement>('#btn-ap')!.onclick = async () => {
    try { const p = JSON.parse(body.querySelector<HTMLTextAreaElement>('#inp-js')!.value); if (Array.isArray(p.segments)) { segmentsSig.value = p.segments.map((s: any, i: number) => ({ enabled: true, index: i + 1, ...s })); await refreshScript(); notify(`Applied ${p.segments.length} AI cuts!`); } } catch { notify('Invalid JSON EditPlan'); }
  };
}
