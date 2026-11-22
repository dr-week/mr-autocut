"""FFmpeg silence detection, duration probe, and simulated silence regions."""
import re, subprocess

_ST_RE, _EN_RE = re.compile(r"silence_start:\s*([0-9.]+)"), re.compile(r"silence_end:\s*([0-9.]+)")

def probe_duration(media_path: str) -> float | None:
    try: return float(out) if (out := subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", media_path], stderr=subprocess.DEVNULL, text=True, timeout=15).strip()) else None
    except Exception: return None

def detect_silences_ffmpeg(media_path: str, silence_db: float, min_silence_sec: float) -> list[tuple[float, float]]:
    proc = subprocess.run(["ffmpeg", "-hide_banner", "-i", media_path, "-af", f"silencedetect=noise={silence_db}dB:d={min_silence_sec}", "-f", "null", "-"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=60)
    silences, cur = [], None
    for ln in proc.stderr.splitlines():
        if m := _ST_RE.search(ln): cur = float(m.group(1))
        elif (m := _EN_RE.search(ln)) and cur is not None: silences.append((cur, float(m.group(1)))); cur = None
    return silences

def _simulated_silences(duration: float, min_silence_sec: float) -> list[tuple[float, float]]:
    return [(round(s, 3), round(min(e, duration), 3)) for s, e in [(0.0, 0.85), (4.2, 5.15), (9.8, 11.4), (16.1, 17.05), (22.5, 24.3), (29.0, 30.2), (35.8, 37.9), (40.8, 42.0)] if s < duration and min(e, duration) - s >= min_silence_sec]
