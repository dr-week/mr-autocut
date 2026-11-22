import { ZUARI_LOGO_SVG, ic } from '../../state';
import { topBarCenter } from './markup';

export function topBarMarkup(): string {
  return `
    <div class="brand"><div class="logo-mark">${ZUARI_LOGO_SVG}</div><h1>MR-AutoCut</h1></div>
    ${topBarCenter()}
    <div class="topbar-actions">
      <a class="pill" id="update-pill" target="_blank" rel="noopener" hidden></a>
      <button class="btn-ghost" id="btn-cmdk" title="Command Palette (Cmd+K)">${ic('cmd', 14)}</button>
      <details class="sys-pop"><summary class="btn-ghost" title="System, Resolution, DPI & Engine Settings">${ic('tuner', 14)}</summary><div class="sys-menu"><div class="pill" id="fc-status-pill"><i class="dot"></i> Engine</div><div class="pill" id="seq-dim-pill">1920x1080</div><div class="pill" id="dpi-pill">Desktop</div></div></details>
      <button class="btn-ghost" id="btn-export" title="Export MP4">${ic('download', 14)}</button>
      <button class="btn-primary" id="btn-send-fc" title="Execute in FilmCraft / Filmora">${ic('zap', 14)} Run</button>
    </div>`;
}
