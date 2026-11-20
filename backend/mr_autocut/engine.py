"""Auto-cut & 9:16 Reel planning engine powered by FFmpeg."""

from __future__ import annotations

import re
import subprocess
from pathlib import Path
from pydantic import BaseModel, Field


class Segment(BaseModel):
    index: int
    start: float
    end: float
    duration: float
    kind: str = "speech"  # speech | hook | broll | beat
    scale: float = 1.0
    transition: str | None = None
    label: str = ""


class AnalyzeRequest(BaseModel):
    media_path: str | None = None
    duration_sec: float = Field(default=42.0, gt=0.1)
    silence_db: float = Field(default=-32.0, le=0.0, ge=-80.0)
    min_silence_sec: float = Field(default=0.30, gt=0.05, le=10.0)
    padding_sec: float = Field(default=0.06, ge=0.0, le=1.0)
    min_clip_sec: float = Field(default=0.35, gt=0.05, le=10.0)
    punch_in_alternate: bool = True
    punch_in_scale: float = Field(default=1.12, ge=1.0, le=1.5)


class AnalyzeResult(BaseModel):
    source_duration: float
    kept_duration: float
    removed_duration: float
    reduction_pct: float
    silence_regions: list[tuple[float, float]]
    segments: list[Segment]
    mode: str  # "ffmpeg" | "simulated"


class ReelPlanRequest(BaseModel):
    source_duration: float = Field(default=60.0, gt=1.0)
    target_duration_sec: float = Field(default=30.0, gt=3.0, le=180.0)
    avg_shot_sec: float = Field(default=1.6, gt=0.3, le=10.0)
    hook_duration_sec: float = Field(default=3.0, gt=0.5, le=10.0)
    aspect: str = "9:16"
    transition: str = "whip-flash"
    segments: list[Segment] | None = None


class ReelPlanResult(BaseModel):
    aspect: str
    target_duration_sec: float
    actual_duration_sec: float
    shot_count: int
    shots: list[Segment]


_SILENCE_START_RE = re.compile(r"silence_start:\s*([0-9.]+)")
_SILENCE_END_RE = re.compile(r"silence_end:\s*([0-9.]+)")


def probe_duration(media_path: str) -> float | None:
    """Return media duration in seconds using ffprobe, or None if unavailable."""
    try:
        out = subprocess.check_output(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                media_path,
            ],
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=15,
        ).strip()
        return float(out) if out else None
    except Exception:
        return None


def detect_silences_ffmpeg(
    media_path: str, silence_db: float, min_silence_sec: float
) -> list[tuple[float, float]]:
    """Run ffmpeg silencedetect on a real media file."""
    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-i",
        media_path,
        "-af",
        f"silencedetect=noise={silence_db}dB:d={min_silence_sec}",
        "-f",
        "null",
        "-",
    ]
    proc = subprocess.run(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=60
    )
    silences: list[tuple[float, float]] = []
    current_start: float | None = None
    for line in proc.stderr.splitlines():
        m_start = _SILENCE_START_RE.search(line)
        if m_start:
            current_start = float(m_start.group(1))
            continue
        m_end = _SILENCE_END_RE.search(line)
        if m_end and current_start is not None:
            silences.append((current_start, float(m_end.group(1))))
            current_start = None
    return silences


def _simulated_silences(duration: float, min_silence_sec: float) -> list[tuple[float, float]]:
    """Deterministic demo silence regions when no media file is supplied."""
    base_gaps = [
        (0.0, 0.85),
        (4.2, 5.15),
        (9.8, 11.4),
        (16.1, 17.05),
        (22.5, 24.3),
        (29.0, 30.2),
        (35.8, 37.9),
        (40.8, 42.0),
    ]
    gaps = []
    for s, e in base_gaps:
        if s >= duration:
            break
        end = min(e, duration)
        if end - s >= min_silence_sec:
            gaps.append((round(s, 3), round(end, 3)))
    return gaps


