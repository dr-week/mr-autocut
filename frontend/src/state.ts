import { signal, computed } from '@zuari/signals';

export interface SequenceSpec {
  width: number;
  height: number;
  fps: number;
  fit_mode: 'fill' | 'fit';
}

export interface Segment {
  index: number;
  start: number;
  end: number;
  duration: number;
  kind: string;
  scale: number;
  transition?: string | null;
  light_leak?: boolean;
  sfx?: string | null;
  enabled: boolean;
  label: string;
}

export interface MediaInfo {
  media_id: string;
  filename: string;
  path: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
  has_audio: boolean;
  waveform: number[];
}

export interface FilmCraftStatus {
  cli_available: boolean;
  cli_version: string | null;
  ffmpeg_available: boolean;
}

export type InspectorTab = 'autocut' | 'assets' | 'motion' | 'captions' | 'director';

export const SEQUENCE_PRESETS: Record<string, SequenceSpec> = {
  '16:9 HD': { width: 1920, height: 1080, fps: 30, fit_mode: 'fill' },
  '9:16 Reel': { width: 1080, height: 1920, fps: 30, fit_mode: 'fill' },
  '1:1 Square': { width: 1080, height: 1080, fps: 30, fit_mode: 'fill' },
  '4:5 Portrait': { width: 1080, height: 1350, fps: 30, fit_mode: 'fill' },
  '4K Cinema': { width: 3840, height: 2160, fps: 24, fit_mode: 'fill' },
};

// Core reactive Zuari signals
export const statusSig = signal<FilmCraftStatus | null>(null);
export const sequenceSig = signal<SequenceSpec>({ width: 1920, height: 1080, fps: 30, fit_mode: 'fill' });
export const activeTabSig = signal<InspectorTab>('autocut');
export const mediaSig = signal<MediaInfo | null>(null);
export const waveformSig = signal<number[]>(
  Array.from({ length: 120 }, (_, i) => 0.15 + Math.abs(Math.sin(i * 0.27) * Math.cos(i * 0.11)) * 0.8),
);
export const segmentsSig = signal<Segment[]>([]);
export const sourceDurationSig = signal<number>(42.0);
export const playheadSig = signal<number>(0);
export const safeZonesSig = signal<boolean>(true);

// Auto-Cut controls
export const silenceDbSig = signal<number>(-32);
export const minSilenceSig = signal<number>(0.28);
export const paddingSig = signal<number>(0.06);
export const punchInSig = signal<boolean>(true);
export const autoSfxSig = signal<boolean>(true);
export const autoLightLeakSig = signal<boolean>(true);

// Captions & AI Director
export const captionTextSig = signal<string>('MR-AUTOCUT · SEQUENCE ADAPTIVE');
export const directorPromptSig = signal<string>('');
export const directorOutputSig = signal<string>('');

// FilmCraft Bridge & Learning
export const bridgeAddrSig = signal<string>('127.0.0.1:9001');
export const jsonlSig = signal<string>('');
export const cliCmdSig = signal<string>('');
export const toastSig = signal<string>('');
export const loggedEditsSig = signal<number>(0);

export const statsSig = computed(() => {
  const segs = segmentsSig.value;
  const dur = sourceDurationSig.value;
  const kept = segs.filter((s) => s.enabled).reduce((a, b) => a + b.duration, 0);
  const removed = Math.max(0, dur - kept);
  const pct = dur > 0 ? (removed / dur) * 100 : 0;
  return {
    kept: kept.toFixed(1),
    removed: removed.toFixed(1),
    pct: pct.toFixed(1),
    activeCount: segs.filter((s) => s.enabled).length,
  };
});

export function notify(msg: string) {
  toastSig.value = msg;
  setTimeout(() => {
    if (toastSig.value === msg) toastSig.value = '';
  }, 2600);
}

