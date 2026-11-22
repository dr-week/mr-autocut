import { captionTextSig, sequenceSig } from '../../state';

export function renderCaptionsTab(body: HTMLElement) {
  body.innerHTML = `
    <div class="section-label">Kinetic Captions (ASS)</div>
    <div class="control"><label>Hook Caption</label><input id="inp-cap" type="text" value="${captionTextSig.value}" /></div>
    <p class="hint">Auto-scaled to sequence height (${sequenceSig.value.height}px) for FFmpeg ASS burn-in.</p>`;
  body.querySelector<HTMLInputElement>('#inp-cap')!.oninput = (e) => (captionTextSig.value = (e.target as HTMLInputElement).value);
}
