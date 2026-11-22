"""Detect flash peaks / scene bursts inside the logo-free middle window."""
import re, subprocess
from ..engine import probe_duration

def find_transition_windows(src_path: str, trim_head: float = 2.0, trim_tail: float = 2.5, max_clips: int = 3) -> list[tuple[float, float, float]]:
    dur = probe_duration(src_path) or 10.0
    safe_start = min(trim_head, dur * 0.2)
    safe_end = max(safe_start + 1.2, dur - min(trim_tail, dur * 0.25))
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", src_path, "-vf", "select='gt(scene,0.18)',showinfo", "-f", "null", "-"], capture_output=True, text=True, timeout=30).stderr
    peaks = [float(t) for t in re.findall(r"pts_time:([0-9.]+)", out) if safe_start + 0.4 <= float(t) <= safe_end - 0.4]
    if not peaks: peaks = [round(safe_start + (safe_end - safe_start) * (i + 1) / (max_clips + 1), 2) for i in range(max_clips)]
    return [(round(max(safe_start, p - 0.65), 2), round(min(safe_end, p + 0.65), 2), round(p, 2)) for p in peaks[:max_clips]]
