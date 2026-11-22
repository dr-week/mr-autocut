"""Lightweight FFmpeg PCM energy peak / beat-grid detector."""

from __future__ import annotations

from pydantic import BaseModel
from ..media import extract_waveform_peaks


class BeatGridResult(BaseModel):
    bpm_estimate: float
    beat_times: list[float]


def detect_beats_ffmpeg(media_path: str, duration: float, sensitivity: float = 0.72) -> BeatGridResult:
    peaks = extract_waveform_peaks(media_path, bars=max(32, int(duration * 10)))
    step = duration / max(1, len(peaks))
    beats = [round(i * step, 3) for i in range(1, len(peaks) - 1) if peaks[i] >= sensitivity and peaks[i] >= peaks[i - 1] and peaks[i] > peaks[i + 1]]
    bpm = round((len(beats) / max(0.1, duration)) * 60.0, 1) if beats else 120.0
    return BeatGridResult(bpm_estimate=bpm, beat_times=beats)
