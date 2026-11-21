"""Sequence-adaptive Auto-Cut, Auto-SFX/Light-Leak, AI Director, and FFmpeg render engine."""

from __future__ import annotations

import json
import re
import subprocess
import uuid
from pathlib import Path
from pydantic import BaseModel, Field

RENDER_DIR = Path(__file__).resolve().parent.parent / ".cache" / "renders"
RENDER_DIR.mkdir(parents=True, exist_ok=True)


class SequenceSpec(BaseModel):
    width: int = Field(default=1920, ge=128, le=7680)
    height: int = Field(default=1080, ge=128, le=7680)
    fps: float = Field(default=30.0, gt=1.0, le=240.0)
    fit_mode: str = "fill"  # "fill" (cover/crop) | "fit" (letterbox)


class Segment(BaseModel):
    index: int
    start: float
    end: float
    duration: float
    kind: str = "speech"  # speech | hook | broll | beat
    scale: float = 1.0
    transition: str | None = None
    light_leak: bool = False
    sfx: str | None = None
    enabled: bool = True
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
    auto_sfx: bool = True
    auto_light_leak: bool = True


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
    sequence: SequenceSpec = Field(default_factory=SequenceSpec)
    transition: str = "whip-flash"
    auto_sfx: bool = True
    auto_light_leak: bool = True
    segments: list[Segment] | None = None


class ReelPlanResult(BaseModel):
    sequence: SequenceSpec
    target_duration_sec: float
    actual_duration_sec: float
    shot_count: int
    shots: list[Segment]


class CaptionLine(BaseModel):
    start: float
    end: float
    text: str


class RenderRequest(BaseModel):
    media_path: str
    segments: list[Segment]
    sequence: SequenceSpec = Field(default_factory=SequenceSpec)
    captions: list[CaptionLine] = Field(default_factory=list)


class RenderResult(BaseModel):
    job_id: str
    output_path: str
    width: int
    height: int
    duration_sec: float


class DirectorPromptRequest(BaseModel):
    instruction: str
    sequence: SequenceSpec = Field(default_factory=SequenceSpec)
    segments: list[Segment] = Field(default_factory=list)
    available_assets: dict[str, list[str]] = Field(default_factory=dict)


class DirectorPromptResult(BaseModel):
    prompt: str
    expected_schema: dict


_SILENCE_START_RE = re.compile(r"silence_start:\s*([0-9.]+)")
_SILENCE_END_RE = re.compile(r"silence_end:\s*([0-9.]+)")


def probe_duration(media_path: str) -> float | None:
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
    auto_sfx: bool = True,
    auto_light_leak: bool = True,
) -> list[Segment]:
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

    merged: list[tuple[float, float]] = []
    for s, e in raw:
        if merged and s <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], e))
        else:
            merged.append((s, e))

    segments: list[Segment] = []
    for idx, (s, e) in enumerate(merged, start=1):
        scale = punch_in_scale if (punch_in_alternate and idx % 2 == 0) else 1.0
        is_accent = idx > 1 and idx % 3 == 0
        segments.append(
            Segment(
                index=idx,
                start=round(s, 3),
                end=round(e, 3),
                duration=round(e - s, 3),
                kind="hook" if idx == 1 else "speech",
                scale=round(scale, 3),
                transition="whip-pan" if is_accent else None,
                light_leak=bool(auto_light_leak and is_accent),
                sfx="whoosh" if (auto_sfx and is_accent) else ("hit" if (auto_sfx and idx == 1) else None),
                label=f"Cut {idx:02d}" + (" · Punch" if scale > 1.0 else ""),
            )
        )
    return segments


def analyze_media(req: AnalyzeRequest) -> AnalyzeResult:
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
        auto_sfx=req.auto_sfx,
        auto_light_leak=req.auto_light_leak,
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
    shots: list[Segment] = []
    timeline_pos = 0.0
    idx = 1

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
            light_leak=req.auto_light_leak,
            sfx="riser" if req.auto_sfx else None,
            label="01 · Visual Hook",
        )
    )
    timeline_pos += hook_len
    idx += 1

    source_cursor = hook_len + 0.5
    while timeline_pos < req.target_duration_sec - 0.25:
        remaining = req.target_duration_sec - timeline_pos
        shot_len = min(req.avg_shot_sec, remaining)
        if source_cursor + shot_len > req.source_duration:
            source_cursor = 0.0
        scale = 1.12 if idx % 2 == 0 else 1.0
        kind = "broll" if idx % 3 == 0 else "speech"
        is_accent = idx % 3 == 0
        shots.append(
            Segment(
                index=idx,
                start=round(source_cursor, 3),
                end=round(source_cursor + shot_len, 3),
                duration=round(shot_len, 3),
                kind=kind,
                scale=scale,
                transition=req.transition if is_accent else None,
                light_leak=bool(req.auto_light_leak and is_accent),
                sfx="whoosh" if (req.auto_sfx and is_accent) else None,
                label=f"{idx:02d} · {'B-Roll Beat' if kind == 'broll' else 'Story Cut'}",
            )
        )
        timeline_pos += shot_len
        source_cursor += shot_len + 0.8
        idx += 1

    actual = round(sum(s.duration for s in shots), 3)
    return ReelPlanResult(
        sequence=req.sequence,
        target_duration_sec=req.target_duration_sec,
        actual_duration_sec=actual,
        shot_count=len(shots),
        shots=shots,
    )


