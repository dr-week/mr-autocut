import { loggedEditsSig } from './controls';
import { segmentsSig } from './signals';
import { refreshScript } from './refresh_script';
import { postJson } from './post_json';

export async function toggleSegment(index: number) {
  segmentsSig.value = segmentsSig.value.map((s) => (s.index === index ? { ...s, enabled: !s.enabled } : s));
  const seg = segmentsSig.value.find((s) => s.index === index);
  if (seg) postJson('/api/learning/log', { clip_features: { duration: seg.duration }, suggested: { keep: true }, user_final: { keep: seg.enabled } }).then((r) => r.json()).then((d) => (loggedEditsSig.value = d.logged_edits)).catch(() => {});
  await refreshScript();
}
