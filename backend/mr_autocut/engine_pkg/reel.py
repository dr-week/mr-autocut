"""Sequence-adaptive reel montage planner."""
from .models import ReelPlanRequest, ReelPlanResult, Segment

def build_reel_plan(req: ReelPlanRequest) -> ReelPlanResult:
    hk = min(req.hook_duration_sec, req.target_duration_sec * 0.35)
    shots = [Segment(index=1, start=0.0, end=round(hk, 3), duration=round(hk, 3), kind="hook", scale=1.08, transition=req.transition, light_leak=req.auto_light_leak, sfx="riser" if req.auto_sfx else None, label="01 · Visual Hook")]
    pos, cur, idx = hk, hk + 0.5, 2
    while pos < req.target_duration_sec - 0.25:
        ln = min(req.avg_shot_sec, req.target_duration_sec - pos)
        if cur + ln > req.source_duration: cur = 0.0
        acc, knd = (idx % 3 == 0), ("broll" if idx % 3 == 0 else "speech")
        shots.append(Segment(index=idx, start=round(cur, 3), end=round(cur + ln, 3), duration=round(ln, 3), kind=knd, scale=1.12 if idx % 2 == 0 else 1.0, transition=req.transition if acc else None, light_leak=bool(req.auto_light_leak and acc), sfx="whoosh" if (req.auto_sfx and acc) else None, label=f"{idx:02d} · {'B-Roll Beat' if knd == 'broll' else 'Story Cut'}"))
        pos += ln; cur += ln + 0.8; idx += 1
    return ReelPlanResult(sequence=req.sequence, target_duration_sec=req.target_duration_sec, actual_duration_sec=round(sum(s.duration for s in shots), 3), shot_count=len(shots), shots=shots)
