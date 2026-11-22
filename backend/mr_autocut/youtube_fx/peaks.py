"""Detect distinct flash peaks inside the logo-free middle window (min 1.2s apart)."""
import re, subprocess
from ..engine import probe_duration

def find_transition_windows(src_path: str, trim_head: float = 2.0, trim_tail: float = 2.5, max_clips: int = 12) -> list[tuple[float, float, float]]:
    dur = probe_duration(src_path) or 10.0
    st_lim, en_lim = min(trim_head, dur * 0.18), max(trim_head + 1.2, dur - min(trim_tail, dur * 0.2))
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", src_path, "-vf", "select='gt(scene,0.14)',showinfo", "-f", "null", "-"], capture_output=True, text=True, timeout=30).stderr
    raw, peaks = [float(t) for t in re.findall(r"pts_time:([0-9.]+)", out) if st_lim + 0.35 <= float(t) <= en_lim - 0.35], []
    for p in raw:
        if not peaks or p - peaks[-1] >= 1.25: peaks.append(p)
    if not peaks: peaks = [round(st_lim + (en_lim - st_lim) * (i + 1) / (min(4, max_clips) + 1), 2) for i in range(min(4, max_clips))]
    return [(round(max(st_lim, p - 0.55), 2), round(min(en_lim, p + 0.55), 2), round(p, 2)) for p in peaks[:max_clips]]