export async function initStudio() {
  try {
    const [st, seq, learn] = await Promise.all([
      fetch('/api/filmcraft/status').then((r) => r.json()),
      fetch('/api/filmcraft/sequence').then((r) => r.json()),
      fetch('/api/learning/stats').then((r) => r.json()),
    ]);
    statusSig.value = st;
    if (seq?.width) sequenceSig.value = seq;
    if (typeof learn?.logged_edits === 'number') loggedEditsSig.value = learn.logged_edits;
  } catch {
    // Offline preview fallback
  }
  await runAnalyze();
}

export async function runAnalyze() {
  const media = mediaSig.value;
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_path: media?.path ?? null,
        duration_sec: media?.duration ?? 42.0,
        silence_db: silenceDbSig.value,
        min_silence_sec: minSilenceSig.value,
        padding_sec: paddingSig.value,
        punch_in_alternate: punchInSig.value,
        auto_sfx: autoSfxSig.value,
        auto_light_leak: autoLightLeakSig.value,
      }),
    });
    const data = await res.json();
    sourceDurationSig.value = data.source_duration;
    segmentsSig.value = data.segments || [];
    await refreshScript();
  } catch {
    notify('Backend offline — start uvicorn on :8000');
  }
}

export async function uploadMediaFile(file: File) {
  const form = new FormData();
  form.append('file', file);
  notify(`Analyzing ${file.name}...`);
  const res = await fetch('/api/media/upload', { method: 'POST', body: form });
  if (!res.ok) return notify('Upload failed');
  const info: MediaInfo = await res.json();
  mediaSig.value = info;
  waveformSig.value = info.waveform;
  sourceDurationSig.value = info.duration;
  notify(`Loaded ${info.filename} (${info.width}×${info.height})`);
  await runAnalyze();
}

export async function toggleSegment(index: number) {
  const updated = segmentsSig.value.map((s) =>
    s.index === index ? { ...s, enabled: !s.enabled } : s,
  );
  segmentsSig.value = updated;
  const seg = updated.find((s) => s.index === index);
  if (seg) {
    fetch('/api/learning/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clip_features: { duration: seg.duration, kind: seg.kind },
        suggested: { keep: true, punch_in: seg.scale > 1 },
        user_final: { keep: seg.enabled, punch_in: seg.scale > 1 },
      }),
    })
      .then((r) => r.json())
      .then((d) => loggedEditsSig.value = d.logged_edits)
      .catch(() => {});
  }
  await refreshScript();
}

export async function refreshScript() {
  try {
    const res = await fetch('/api/filmcraft/script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        segments: segmentsSig.value,
        sequence: sequenceSig.value,
        bridge_addr: bridgeAddrSig.value || null,
      }),
    });
    const d = await res.json();
    jsonlSig.value = d.jsonl || '';
    cliCmdSig.value = d.cli_invocation || '';
  } catch {
    // ignore
  }
}

export async function executeInFilmCraft() {
  notify('Sending batch to FilmCraft...');
  const res = await fetch('/api/filmcraft/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      segments: segmentsSig.value,
      sequence: sequenceSig.value,
      bridge_addr: bridgeAddrSig.value || null,
    }),
  });
  const d = await res.json();
  notify(d.exit_code === 0 ? 'Applied to FilmCraft!' : `FilmCraft exited (${d.exit_code})`);
}

export async function exportSequenceMp4() {
  const media = mediaSig.value;
  if (!media) return notify('Drop a video file first to render MP4');
  const seq = sequenceSig.value;
  notify(`Rendering ${seq.width}×${seq.height} MP4...`);
  const res = await fetch('/api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_path: media.path,
      segments: segmentsSig.value,
      sequence: seq,
      captions: captionTextSig.value
        ? [{ start: 0, end: 2.5, text: captionTextSig.value }]
        : [],
    }),
  });
  if (!res.ok) return notify('Render failed');
  const d = await res.json();
  window.open(`/api/render/download/${d.job_id}`, '_blank');
  notify(`Rendered ${d.width}×${d.height} (${d.duration_sec}s)`);
}
