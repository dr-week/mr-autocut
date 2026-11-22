import { loggedEditsSig, toastSig } from './controls';
import { busySig, layoutSig, mediaSig, segmentsSig, sourceDurationSig, waveformSig } from './signals';
import type { LayoutMode, MediaInfo } from './types';
import { runAnalyze } from './actions_analyze';
import { refreshScript } from './actions_filmcraft';

export function notify(msg: string) {
  toastSig.value = msg;
  setTimeout(() => { if (toastSig.value === msg) toastSig.value = ''; }, 2400);
}

export function setLayout(mode: LayoutMode) {
  layoutSig.value = mode;
  localStorage.setItem('mr_layout', mode);
}

import { activeApiSig, apiUrl } from './api';
import { analyzeFileInBrowser } from './browser_audio';
import { silenceDbSig } from './controls';

export async function uploadMediaFile(file: File) {
  busySig.value = true;
  if (activeApiSig.value === 'static-demo') {
    const { info, segments } = await analyzeFileInBrowser(file, silenceDbSig.value);
    mediaSig.value = info; waveformSig.value = info.waveform; sourceDurationSig.value = info.duration; segmentsSig.value = segments;
    busySig.value = false; return notify(`Browser Auto-Cut: ${segments.length} cuts (${info.duration}s)`);
  }
  const form = new FormData(); form.append('file', file);
  const res = await fetch(apiUrl('/api/media/upload'), { method: 'POST', body: form });
  busySig.value = false;
  if (!res.ok) return notify('Upload failed');
  const info: MediaInfo = await res.json();
  mediaSig.value = info; waveformSig.value = info.waveform; sourceDurationSig.value = info.duration;
  notify(`Loaded ${info.filename} (${info.width}×${info.height})`);
  await runAnalyze();
}

export async function toggleSegment(index: number) {
  segmentsSig.value = segmentsSig.value.map((s) => (s.index === index ? { ...s, enabled: !s.enabled } : s));
  const seg = segmentsSig.value.find((s) => s.index === index);
  if (seg) fetch('/api/learning/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clip_features: { duration: seg.duration }, suggested: { keep: true }, user_final: { keep: seg.enabled } }) }).then((r) => r.json()).then((d) => (loggedEditsSig.value = d.logged_edits)).catch(() => {});
  await refreshScript();
}
