import { autoLightLeakSig, autoSfxSig, minSilenceSig, paddingSig, punchInSig, runAnalyze, silenceDbSig } from '../../state';

export function renderAutoCutTab(body: HTMLElement) {
  body.innerHTML = `<div class="section-label">Smart Silence & Pacing</div><div class="control"><label>Threshold <span id="v-db">${silenceDbSig.value} dB</span></label><input id="r-db" type="range" min="-55" max="-18" value="${silenceDbSig.value}" /></div><div class="control"><label>Min Silence <span id="v-min">${minSilenceSig.value.toFixed(2)}s</span></label><input id="r-min" type="range" min="0.15" max="1.5" step="0.05" value="${minSilenceSig.value}" /></div><div class="control"><label>Padding <span id="v-pad">${paddingSig.value.toFixed(2)}s</span></label><input id="r-pad" type="range" min="0" max="0.3" step="0.02" value="${paddingSig.value}" /></div><label class="toggle-row"><input id="c-p" type="checkbox" ${punchInSig.value ? 'checked' : ''} /> 112% Punch-In</label><label class="toggle-row"><input id="c-s" type="checkbox" ${autoSfxSig.value ? 'checked' : ''} /> Auto-SFX (Whoosh/Hit)</label><label class="toggle-row"><input id="c-l" type="checkbox" ${autoLightLeakSig.value ? 'checked' : ''} /> Auto Light Leaks</label><button class="btn-primary" id="b-run">Run Auto-Cut</button>`;
  body.querySelector<HTMLInputElement>('#r-db')!.oninput = (e) => { silenceDbSig.value = Number((e.target as HTMLInputElement).value); body.querySelector('#v-db')!.textContent = `${silenceDbSig.value} dB`; };
  body.querySelector<HTMLInputElement>('#r-min')!.oninput = (e) => { minSilenceSig.value = Number((e.target as HTMLInputElement).value); body.querySelector('#v-min')!.textContent = `${minSilenceSig.value.toFixed(2)}s`; };
  body.querySelector<HTMLInputElement>('#r-pad')!.oninput = (e) => { paddingSig.value = Number((e.target as HTMLInputElement).value); body.querySelector('#v-pad')!.textContent = `${paddingSig.value.toFixed(2)}s`; };
  body.querySelector<HTMLInputElement>('#c-p')!.onchange = (e) => (punchInSig.value = (e.target as HTMLInputElement).checked);
  body.querySelector<HTMLInputElement>('#c-s')!.onchange = (e) => (autoSfxSig.value = (e.target as HTMLInputElement).checked);
  body.querySelector<HTMLInputElement>('#c-l')!.onchange = (e) => (autoLightLeakSig.value = (e.target as HTMLInputElement).checked);
  body.querySelector<HTMLButtonElement>('#b-run')!.onclick = () => runAnalyze();
}
