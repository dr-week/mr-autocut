import type { MediaInfo, Segment } from './types';
import { waveformPeaks } from './waveform_peaks';
import { detectSegments } from './detect_segments';

export async function analyzeFileInBrowser(file: File, dbThreshold = -32): Promise<{ info: MediaInfo; segments: Segment[] }> {
  const ctx = new AudioContext();
  const buf = await ctx.decodeAudioData(await file.arrayBuffer());
  const waveform = waveformPeaks(buf.getChannelData(0));
  const dur = Number(buf.duration.toFixed(2));
  await ctx.close();
  return { info: { media_id: 'browser', filename: file.name, path: URL.createObjectURL(file), duration: dur, width: 1920, height: 1080, fps: 30, has_audio: true, waveform }, segments: detectSegments(waveform, dbThreshold, dur) };
}
