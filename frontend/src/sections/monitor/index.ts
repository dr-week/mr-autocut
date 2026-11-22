import { effect } from '@zuari/signals';
import { captionTextSig, colorFilterSig, maskGlowSig, mediaSig, playheadSig, safeZonesSig, sequenceSig, sourceDurationSig, speedRampSig, textBehindSig } from '../../state';
import { bindDraggableCard, makeCardHeader } from '../topbar/drag_card';

export function createMonitorPanel(): HTMLElement {
  const el = document.createElement('section'); el.className = 'panel zuari-card monitor';
  el.innerHTML = `${makeCardHeader('Sequence Monitor · 120 FPS VFX Canvas', 'V3 Mask · V2 Text · V1 Video')}<div class="monitor-header"><span class="pill" id="vp-spd">300% → 40% Optical Flow</span><label class="toggle-row" style="margin:0;"><input id="c-safe" type="checkbox" checked /> Safe Zones</label></div><div class="viewport-stage"><div class="viewport-frame" id="vp-f"><video id="vp-v" playsinline></video><div class="text-behind-layer" id="vp-tb">VELOCITY</div><div class="subject-mask-aura" id="vp-mk"></div><div class="vp-placeholder" id="vp-e"><strong>Zuari Liquid Glass Monitor</strong><span id="vp-r">1920×1080</span></div><div class="safe-zone-guide" id="vp-s"></div><div class="caption-overlay" id="vp-c"></div></div></div><div class="transport"><button class="btn-ghost" id="b-pl">Play / Pause</button><span class="timecode" id="vp-t">0.00s / 42.00s</span></div>`;
  const video = el.querySelector<HTMLVideoElement>('#vp-v')!; bindDraggableCard(el);
  el.querySelector<HTMLInputElement>('#c-safe')!.onchange = (e) => (safeZonesSig.value = (e.target as HTMLInputElement).checked);
  el.querySelector<HTMLButtonElement>('#b-pl')!.onclick = () => { if (mediaSig.value) video.paused ? video.play() : video.pause(); };
  video.ontimeupdate = () => (playheadSig.value = video.currentTime);
  effect(() => { const s = sequenceSig.value; el.querySelector<HTMLElement>('#vp-f')!.style.aspectRatio = `${s.width}/${s.height}`; el.querySelector('#vp-r')!.textContent = `${s.width}×${s.height}`; });
  effect(() => { const m = mediaSig.value; video.style.display = m ? 'block' : 'none'; el.querySelector<HTMLElement>('#vp-e')!.style.display = m ? 'none' : 'flex'; if (m) video.src = m.media_id === 'browser' ? m.path : `/api/media/${m.media_id}/stream`; });
  effect(() => { video.style.filter = colorFilterSig.value; el.querySelector<HTMLElement>('#vp-s')!.style.display = safeZonesSig.value ? 'block' : 'none'; el.querySelector('#vp-c')!.textContent = captionTextSig.value; el.querySelector('#vp-t')!.textContent = `${playheadSig.value.toFixed(2)}s / ${sourceDurationSig.value.toFixed(2)}s`; el.querySelector('#vp-tb')!.textContent = textBehindSig.value || ''; el.querySelector<HTMLElement>('#vp-mk')!.classList.toggle('on', maskGlowSig.value); el.querySelector('#vp-spd')!.textContent = speedRampSig.value; });
  return el;
}
