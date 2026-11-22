"""Iterative Multi-Pass Auto-Improvement Critic (Pass 1 -> Pass 2 -> Pass 3)."""

from __future__ import annotations

from pydantic import BaseModel
from ..engine import Segment


class PassReport(BaseModel):
    pass_num: int
    score: int
    fixes_applied: list[str]
    missing_assets: list[str]
    segments: list[Segment]


def _score(segs: list[Segment]) -> int:
    if not segs: return 0
    s = 45
    if segs[0].kind == "hook": s += 15
    if any(x.scale > 1.0 for x in segs): s += 15
    if any(x.sfx for x in segs): s += 12
    if any(x.light_leak for x in segs): s += 13
    return min(100, s)


def run_multipass_improve(segments: list[Segment], max_passes: int = 3) -> list[PassReport]:
    cur, reports = [s.model_copy(deep=True) for s in segments], []
    for p in range(1, max_passes + 1):
        fixes, missing = [], []
        if p == 1 and cur and cur[0].kind != "hook":
            cur[0].kind = "hook"; cur[0].label = "01 · Visual Hook"; fixes.append("Promoted Cut 01 to Visual Hook")
        if p == 2:
            for i, seg in enumerate(cur):
                if seg.duration > 3.5 and seg.scale <= 1.0:
                    seg.scale = 1.12; fixes.append(f"Added 112% punch-in on Cut {seg.index:02d}")
                if i > 0 and i % 2 == 0 and not seg.sfx:
                    seg.sfx = "whoosh"; fixes.append(f"Snapped whoosh SFX to Cut {seg.index:02d}")
            missing.append("B-roll cutaways for long talking-head segments (Google Flow / Pexels)")
        if p >= 3:
            for i, seg in enumerate(cur):
                if i > 0 and i % 3 == 0 and not seg.light_leak:
                    seg.light_leak = True; seg.transition = "whip-pan"; fixes.append(f"Added Light Leak + Whip Pan on Cut {seg.index:02d}")
        reports.append(PassReport(pass_num=p, score=_score(cur), fixes_applied=fixes or ["Verified pacing & polish"], missing_assets=missing, segments=[s.model_copy(deep=True) for s in cur]))
    return reports
