"""Pydantic models for media ingestion and project folder scans."""
from pathlib import Path
from pydantic import BaseModel

CACHE_DIR = Path(__file__).resolve().parent.parent.parent / ".cache" / "media"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

class MediaInfo(BaseModel):
    media_id: str; filename: str; path: str; duration: float; width: int; height: int; fps: float; has_audio: bool; waveform: list[float]

class AssetItem(BaseModel):
    name: str; path: str; category: str; sub_tag: str; duration: float | None = None

class ProjectFolderScan(BaseModel):
    root: str; footage: list[AssetItem]; broll: list[AssetItem]; music: list[AssetItem]; sfx: list[AssetItem]; overlays: list[AssetItem]
