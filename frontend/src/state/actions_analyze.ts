import { autoLightLeakSig, autoSfxSig, loggedEditsSig, minSilenceSig, paddingSig, punchInSig, silenceDbSig } from './controls';
import { busySig, mediaSig, segmentsSig, sequenceSig, sourceDurationSig, statusSig } from './signals';
import { notify } from './actions_media';
import { refreshScript } from './actions_filmcraft';

export async function initStudio() {
  try {
    const [st, seq, lrn] = await Promise.all([fetch('/api/filmcraft/status').then((r) => r.json()), fetch('/api/filmcraft/sequence').then((r) => r.json()), fetch('/api/learning/stats').then((r) => r.json())]);
    statusSig.value = st;
    if (seq?.width) sequenceSig.value = seq;
    if (typeof lrn?.logged_edits === 'number') loggedEditsSig.value = lrn.logged_edits;
  } catch { /* offline */ }
  await runAnalyze();
}

export async function runAnalyze() {
  busySig.value = true;
  try {
    const m = mediaSig.value;
    const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ media_path: m?.path ?? null, duration_sec: m?.duration ?? 42, silence_db: silenceDbSig.value, min_silence_sec: minSilenceSig.value, padding_sec: paddingSig.value, punch_in_alternate: punchInSig.value, auto_sfx: autoSfxSig.value, auto_light_leak: autoLightLeakSig.value }) });
    const d = await res.json();
    sourceDurationSig.value = d.source_duration;
    segmentsSig.value = d.segments || [];
    await refreshScript();
  } catch { notify('Backend offline — start uvicorn :8000'); } finally { busySig.value = false; }
}
