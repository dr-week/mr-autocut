import { topBarCenter } from './markup';

export function topBarMarkup(): string {
  return `
    <div class="brand"><div class="logo-mark">MR</div><div><h1>MR-AutoCut</h1><span>Zuari 120 FPS · FilmCraft</span></div></div>
    ${topBarCenter()}
    <div class="topbar-actions">
      <a class="pill" id="update-pill" target="_blank" rel="noopener" hidden></a>
      <button class="btn-ghost" id="btn-cmdk">⌘K</button>
      <span class="pill" id="fc-status-pill"><i class="dot"></i> CLI</span>
      <button class="btn-ghost" id="btn-export">MP4</button>
      <button class="btn-primary" id="btn-send-fc">Send to FilmCraft</button>
    </div>`;
}
