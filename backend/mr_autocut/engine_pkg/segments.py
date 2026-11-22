"""Build kept speech segments with punch-in, SFX, and light-leak tags."""
from pathlib import Path
from .models import AnalyzeRequest, AnalyzeResult, Segment
from .silence import _simulated_silences, detect_silences_ffmpeg, probe_duration

def build_kept_segments(duration: float, silences: list[tuple[float, float]], padding_sec: float, min_clip_sec: float, punch_in_alternate: bool, punch_in_scale: float, auto_sfx: bool = True, auto_light_leak: bool = True) -> list[Segment]:
    raw, cur, merged = [], 0.0, []
    for s, e in sorted(silences):
        if (en := min(duration, s + padding_sec)) - (st := (max(0.0, cur - padding_sec) if cur > 0 else 0.0)) >= min_clip_sec: raw.append((st, en))
        cur = max(cur, e)
    if duration - cur >= min_clip_sec: raw.append((max(0.0, cur - padding_sec) if cur > 0 else 0.0, duration))
    for s, e in raw: merged[-1:] = [(merged[-1][0], max(merged[-1][1], e))] if merged and s <= merged[-1][1] else [*merged[-1:], (s, e)]
    return [Segment(index=i, start=round(s, 3), end=round(e, 3), duration=round(e - s, 3), kind="hook" if i == 1 else "speech", scale=round(punch_in_scale if (punch_in_alternate and i % 2 == 0) else 1.0, 3), transition="whip-pan" if (i > 1 and i % 3 == 0) else None, light_leak=bool(auto_light_leak and i > 1 and i % 3 == 0), sfx="whoosh" if (auto_sfx and i > 1 and i % 3 == 0) else ("hit" if (auto_sfx and i == 1) else None), label=f"Cut {i:02d}" + (" · Punch" if (punch_in_alternate and i % 2 == 0 and punch_in_scale > 1.0) else "")) for i, (s, e) in enumerate(merged, 1)]
def analyze_media(req: AnalyzeRequest) -> AnalyzeResult:
    is_f = bool(req.media_path and Path(req.media_path).is_file()); dur = (probe_duration(req.media_path) or req.duration_sec) if is_f else req.duration_sec; sils = detect_silences_ffmpeg(req.media_path, req.silence_db, req.min_silence_sec) if is_f else _simulated_silences(dur, req.min_silence_sec); segs = build_kept_segments(dur, sils, req.padding_sec, req.min_clip_sec, req.punch_in_alternate, req.punch_in_scale, req.auto_sfx, req.auto_light_leak); kept = round(sum(s.duration for s in segs), 3); rem = round(max(0.0, dur - kept), 3)
    return AnalyzeResult(source_duration=round(dur, 3), kept_duration=kept, removed_duration=rem, reduction_pct=round((rem / dur) * 100.0, 1) if dur > 0 else 0.0, silence_regions=sils, segments=segs, mode="ffmpeg" if is_f else "simulated")
