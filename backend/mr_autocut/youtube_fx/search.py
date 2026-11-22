"""YouTube-First Auto-Search (`ytsearch:`) for transitions, light leaks, overlays & SFX without text."""
import yt_dlp

def search_youtube_fx(query: str, limit: int = 4) -> list[dict]:
    q = f"ytsearch{limit}:{query} overlay transition black background no text"
    opts = {"quiet": True, "nocheckcertificate": True, "extract_flat": True, "skip_download": True}
    with yt_dlp.YoutubeDL(opts) as ydl: info = ydl.extract_info(q, download=False) or {}
    items = []
    for e in info.get("entries") or []:
        dur = float(e.get("duration") or 20.0)
        if e.get("id") and 3.0 <= dur <= 240.0:
            items.append({"id": e["id"], "title": (e.get("title") or "FX Overlay")[:60], "duration": round(dur, 1), "url": f"https://www.youtube.com/watch?v={e['id']}"})
    return items