def _fmt_ass_time(sec: float) -> str:
    h = int(sec // 3600)
    m = int((sec % 3600) // 60)
    s = int(sec % 60)
    cs = int(round((sec - int(sec)) * 100)) % 100
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def write_ass_captions(captions: list[CaptionLine], seq: SequenceSpec, out_path: Path) -> Path:
    """Generate a lightweight ASS subtitle file scaled proportionally to the sequence size."""
    font_size = max(28, int(seq.height * 0.048))
    margin_v = max(36, int(seq.height * 0.12))
    header = (
        "[Script Info]\n"
        "ScriptType: v4.00+\n"
        f"PlayResX: {seq.width}\n"
        f"PlayResY: {seq.height}\n\n"
        "[V4+ Styles]\n"
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, "
        "Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, "
        "Alignment, MarginL, MarginR, MarginV, Encoding\n"
        f"Style: Minimal,DejaVu Sans,{font_size},&H00FFFFFF,&H0038BDF8,&H00080A10,&H80000000,"
        f"-1,0,0,0,100,100,0,0,1,3,1,2,40,40,{margin_v},1\n\n"
        "[Events]\n"
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n"
    )
    events = [
        f"Dialogue: 0,{_fmt_ass_time(c.start)},{_fmt_ass_time(c.end)},Minimal,,0,0,0,,{c.text}"
        for c in captions
    ]
    out_path.write_text(header + "\n".join(events) + "\n", encoding="utf-8")
    return out_path


def render_sequence_ffmpeg(req: RenderRequest) -> RenderResult:
    """Render enabled segments to an H.264 MP4 matched exactly to req.sequence (width x height)."""
    enabled = [s for s in req.segments if s.enabled]
    if not enabled:
        raise ValueError("No enabled segments to render")

    job_id = uuid.uuid4().hex[:10]
    out_path = RENDER_DIR / f"autocut_{job_id}.mp4"
    seq = req.sequence

    if seq.fit_mode == "fit":
        scale_vf = (
            f"scale={seq.width}:{seq.height}:force_original_aspect_ratio=decrease,"
            f"pad={seq.width}:{seq.height}:(ow-iw)/2:(oh-ih)/2:black"
        )
    else:
        scale_vf = (
            f"scale={seq.width}:{seq.height}:force_original_aspect_ratio=increase,"
            f"crop={seq.width}:{seq.height}"
        )

    filter_parts: list[str] = []
    concat_inputs: list[str] = []
    for i, seg in enumerate(enabled):
        filter_parts.append(
            f"[0:v]trim=start={seg.start}:end={seg.end},setpts=PTS-STARTPTS,{scale_vf}[v{i}]"
        )
        filter_parts.append(
            f"[0:a]atrim=start={seg.start}:end={seg.end},asetpts=PTS-STARTPTS[a{i}]"
        )
        concat_inputs.append(f"[v{i}][a{i}]")

    n = len(enabled)
    filter_parts.append(f"{''.join(concat_inputs)}concat=n={n}:v=1:a=1[vout][aout]")

    v_map = "[vout]"
    if req.captions:
        ass_path = RENDER_DIR / f"autocut_{job_id}.ass"
        write_ass_captions(req.captions, seq, ass_path)
        escaped = str(ass_path).replace(":", "\\:")
        filter_parts.append(f"[vout]ass='{escaped}'[vsub]")
        v_map = "[vsub]"

    cmd = [
        "ffmpeg",
        "-y",
        "-hide_banner",
        "-v",
        "error",
        "-i",
        req.media_path,
        "-filter_complex",
        ";".join(filter_parts),
        "-map",
        v_map,
        "-map",
        "[aout]",
        "-r",
        str(seq.fps),
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-c:a",
        "aac",
        str(out_path),
    ]
    subprocess.run(cmd, check=True, timeout=180)
    dur = probe_duration(str(out_path)) or round(sum(s.duration for s in enabled), 3)
    return RenderResult(
        job_id=job_id,
        output_path=str(out_path),
        width=seq.width,
        height=seq.height,
        duration_sec=round(dur, 3),
    )


def build_director_prompt(req: DirectorPromptRequest) -> DirectorPromptResult:
    """Build a copy-pasteable / Colab-ready prompt for any free AI to return a structured EditPlan."""
    schema = {
        "segments": [
            {
                "index": 1,
                "start": 0.0,
                "end": 3.2,
                "duration": 3.2,
                "kind": "hook",
                "scale": 1.12,
                "transition": "whip-pan",
                "light_leak": True,
                "sfx": "whoosh",
                "label": "01 · Hook",
            }
        ]
    }
    prompt = (
        "You are an expert Premiere Pro / FilmCraft video editor.\n"
        f"Target Sequence: {req.sequence.width}x{req.sequence.height} @ {req.sequence.fps}fps ({req.sequence.fit_mode}).\n"
        f"User Direction: {req.instruction}\n"
        f"Available Project Assets: {json.dumps(req.available_assets)}\n"
        f"Current Detected Segments: {json.dumps([s.model_dump() for s in req.segments])}\n\n"
        "Return ONLY valid JSON matching this schema (no markdown fences):\n"
        f"{json.dumps(schema, indent=2)}"
    )
    return DirectorPromptResult(prompt=prompt, expected_schema=schema)
