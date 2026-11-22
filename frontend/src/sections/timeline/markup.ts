import { ic } from '../../state';
import { makeCardHeader } from '../topbar/drag_card';

export const TIMELINE_MARKUP = `${makeCardHeader('Multi-Track', '120 FPS', 'film')}<div class="multitrack-badges"><span class="pill" title="Track V3: Subject Mask + Saber Glow">${ic('wand', 11)} V3 Mask</span><span class="pill" title="Track V2: 3D Text Behind + YT Overlay (Screen)">${ic('layers', 11)} V2 Text+FX</span><span class="pill" title="Track V1: Best-Movement Speed Ramp">${ic('film', 11)} V1 Video</span><span class="pill" title="Track A2: YouTube Whoosh + Hit SFX">${ic('volume', 11)} A2 SFX</span></div><div class="timeline-track"><div class="waveform-bars" id="t-w"></div><div class="cut-layer" id="t-c"></div><div class="playhead" id="t-h"></div></div>`;
