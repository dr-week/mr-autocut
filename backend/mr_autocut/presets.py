"""Built-in presets for MR-AutoCut: Auto-Cut profiles, Reel styles, and Motion FX."""

from __future__ import annotations

from pydantic import BaseModel


class AutoCutPreset(BaseModel):
    id: str
    name: str
    tagline: str
    silence_db: float
    min_silence_sec: float
    padding_sec: float
    min_clip_sec: float
    punch_in_alternate: bool
    punch_in_scale: float


class ReelPreset(BaseModel):
    id: str
    name: str
    tagline: str
    aspect: str
    target_duration_sec: float
    avg_shot_sec: float
    hook_duration_sec: float
    pacing: str
    caption_style: str
    transition: str


class MotionPreset(BaseModel):
    id: str
    category: str
    name: str
    duration_sec: float
    easing: str
    description: str
    filmcraft_params: dict


AUTO_CUT_PRESETS: list[AutoCutPreset] = [
    AutoCutPreset(
        id="tight-creator",
        name="Hyper Cut",
        tagline="Zero dead air · Punch-in every alternate beat",
        silence_db=-32.0,
        min_silence_sec=0.28,
        padding_sec=0.06,
        min_clip_sec=0.35,
        punch_in_alternate=True,
        punch_in_scale=1.12,
    ),
    AutoCutPreset(
        id="podcast-clean",
        name="Podcast Flow",
        tagline="Natural breaths kept · Removes awkward pauses",
        silence_db=-38.0,
        min_silence_sec=0.65,
        padding_sec=0.14,
        min_clip_sec=0.6,
        punch_in_alternate=False,
        punch_in_scale=1.0,
    ),
    AutoCutPreset(
        id="cinematic-breath",
        name="Cinematic Pace",
        tagline="Preserves room tone & deliberate pauses",
        silence_db=-44.0,
        min_silence_sec=1.2,
        padding_sec=0.22,
        min_clip_sec=1.0,
        punch_in_alternate=False,
        punch_in_scale=1.0,
    ),
    AutoCutPreset(
        id="rapid-reel",
        name="Viral 9:16 Snap",
        tagline="Aggressive silence trim + 115% micro punch-ins",
        silence_db=-28.0,
        min_silence_sec=0.20,
        padding_sec=0.04,
        min_clip_sec=0.25,
        punch_in_alternate=True,
        punch_in_scale=1.15,
    ),
]

REEL_PRESETS: list[ReelPreset] = [
    ReelPreset(
        id="viral-hook-30",
        name="30s Viral Hook",
        tagline="3s visual hook · 1.6s micro-cuts · kinetic captions",
        aspect="9:16",
        target_duration_sec=30.0,
        avg_shot_sec=1.6,
        hook_duration_sec=3.0,
        pacing="fast",
        caption_style="minimal-mono-pop",
        transition="whip-flash",
    ),
    ReelPreset(
        id="cinematic-60",
        name="60s Cinema Reel",
        tagline="Smooth 2.8s cadence · subtle optical dissolve",
        aspect="9:16",
        target_duration_sec=60.0,
        avg_shot_sec=2.8,
        hook_duration_sec=4.0,
        pacing="medium",
        caption_style="glass-lower-third",
        transition="film-dissolve",
    ),
    ReelPreset(
        id="beat-drop-15",
        name="15s Beat Sync",
        tagline="Ultra-tight 0.85s beat-locked montage",
        aspect="9:16",
        target_duration_sec=15.0,
        avg_shot_sec=0.85,
        hook_duration_sec=2.0,
        pacing="hyper",
        caption_style="center-pulse",
        transition="glitch-cut",
    ),
]

MOTION_PRESETS: list[MotionPreset] = [
    MotionPreset(
        id="punch-in-112",
        category="Camera",
        name="Micro Punch-In 112%",
        duration_sec=0.18,
        easing="cubic-out",
        description="Subtle jump-cut scale boost to hide speech edits seamlessly.",
        filmcraft_params={"scale": 1.12, "anchor": "center"},
    ),
    MotionPreset(
        id="whip-pan-right",
        category="Transition",
        name="Optical Whip Pan",
        duration_sec=0.24,
        easing="expo-in-out",
        description="Directional motion-blur whip transition between reel scenes.",
        filmcraft_params={"direction": "right", "blur": 0.85},
    ),
    MotionPreset(
        id="kinetic-mono",
        category="Captions",
        name="Minimal Kinetic Type",
        duration_sec=0.14,
        easing="quart-out",
        description="High-contrast word-by-word reel caption pop.",
        filmcraft_params={"font": "Inter", "weight": 700, "highlight": "#38bdf8"},
    ),
    MotionPreset(
        id="flash-frame",
        category="Transition",
        name="1-Frame Exposure Flash",
        duration_sec=0.12,
        easing="linear",
        description="Clean editorial flash cut for beat drops and hook reveals.",
        filmcraft_params={"exposure_boost": 2.4},
    ),
    MotionPreset(
        id="smooth-zoom-out",
        category="Camera",
        name="Drift Zoom Out",
        duration_sec=2.4,
        easing="sine-in-out",
        description="Continuous slow pull-back for talking-head retention.",
        filmcraft_params={"scale_from": 1.14, "scale_to": 1.0},
    ),
    MotionPreset(
        id="letterbox-reveal",
        category="Framing",
        name="Anamorphic Reveal",
        duration_sec=0.55,
        easing="expo-out",
        description="Opens 2.39:1 matte bars into full 9:16 vertical frame.",
        filmcraft_params={"matte_from": 0.24, "matte_to": 0.0},
    ),
]
