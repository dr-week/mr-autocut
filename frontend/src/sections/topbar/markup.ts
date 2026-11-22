import { SEQUENCE_PRESETS } from '../../state';

export function topBarCenter(): string {
  const opts = Object.keys(SEQUENCE_PRESETS).map((k) => `<option value="${k}">${k}</option>`).join('');
  return `
    <div class="topbar-center nova-glyph-dock">
      <div class="mode-switch"><button data-m="studio">Studio</button><button data-m="float">Filmora Box</button><button data-m="phone">VN Phone</button><button data-m="dock">Dock</button></div>
      <label class="seq-picker"><span>Seq</span><select id="seq-select">${opts}</select></label>
      <span class="pill" id="seq-dim-pill">1920×1080</span>
      <span class="pill" id="dpi-pill" title="Live Screen Resolution & DPI Sensor">1920×1080 · 1x</span>
      <button class="btn-ghost" id="btn-theme" title="Cycle Zuari Glass Theme">Zuari Glass</button>
      <label class="upload-btn"><input type="file" id="media-upload" accept="video/*,audio/*" hidden /><span id="media-label">+ Media</span></label>
    </div>`;
}
