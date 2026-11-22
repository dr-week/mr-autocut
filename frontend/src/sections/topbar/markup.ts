import { SEQUENCE_PRESETS, ic } from '../../state';

export function topBarCenter(): string {
  const opts = Object.keys(SEQUENCE_PRESETS).map((k) => `<option value="${k}">${k}</option>`).join('');
  return `
    <div class="topbar-center nova-glyph-dock">
      <div class="mode-switch"><button data-m="studio" title="Desktop Grid">${ic('grid', 14)}</button><button data-m="float" title="Filmora Floating Box">${ic('ext', 14)}</button><button data-m="phone" title="Android / VN Mobile">${ic('phone', 14)}</button><button data-m="dock" title="Side Rail">${ic('layers', 14)}</button></div>
      <label class="seq-picker" title="Sequence Aspect"><select id="seq-select">${opts}</select></label>
      <button class="btn-ghost" id="btn-theme" title="Cycle Zuari Glass Theme">${ic('palette', 14)}</button>
      <label class="upload-btn" title="Upload Video"><input type="file" id="media-upload" accept="video/*,audio/*" hidden /><span id="media-label">${ic('plus', 14)}</span></label>
    </div>`;
}
