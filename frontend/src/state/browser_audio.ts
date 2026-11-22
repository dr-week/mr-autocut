import type { MediaInfo, Segment } from './types';

export async function analyzeFileInBrowser(file: File, dbThreshold = -32): Promise<{ info: MediaInfo; segments: Segment[] }> {
  const ctx = new AudioContext();
  const buf = await ctx.decodeAudioData(await file.arrayBuffer());
  const ch = buf.getChannelData(0);
  const bars = 120, step = Math.max(1, Math.floor(ch.length / bars));
  const waveform = Array.from({ length: bars }, (_, i) => { let m = 0; for (let j = i * step; j < Math.min(ch.length, (i + 1) * step); j++) m = Math.max(m, Math.abs(ch[j])); return Math.max(0.04, Number(m.toFixed(3))); });
  const lin = Math.pow(10, dbThreshold / 20), dur = Number(buf.duration.toFixed(2)), dt = dur / bars;
  const segs: Segment[] = [];
  let s = -1;
  waveform.forEach((p, i) => {
    if (p >= lin && s < 0) s = i * dt;
    else if ((p < lin || i === bars - 1) && s >= 0) { const e = Number((i * dt).toFixed(2)); if (e - s >= 0.35) segs.push({ index: segs.length + 1, start: Number(s.toFixed(2)), end: e, duration: Number((e - s).toFixed(2)), kind: segs.length ? 'speech' : 'hook', scale: segs.length % 2 ? 1.12 : 1.0, light_leak: segs.length > 0 && segs.length % 3 === 0, sfx: segs.length % 3 === 0 ? 'whoosh' : null, enabled: true, label: `Cut ${String(segs.length + 1).padStart(2, '0')}` }); s = -1; }
  });
  await ctx.close();
  return { info: { media_id: 'browser', filename: file.name, path: URL.createObjectURL(file), duration: dur, width: 1920, height: 1080, fps: 30, has_audio: true, waveform }, segments: segs };
}
