import { autoLightLeakSig, autoSfxSig, loggedEditsSig, minSilenceSig, paddingSig, punchInSig, silenceDbSig } from './controls';
import { busySig, mediaSig, segmentsSig, sequenceSig, sourceDurationSig, statusSig } from './signals';
import { refreshScript } from './actions_filmcraft';
import { apiUrl, resolveBackend } from './api';

const DEMO_SEGMENTS = [
  { index: 1, start: 0.85, end: 4.2, duration: 3.35, kind: 'hook', scale: 1.0, light_leak: false, sfx: 'hit', enabled: true, label: 'Cut 01' },
  { index: 2, start: 5.15, end: 9.8, duration: 4.65, kind: 'speech', scale: 1.12, light_leak: false, sfx: null, enabled: true, label: 'Cut 02 · Punch' },
  { index: 3, start: 11.4, end: 16.1, duration: 4.7, kind: 'speech', scale: 1.0, transition: 'whip-pan', light_leak: true, sfx: 'whoosh', enabled: true, label: 'Cut 03' },
  { index: 4, start: 17.05, end: 22.5, duration: 5.45, kind: 'speech', scale: 1.12, light_leak: false, sfx: null, enabled: true, label: 'Cut 04 · Punch' },
];

export async function initStudio() {
  await resolveBackend();
  try {
    const [st, seq, lrn] = await Promise.all([fetch(apiUrl('/api/filmcraft/status')).then((r) => r.json()), fetch(apiUrl('/api/filmcraft/sequence')).then((r) => r.json()), fetch(apiUrl('/api/learning/stats')).then((r) => r.json())]);
    statusSig.value = st; if (seq?.width) sequenceSig.value = seq; if (typeof lrn?.logged_edits === 'number') loggedEditsSig.value = lrn.logged_edits;
  } catch { /* static Pages mode */ }
  await runAnalyze();
}

export async function runAnalyze() {
  busySig.value = true;
  try {
    const m = mediaSig.value;
    const res = await fetch(apiUrl('/api/analyze'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ media_path: m?.path ?? null, duration_sec: m?.duration ?? 42, silence_db: silenceDbSig.value, min_silence_sec: minSilenceSig.value, padding_sec: paddingSig.value, punch_in_alternate: punchInSig.value, auto_sfx: autoSfxSig.value, auto_light_leak: autoLightLeakSig.value }) });
    const d = await res.json();
    sourceDurationSig.value = d.source_duration; segmentsSig.value = d.segments || [];
    await refreshScript();
  } catch { sourceDurationSig.value = 24; segmentsSig.value = DEMO_SEGMENTS; } finally { busySig.value = false; }
}
