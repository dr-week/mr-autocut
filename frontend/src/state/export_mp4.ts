import { captionTextSig } from './controls';
import { busySig, mediaSig, segmentsSig, sequenceSig } from './signals';
import { notify } from './notify';
import { postJson } from './post_json';

export async function exportSequenceMp4() {
  const m = mediaSig.value;
  if (!m) return notify('Drop a video file first to render MP4');
  busySig.value = true;
  const res = await postJson('/api/render', { media_path: m.path, segments: segmentsSig.value, sequence: sequenceSig.value, captions: captionTextSig.value ? [{ start: 0, end: 2.5, text: captionTextSig.value }] : [] });
  busySig.value = false;
  if (!res.ok) return notify('Render failed');
  const d = await res.json();
  window.open(`/api/render/download/${d.job_id}`, '_blank');
  notify(`Rendered ${d.width}×${d.height} (${d.duration_sec}s)`);
}
