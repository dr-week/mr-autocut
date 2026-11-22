import { SEQUENCE_PRESETS } from '../../state';

export function topBarCenter(): string {
  const opts = Object.keys(SEQUENCE_PRESETS).map((k) => `<option value="${k}">${k}</option>`).join('');
  return `
    <div class="topbar-center">
      <div class="mode-switch"><button data-m="dock">Dock</button><button data-m="studio">Studio</button><button data-m="hud">HUD</button></div>
      <label class="seq-picker"><span>Seq</span><select id="seq-select">${opts}</select></label>
      <span class="pill" id="seq-dim-pill">1920×1080</span>
      <label class="upload-btn"><input type="file" id="media-upload" accept="video/*,audio/*" hidden /><span id="media-label">+ Media</span></label>
    </div>`;
}
