import { SEQUENCE_PRESETS } from '../../state';

export function topBarMarkup(): string {
  const opts = Object.keys(SEQUENCE_PRESETS).map((k) => `<option value="${k}">${k}</option>`).join('');
  return `
    <div class="brand"><div class="logo-mark">MR</div><div><h1>MR-AutoCut</h1><span>Zuari 120 FPS · FilmCraft</span></div></div>
    <div class="topbar-center">
      <div class="mode-switch"><button data-m="dock">Dock</button><button data-m="studio">Studio</button><button data-m="hud">HUD</button></div>
      <label class="seq-picker"><span>Seq</span><select id="seq-select">${opts}</select></label>
      <span class="pill" id="seq-dim-pill">1920×1080</span>
      <label class="upload-btn"><input type="file" id="media-upload" accept="video/*,audio/*" hidden /><span id="media-label">+ Media</span></label>
    </div>
    <div class="topbar-actions">
      <button class="btn-ghost" id="btn-cmdk">⌘K</button>
      <span class="pill" id="fc-status-pill"><i class="dot"></i> CLI</span>
      <button class="btn-ghost" id="btn-export">MP4</button>
      <button class="btn-primary" id="btn-send-fc">Send to FilmCraft</button>
    </div>`;
}
