"""Register, save, and resolve cached media files."""
import uuid
from pathlib import Path
from .models import CACHE_DIR, MediaInfo
from .probe import ffprobe_media
from .waveform import extract_waveform_peaks

def register_media_file(path: Path, filename: str | None = None) -> MediaInfo:
    m = ffprobe_media(str(path)); wf = extract_waveform_peaks(str(path)) if m["has_audio"] else [0.1] * 160
    return MediaInfo(media_id=path.stem if path.parent == CACHE_DIR else uuid.uuid4().hex[:10], filename=filename or path.name, path=str(path), duration=m["duration"], width=m["width"], height=m["height"], fps=m["fps"], has_audio=m["has_audio"], waveform=wf)

def save_uploaded_bytes(filename: str, content: bytes) -> MediaInfo:
    dest = CACHE_DIR / f"{uuid.uuid4().hex[:10]}{Path(filename).suffix or '.mp4'}"; dest.write_bytes(content); return register_media_file(dest, filename=filename)

def resolve_cached_media(media_id: str) -> Path | None:
    return next((p for p in CACHE_DIR.glob(f"{media_id}.*") if p.is_file()), None)
