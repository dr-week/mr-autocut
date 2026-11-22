import { segmentsSig } from './signals';
import { silenceDbSig } from './controls';
import { analyzeFileInBrowser } from './browser_audio';
import { applyMedia } from './apply_media';
import { notify } from './notify';

export async function uploadInBrowser(file: File) {
  const { info, segments } = await analyzeFileInBrowser(file, silenceDbSig.value);
  applyMedia(info); segmentsSig.value = segments;
  notify(`Browser Auto-Cut: ${segments.length} cuts (${info.duration}s)`);
}
