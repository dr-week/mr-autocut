import { topBarCenter } from './markup';

export function topBarMarkup(): string {
  return `
    <div class="brand"><div class="logo-mark">MR</div><h1>MR-AutoCut</h1></div>
    ${topBarCenter()}
    <div class="topbar-actions">
      <a class="pill" id="update-pill" target="_blank" rel="noopener" hidden></a>
      <button class="btn-ghost" id="btn-cmdk" title="Command Palette">⌘K</button>
      <span class="pill" id="fc-status-pill" title="Engine Status"><i class="dot"></i></span>
      <button class="btn-ghost" id="btn-export" title="Export MP4">⬇ MP4</button>
      <button class="btn-primary" id="btn-send-fc" title="Execute in FilmCraft / Filmora">⚡ Run</button>
    </div>`;
}
