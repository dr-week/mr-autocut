"""Free open asset APIs & Google Flow prompt launcher."""

from __future__ import annotations

FREE_ASSET_SOURCES = [
    {"id": "google-flow", "name": "Google Flow (Veo / Imagen)", "url": "https://labs.google/fx/tools/flow", "kind": "ai-video", "auth": "browser"},
    {"id": "pexels", "name": "Pexels Free Video API", "url": "https://api.pexels.com/videos/search", "kind": "broll", "auth": "PEXELS_API_KEY"},
    {"id": "pixabay", "name": "Pixabay Video & Audio API", "url": "https://pixabay.com/api/videos/", "kind": "broll+sfx", "auth": "PIXABAY_API_KEY"},
    {"id": "freesound", "name": "Freesound SFX API", "url": "https://freesound.org/apiv2/search/text/", "kind": "sfx", "auth": "FREESOUND_API_KEY"},
    {"id": "openverse", "name": "Openverse CC0 Media", "url": "https://api.openverse.org/v1/images/", "kind": "images", "auth": "none"},
]


def build_flow_prompt(topic: str, aspect: str = "9:16", style: str = "cinematic, clean lighting") -> dict:
    prompt = f"{topic}, {style}, {aspect} framing, smooth camera motion, 4k photorealistic B-roll"
    return {"tool": "Google Flow", "open_url": "https://labs.google/fx/tools/flow", "prompt": prompt}
