"""Download YouTube transition compilation videos via yt-dlp into cache."""
from pathlib import Path
from ..media import CACHE_DIR

YT_CACHE = CACHE_DIR / "youtube_fx"
YT_CACHE.mkdir(parents=True, exist_ok=True)

def download_yt_source(url: str, vid_id: str) -> Path:
    import yt_dlp
    out_tpl = str(YT_CACHE / f"src_{vid_id}.%(ext)s")
    existing = list(YT_CACHE.glob(f"src_{vid_id}.*"))
    if existing: return existing[0]
    opts = {"format": "mp4[height<=1080]/best[height<=1080]/best", "outtmpl": out_tpl, "quiet": True, "nocheckcertificate": True, "noplaylist": True}
    with yt_dlp.YoutubeDL(opts) as ydl: ydl.download([url])
    return next(YT_CACHE.glob(f"src_{vid_id}.*"))
