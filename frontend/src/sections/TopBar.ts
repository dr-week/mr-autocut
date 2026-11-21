import { effect } from '@zuari/signals';
import {
  SEQUENCE_PRESETS,
  executeInFilmCraft,
  exportSequenceMp4,
  mediaSig,
  refreshScript,
  sequenceSig,
  statusSig,
  uploadMediaFile,
} from '../state';

export function createTopBar(): HTMLElement {
  const el = document.createElement('header');
  el.className = 'topbar';

  el.innerHTML = `
    <div class="brand">
      <div class="logo-mark">MR</div>
      <div>
        <h1>MR-AutoCut</h1>
        <span>Zuari 120 FPS · FilmCraft Automation Studio</span>
      </div>
    </div>

    <div class="topbar-center">
      <label class="seq-picker">
        <span>Sequence</span>
        <select id="seq-select">
          ${Object.keys(SEQUENCE_PRESETS)
            .map((k) => `<option value="${k}">${k}</option>`)
            .join('')}
        </select>
      </label>
      <span class="pill" id="seq-dim-pill">1920×1080 · 30fps</span>
      <label class="upload-btn">
        <input type="file" id="media-upload" accept="video/*,audio/*" hidden />
        <span id="media-label">+ Drop Media</span>
      </label>
    </div>

    <div class="topbar-actions">
      <span class="pill" id="fc-status-pill"><i class="dot"></i> filmcraft-cli</span>
      <button class="btn-ghost" id="btn-export">Export MP4</button>
      <button class="btn-primary" id="btn-send-fc">Send to FilmCraft</button>
    </div>
  `;

  const seqSelect = el.querySelector<HTMLSelectElement>('#seq-select')!;
  seqSelect.addEventListener('change', () => {
    const preset = SEQUENCE_PRESETS[seqSelect.value];
    if (preset) {
      sequenceSig.value = { ...preset };
      refreshScript();
    }
  });

  const fileInput = el.querySelector<HTMLInputElement>('#media-upload')!;
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) uploadMediaFile(file);
  });

  el.querySelector('#btn-export')!.addEventListener('click', () => exportSequenceMp4());
  el.querySelector('#btn-send-fc')!.addEventListener('click', () => executeInFilmCraft());

  const dimPill = el.querySelector('#seq-dim-pill')!;
  const statusPill = el.querySelector('#fc-status-pill')!;
  const mediaLabel = el.querySelector('#media-label')!;

  effect(() => {
    const s = sequenceSig.value;
    dimPill.textContent = `${s.width}×${s.height} · ${s.fps}fps`;
  });

  effect(() => {
    const st = statusSig.value;
    statusPill.innerHTML = `<i class="dot"></i> ${st?.cli_version ?? 'filmcraft-cli ready'}`;
  });

  effect(() => {
    const m = mediaSig.value;
    mediaLabel.textContent = m ? m.filename : '+ Drop Media';
  });

  return el;
}