def build_kept_segments(
    duration: float,
    silences: list[tuple[float, float]],
    padding_sec: float,
    min_clip_sec: float,
    punch_in_alternate: bool,
    punch_in_scale: float,
) -> list[Segment]:
    """Invert silence intervals into kept speech segments with padding & punch-ins."""
    raw: list[tuple[float, float]] = []
    cursor = 0.0
    for s, e in sorted(silences):
        seg_start = max(0.0, cursor - padding_sec) if cursor > 0 else 0.0
        seg_end = min(duration, s + padding_sec)
        if seg_end - seg_start >= min_clip_sec:
            raw.append((seg_start, seg_end))
        cursor = max(cursor, e)

    if duration - cursor >= min_clip_sec:
        seg_start = max(0.0, cursor - padding_sec) if cursor > 0 else 0.0
        raw.append((seg_start, duration))

    # Merge overlapping intervals caused by padding
    merged: list[tuple[float, float]] = []
    for s, e in raw:
        if merged and s <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], e))
        else:
            merged.append((s, e))

    segments: list[Segment] = []
    for idx, (s, e) in enumerate(merged, start=1):
        scale = punch_in_scale if (punch_in_alternate and idx % 2 == 0) else 1.0
        segments.append(
            Segment(
                index=idx,
                start=round(s, 3),
                end=round(e, 3),
                duration=round(e - s, 3),
                kind="speech",
                scale=round(scale, 3),
                label=f"Cut {idx:02d}" + (" · Punch" if scale > 1.0 else ""),
            )
        )
    return segments


def analyze_media(req: AnalyzeRequest) -> AnalyzeResult:
    """Analyze a real media file with FFmpeg or run in deterministic preview mode."""
    if req.media_path and Path(req.media_path).is_file():
        duration = probe_duration(req.media_path) or req.duration_sec
        silences = detect_silences_ffmpeg(
            req.media_path, req.silence_db, req.min_silence_sec
        )
        mode = "ffmpeg"
    else:
        duration = req.duration_sec
        silences = _simulated_silences(duration, req.min_silence_sec)
        mode = "simulated"

    segments = build_kept_segments(
        duration=duration,
        silences=silences,
        padding_sec=req.padding_sec,
        min_clip_sec=req.min_clip_sec,
        punch_in_alternate=req.punch_in_alternate,
        punch_in_scale=req.punch_in_scale,
    )
    kept = round(sum(s.duration for s in segments), 3)
    removed = round(max(0.0, duration - kept), 3)
    pct = round((removed / duration) * 100.0, 1) if duration > 0 else 0.0

    return AnalyzeResult(
        source_duration=round(duration, 3),
        kept_duration=kept,
        removed_duration=removed,
        reduction_pct=pct,
        silence_regions=silences,
        segments=segments,
        mode=mode,
    )


def build_reel_plan(req: ReelPlanRequest) -> ReelPlanResult:
    """Build a 9:16 vertical reel edit plan with hook, rapid body shots, and transitions."""
    shots: list[Segment] = []
    timeline_pos = 0.0
    idx = 1

    # 1. Opening Hook
    hook_len = min(req.hook_duration_sec, req.target_duration_sec * 0.35)
    shots.append(
        Segment(
            index=idx,
            start=0.0,
            end=round(hook_len, 3),
            duration=round(hook_len, 3),
            kind="hook",
            scale=1.08,
            transition=req.transition,
            label="01 · Visual Hook",
        )
    )
    timeline_pos += hook_len
    idx += 1

    # 2. Rapid rhythmic body shots
    source_cursor = hook_len + 0.5
    while timeline_pos < req.target_duration_sec - 0.25:
        remaining = req.target_duration_sec - timeline_pos
        shot_len = min(req.avg_shot_sec, remaining)
        if source_cursor + shot_len > req.source_duration:
            source_cursor = 0.0
        scale = 1.12 if idx % 2 == 0 else 1.0
        kind = "broll" if idx % 3 == 0 else "speech"
        shots.append(
            Segment(
                index=idx,
                start=round(source_cursor, 3),
                end=round(source_cursor + shot_len, 3),
                duration=round(shot_len, 3),
                kind=kind,
                scale=scale,
                transition=req.transition if idx % 3 == 0 else None,
                label=f"{idx:02d} · {'B-Roll Beat' if kind == 'broll' else 'Story Cut'}",
            )
        )
        timeline_pos += shot_len
        source_cursor += shot_len + 0.8
        idx += 1

    actual = round(sum(s.duration for s in shots), 3)
    return ReelPlanResult(
        aspect=req.aspect,
        target_duration_sec=req.target_duration_sec,
        actual_duration_sec=actual,
        shot_count=len(shots),
        shots=shots,
    )
