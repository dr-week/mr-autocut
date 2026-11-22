import { busySig } from './signals';
import type { MediaInfo } from './types';
import { activeApiSig, apiUrl } from './api';
import { uploadInBrowser } from './upload_browser';
import { applyMedia } from './apply_media';
import { notify } from './notify';
import { runAnalyze } from './run_analyze';

export async function uploadMediaFile(file: File) {
  busySig.value = true;
  if (activeApiSig.value === 'static-demo') return uploadInBrowser(file).finally(() => (busySig.value = false));
  const form = new FormData(); form.append('file', file);
  const res = await fetch(apiUrl('/api/media/upload'), { method: 'POST', body: form }); busySig.value = false;
  if (!res.ok) return notify('Upload failed');
  const info: MediaInfo = await res.json(); applyMedia(info); notify(`Loaded ${info.filename} (${info.width}×${info.height})`); await runAnalyze();
}
