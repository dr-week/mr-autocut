import { bridgeAddrSig, captionTextSig, cliCmdSig, jsonlSig } from './controls';
import { busySig, mediaSig, segmentsSig, sequenceSig } from './signals';
import { notify } from './actions_media';

export async function refreshScript() {
  try {
    const res = await fetch('/api/filmcraft/script', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ segments: segmentsSig.value, sequence: sequenceSig.value, bridge_addr: bridgeAddrSig.value || null }) });
    const d = await res.json();
    jsonlSig.value = d.jsonl || ''; cliCmdSig.value = d.cli_invocation || '';
  } catch { /* ignore */ }
}

export async function executeInFilmCraft() {
  busySig.value = true;
  const res = await fetch('/api/filmcraft/execute', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ segments: segmentsSig.value, sequence: sequenceSig.value, bridge_addr: bridgeAddrSig.value || null }) });
  const d = await res.json();
  busySig.value = false;
  notify(d.exit_code === 0 ? 'Applied to FilmCraft!' : `FilmCraft exited (${d.exit_code})`);
}

export async function exportSequenceMp4() {
  const m = mediaSig.value;
  if (!m) return notify('Drop a video file first to render MP4');
  busySig.value = true;
  const res = await fetch('/api/render', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ media_path: m.path, segments: segmentsSig.value, sequence: sequenceSig.value, captions: captionTextSig.value ? [{ start: 0, end: 2.5, text: captionTextSig.value }] : [] }) });
  busySig.value = false;
  if (!res.ok) return notify('Render failed');
  const d = await res.json();
  window.open(`/api/render/download/${d.job_id}`, '_blank');
  notify(`Rendered ${d.width}×${d.height} (${d.duration_sec}s)`);
}
