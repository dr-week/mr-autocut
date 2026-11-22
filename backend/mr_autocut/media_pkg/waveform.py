"""Extract normalized 0..1 audio amplitude peaks using FFmpeg PCM pipe."""
import struct, subprocess

def extract_waveform_peaks(path: str, bars: int = 160) -> list[float]:
    try: raw = subprocess.check_output(["ffmpeg", "-hide_banner", "-v", "error", "-i", path, "-ac", "1", "-ar", "4000", "-f", "s16le", "-"], stderr=subprocess.DEVNULL, timeout=30)
    except Exception: return [0.2] * bars
    tot = len(raw) // 2
    if tot == 0: return [0.1] * bars
    samples, chunk = struct.unpack(f"<{tot}h", raw[:tot * 2]), max(1, tot // bars)
    return [0.05 if i * chunk >= tot else round(min(1.0, max(0.04, max(abs(x) for x in samples[i * chunk:min(tot, (i + 1) * chunk)]) / 32768.0)), 3) for i in range(bars)]
