import { SEQUENCE_PRESETS } from '../../state';

export function topBarCenter(): string {
  const opts = Object.keys(SEQUENCE_PRESETS).map((k) => `<option value="${k}">${k}</option>`).join('');
  return `
    <div class="topbar-center nova-glyph-dock">
      <div class="mode-switch"><button data-m="studio" title="Desktop Grid">⊞</button><button data-m="float" title="Filmora Floating Box">⧉</button><button data-m="phone" title="VN / CapCut Phone">📱</button><button data-m="dock" title="Side Rail">▥</button></div>
      <label class="seq-picker" title="Sequence Aspect"><select id="seq-select">${opts}</select></label>
      <span class="pill" id="seq-dim-pill">1920×1080</span>
      <span class="pill" id="dpi-pill" title="Viewport & DPI">1080p</span>
      <button class="btn-ghost" id="btn-theme" title="Cycle Zuari Glass Theme">◐</button>
      <label class="upload-btn" title="Upload Video"><input type="file" id="media-upload" accept="video/*,audio/*" hidden /><span id="media-label">＋🎬</span></label>
    </div>`;
}
