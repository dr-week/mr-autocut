"""Free Stock & SFX API fetcher (Openverse CC0, Pexels, Pixabay, Freesound) + downloader."""
import json, os, urllib.parse, urllib.request
from pathlib import Path
from pydantic import BaseModel

ASSETS_CACHE = Path(__file__).resolve().parent.parent.parent / ".cache" / "assets"; ASSETS_CACHE.mkdir(parents=True, exist_ok=True)
class StockAsset(BaseModel): title: str; preview_url: str; download_url: str; source: str; license: str = "CC0 / Royalty-Free"
def _get_json(url: str, headers: dict[str, str] | None = None) -> dict: return json.loads(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "MR-AutoCut/0.4", **(headers or {})}), timeout=10).read().decode("utf-8"))

def search_free_assets(query: str, source: str = "openverse", orientation: str = "landscape", limit: int = 6) -> list[StockAsset]:
    q, pex, pix, fs = urllib.parse.quote(query), os.getenv("PEXELS_API_KEY", ""), os.getenv("PIXABAY_API_KEY", ""), os.getenv("FREESOUND_API_KEY", "")
    if source == "pexels": return [StockAsset(title=f"Pexels #{v['id']}", preview_url=v.get("image", ""), download_url=(v.get("video_files") or [{}])[0].get("link", ""), source="pexels") for v in (_get_json(f"https://api.pexels.com/videos/search?query={q}&orientation={orientation}&per_page={limit}", {"Authorization": pex}).get("videos", []) if pex else [])]
    if source == "pixabay": return [StockAsset(title=v.get("tags", "Pixabay"), preview_url="", download_url=v.get("videos", {}).get("medium", {}).get("url", ""), source="pixabay") for v in (_get_json(f"https://pixabay.com/api/videos/?key={pix}&q={q}&per_page={limit}").get("hits", []) if pix else [])]
    if source == "freesound": return [StockAsset(title=r.get("name", "SFX"), preview_url=r.get("previews", {}).get("preview-hq-mp3", ""), download_url=r.get("previews", {}).get("preview-hq-mp3", ""), source="freesound") for r in (_get_json(f"https://freesound.org/apiv2/search/text/?query={q}&page_size={limit}&fields=name,previews&token={fs}").get("results", []) if fs else [])]
    return [StockAsset(title=r.get("title") or "Openverse", preview_url=r.get("thumbnail") or r.get("url", ""), download_url=r.get("url", ""), source="openverse", license=r.get("license", "cc0")) for r in _get_json(f"https://api.openverse.org/v1/images/?q={q}&page_size={limit}").get("results", [])]

def download_asset(url: str, filename: str, dest_dir: str | None = None) -> Path:
    t = Path(dest_dir).expanduser() if dest_dir else ASSETS_CACHE; t.mkdir(parents=True, exist_ok=True); dest = t / Path(filename).name; dest.write_bytes(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "MR-AutoCut/0.4"}), timeout=20).read()); return dest
