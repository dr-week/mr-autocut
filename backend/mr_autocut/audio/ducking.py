"""Speech-triggered music auto-ducking curve generator for A3 music tracks."""

from __future__ import annotations

from pydantic import BaseModel
from ..engine import Segment


class DuckWindow(BaseModel):
    start: float
    end: float
    volume_db: float


def build_ducking_curve(segments: list[Segment], duck_db: float = -12.0, attack_sec: float = 0.15) -> list[DuckWindow]:
    return [DuckWindow(start=round(max(0.0, s.start - attack_sec), 3), end=round(s.end + attack_sec, 3), volume_db=duck_db) for s in segments if s.enabled]
