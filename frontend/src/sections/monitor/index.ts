import { effect } from '@zuari/signals';
import { BUNDLED_SAMPLES, captionTextSig, colorFilterSig, ic, loadSampleVideo, maskGlowSig, mediaSig, playheadSig, safeZonesSig, sequenceSig, sourceDurationSig, textBehindSig } from '../../state';
import { bindDraggableCard, makeCardHeader } from '../topbar/drag_card';

export function createMonitorPanel(): HTMLElement {
  const el = document.createElement('section'); el.className = 'panel zuari-card monitor';
  const opts = BUNDLED_SAMPLES.map((s) => `<option value="${s.id}">${s.label} (${s.w}x${s.h})</option>`).join('');
  el.innerHTML = `${makeCardHeader('Monitor', '120 FPS', 'monitor')}<div class="viewport-stage"><div class="viewport-frame" id="vp-f"><video id="vp-v" playsinline loop muted autoplay></video><div class="text-behind-layer" id="vp-tb">VELOCITY</div><div class="subject-mask-aura" id="vp-mk"></div><div class="vp-placeholder" id="vp-e"><strong>${ic('film', 18)}</strong></div><div class="safe-zone-guide" id="vp-s"></div><div class="caption-overlay" id="vp-c"></div></div></div><div class="transport"><div class="row-2" style="margin:0;"><button class="btn-primary" id="b-pl" title="Play / Pause">${ic('play', 12)}</button><label class="seq-picker" title="Sample / Reference Video">${ic('film', 12)}<select id="smp-sel">${opts}</select></label></div><div class="row-2" style="margin:0;"><span class="timecode" id="vp-t">0.0s / 6.0s</span><label class="toggle-row" style="margin:0;" title="Toggle Safe Zones"><input id="c-safe" type="checkbox" checked /> ${ic('grid', 12)}</label></div></div>`;
  const video = el.querySelector<HTMLVideoElement>('#vp-v')!; bindDraggableCard(el);
  el.querySelector<HTMLSelectElement>('#smp-sel')!.onchange = (e) => loadSampleVideo((e.target as HTMLSelectElement).value);
  el.querySelector<HTMLInputElement>('#c-safe')!.onchange = (e) => (safeZonesSig.value = (e.target as HTMLInputElement).checked);
  el.querySelector<HTMLButtonElement>('#b-pl')!.onclick = () => { if (mediaSig.value) video.paused ? video.play() : video.pause(); };
  video.ontimeupdate = () => (playheadSig.value = video.currentTime);
  effect(() => { const s = sequenceSig.value; el.querySelector<HTMLElement>('#vp-f')!.style.aspectRatio = `${s.width}/${s.height}`; const m = mediaSig.value; video.style.display = m ? 'block' : 'none'; el.querySelector<HTMLElement>('#vp-e')!.style.display = m ? 'none' : 'flex'; if (m && !video.src.endsWith(m.path.replace('./', ''))) { video.src = m.media_id === 'browser' ? m.path : `/api/media/${m.media_id}/stream`; video.play().catch(() => {}); } });
  effect(() => { video.style.filter = colorFilterSig.value; el.querySelector<HTMLElement>('#vp-s')!.style.display = safeZonesSig.value ? 'block' : 'none'; el.querySelector('#vp-c')!.textContent = captionTextSig.value; el.querySelector('#vp-t')!.textContent = `${playheadSig.value.toFixed(1)}s / ${sourceDurationSig.value.toFixed(1)}s`; el.querySelector('#vp-tb')!.textContent = textBehindSig.value || ''; el.querySelector<HTMLElement>('#vp-mk')!.classList.toggle('on', maskGlowSig.value); }); return el;
}
