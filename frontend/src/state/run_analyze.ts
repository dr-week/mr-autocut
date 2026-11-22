import { autoLightLeakSig, autoSfxSig, minSilenceSig, paddingSig, punchInSig, silenceDbSig } from './controls';
import { busySig, mediaSig, segmentsSig, sourceDurationSig } from './signals';
import { refreshScript } from './refresh_script';
import { apiUrl } from './api';
import { DEMO_SEGMENTS } from './demo_segments';
import { postJson } from './post_json';

export async function runAnalyze() {
  busySig.value = true;
  try {
    const m = mediaSig.value;
    const d = await postJson(apiUrl('/api/analyze'), { media_path: m?.path ?? null, duration_sec: m?.duration ?? 42, silence_db: silenceDbSig.value, min_silence_sec: minSilenceSig.value, padding_sec: paddingSig.value, punch_in_alternate: punchInSig.value, auto_sfx: autoSfxSig.value, auto_light_leak: autoLightLeakSig.value }).then((r) => r.json());
    sourceDurationSig.value = d.source_duration; segmentsSig.value = d.segments || [];
    await refreshScript();
  } catch { sourceDurationSig.value = 24; segmentsSig.value = DEMO_SEGMENTS; } finally { busySig.value = false; }
}
