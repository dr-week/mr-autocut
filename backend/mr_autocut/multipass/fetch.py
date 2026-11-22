"""Free Stock & SFX API fetcher (Openverse CC0, Pexels, Pixabay, Freesound) + downloader."""

from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request
from pathlib import Path
from pydantic import BaseModel

ASSETS_CACHE = Path(__file__).resolve().parent.parent.parent / ".cache" / "assets"
ASSETS_CACHE.mkdir(parents=True, exist_ok=True)


class StockAsset(BaseModel):
    title: str
    preview_url: str
    download_url: str
    source: str
    license: str = "CC0 / Royalty-Free"


def _get_json(url: str, headers: dict[str, str] | None = None) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "MR-AutoCut/0.2", **(headers or {})})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def search_free_assets(query: str, source: str = "openverse", orientation: str = "landscape", limit: int = 6) -> list[StockAsset]:
    q = urllib.parse.quote(query)
    if source == "pexels":
        key = os.getenv("PEXELS_API_KEY", "")
        if not key: return []
        data = _get_json(f"https://api.pexels.com/videos/search?query={q}&orientation={orientation}&per_page={limit}", {"Authorization": key})
        return [StockAsset(title=f"Pexels #{v['id']}", preview_url=v.get("image", ""), download_url=(v.get("video_files") or [{}])[0].get("link", ""), source="pexels") for v in data.get("videos", [])]
    if source == "pixabay":
        key = os.getenv("PIXABAY_API_KEY", "")
        if not key: return []
        data = _get_json(f"https://pixabay.com/api/videos/?key={key}&q={q}&per_page={limit}")
        return [StockAsset(title=v.get("tags", "Pixabay"), preview_url="", download_url=v.get("videos", {}).get("medium", {}).get("url", ""), source="pixabay") for v in data.get("hits", [])]
    if source == "freesound":
        key = os.getenv("FREESOUND_API_KEY", "")
        if not key: return []
        data = _get_json(f"https://freesound.org/apiv2/search/text/?query={q}&page_size={limit}&fields=name,previews&token={key}")
        return [StockAsset(title=r.get("name", "SFX"), preview_url=r.get("previews", {}).get("preview-hq-mp3", ""), download_url=r.get("previews", {}).get("preview-hq-mp3", ""), source="freesound") for r in data.get("results", [])]
    data = _get_json(f"https://api.openverse.org/v1/images/?q={q}&page_size={limit}")
    return [StockAsset(title=r.get("title") or "Openverse", preview_url=r.get("thumbnail") or r.get("url", ""), download_url=r.get("url", ""), source="openverse", license=r.get("license", "cc0")) for r in data.get("results", [])]


def download_asset(url: str, filename: str, dest_dir: str | None = None) -> Path:
    target_dir = Path(dest_dir).expanduser() if dest_dir else ASSETS_CACHE
    target_dir.mkdir(parents=True, exist_ok=True)
    dest = target_dir / Path(filename).name
    req = urllib.request.Request(url, headers={"User-Agent": "MR-AutoCut/0.2"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        dest.write_bytes(resp.read())
    return dest
