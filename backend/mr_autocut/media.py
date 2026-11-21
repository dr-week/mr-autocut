"""Media ingestion, ffprobe metadata, waveform peak extraction, and Project Folder scanner."""

from __future__ import annotations

import json
import struct
import subprocess
import uuid
from pathlib import Path
from pydantic import BaseModel

CACHE_DIR = Path(__file__).resolve().parent.parent / ".cache" / "media"
CACHE_DIR.mkdir(parents=True, exist_ok=True)


class MediaInfo(BaseModel):
    media_id: str
    filename: str
    path: str
    duration: float
    width: int
    height: int
    fps: float
    has_audio: bool
    waveform: list[float]


class AssetItem(BaseModel):
    name: str
    path: str
    category: str  # footage | broll | music | sfx | overlays
    sub_tag: str  # whoosh | riser | hit | lightleak | general
    duration: float | None = None


class ProjectFolderScan(BaseModel):
    root: str
    footage: list[AssetItem]
    broll: list[AssetItem]
    music: list[AssetItem]
    sfx: list[AssetItem]
    overlays: list[AssetItem]


def ffprobe_media(path: str) -> dict:
    """Extract duration, width, height, fps, and audio presence via ffprobe."""
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_format",
        "-show_streams",
        "-of",
        "json",
        path,
    ]
    out = subprocess.check_output(cmd, text=True, stderr=subprocess.DEVNULL, timeout=15)
    data = json.loads(out)
    fmt = data.get("format", {})
    duration = float(fmt.get("duration") or 0.0)
    width, height, fps = 1920, 1080, 30.0
    has_audio = False
    for s in data.get("streams", []):
        if s.get("codec_type") == "video":
            width = int(s.get("width") or width)
            height = int(s.get("height") or height)
            r_fps = s.get("r_frame_rate") or "30/1"
            if "/" in r_fps:
                num, den = r_fps.split("/", 1)
                fps = round(float(num) / max(1.0, float(den)), 3)
        elif s.get("codec_type") == "audio":
            has_audio = True
    return {
        "duration": round(duration, 3),
        "width": width,
        "height": height,
        "fps": fps,
        "has_audio": has_audio,
    }


def extract_waveform_peaks(path: str, bars: int = 160) -> list[float]:
    """Extract normalized 0..1 audio amplitude peaks using FFmpeg PCM pipe."""
    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-v",
        "error",
        "-i",
        path,
        "-ac",
        "1",
        "-ar",
        "4000",
        "-f",
        "s16le",
        "-",
    ]
    try:
        raw = subprocess.check_output(cmd, stderr=subprocess.DEVNULL, timeout=30)
    except Exception:
        return [0.2] * bars

    total_samples = len(raw) // 2
    if total_samples == 0:
        return [0.1] * bars

    samples = struct.unpack(f"<{total_samples}h", raw[: total_samples * 2])
    chunk = max(1, total_samples // bars)
    peaks: list[float] = []
    for i in range(bars):
        start = i * chunk
        end = min(total_samples, start + chunk)
        if start >= total_samples:
            peaks.append(0.05)
        else:
            m = max(abs(x) for x in samples[start:end]) / 32768.0
            peaks.append(round(min(1.0, max(0.04, m)), 3))
    return peaks


def register_media_file(path: Path, filename: str | None = None) -> MediaInfo:
    """Register a local or uploaded media file and return metadata + waveform."""
    meta = ffprobe_media(str(path))
    waveform = extract_waveform_peaks(str(path)) if meta["has_audio"] else [0.1] * 160
    media_id = path.stem if path.parent == CACHE_DIR else uuid.uuid4().hex[:10]
    return MediaInfo(
        media_id=media_id,
        filename=filename or path.name,
        path=str(path),
        duration=meta["duration"],
        width=meta["width"],
        height=meta["height"],
        fps=meta["fps"],
        has_audio=meta["has_audio"],
        waveform=waveform,
    )


def save_uploaded_bytes(filename: str, content: bytes) -> MediaInfo:
    """Persist uploaded bytes to the cache directory and analyze them."""
    ext = Path(filename).suffix or ".mp4"
    media_id = uuid.uuid4().hex[:10]
    dest = CACHE_DIR / f"{media_id}{ext}"
    dest.write_bytes(content)
    return register_media_file(dest, filename=filename)


def resolve_cached_media(media_id: str) -> Path | None:
    """Find a cached media file by its media_id."""
    for p in CACHE_DIR.glob(f"{media_id}.*"):
        if p.is_file():
            return p
    return None


def _classify_sub_tag(name: str, category: str) -> str:
    low = name.lower()
    if category == "sfx":
        if any(k in low for k in ("whoosh", "swoosh", "whip", "swish")):
            return "whoosh"
        if any(k in low for k in ("riser", "swell", "build", "sweep")):
            return "riser"
        if any(k in low for k in ("hit", "impact", "boom", "drop", "punch")):
            return "hit"
    if category == "overlays":
        if any(k in low for k in ("leak", "burn", "flare", "flash", "glow")):
            return "lightleak"
    return "general"


_VIDEO_EXTS = {".mp4", ".mov", ".mkv", ".webm", ".avi", ".mxf"}
_AUDIO_EXTS = {".wav", ".mp3", ".aac", ".flac", ".ogg", ".m4a"}


def scan_project_folder(root_dir: str) -> ProjectFolderScan:
    """Scan a project folder for footage/, broll/, music/, sfx/, overlays/."""
    root = Path(root_dir).expanduser()
    buckets: dict[str, list[AssetItem]] = {
        "footage": [],
        "broll": [],
        "music": [],
        "sfx": [],
        "overlays": [],
    }
    if not root.is_dir():
        return ProjectFolderScan(root=str(root), **buckets)

    for cat in buckets:
        sub = root / cat
        if not sub.is_dir():
            continue
        allowed = _AUDIO_EXTS if cat in ("music", "sfx") else _VIDEO_EXTS
        for f in sorted(sub.iterdir()):
            if f.is_file() and f.suffix.lower() in allowed:
                buckets[cat].append(
                    AssetItem(
                        name=f.name,
                        path=str(f),
                        category=cat,
                        sub_tag=_classify_sub_tag(f.name, cat),
                    )
                )
    return ProjectFolderScan(root=str(root), **buckets)
