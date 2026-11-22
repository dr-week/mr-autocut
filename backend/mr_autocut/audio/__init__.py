"""Audio intelligence department: beat-grid detection & speech-triggered auto-ducking."""

from .beats import BeatGridResult, detect_beats_ffmpeg
from .ducking import DuckWindow, build_ducking_curve

__all__ = ["BeatGridResult", "detect_beats_ffmpeg", "DuckWindow", "build_ducking_curve"]
