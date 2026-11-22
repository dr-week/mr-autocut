"""List or harvest the curated YouTube transition library."""
import json
from .download import YT_CACHE
from .refs import YOUTUBE_REFS
from .slicer import harvest_transitions

MANIFEST = YT_CACHE / "manifest.json"

def get_harvested_library() -> list[dict]:
    return json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.is_file() else []

def harvest_curated_pack(limit_refs: int = 7, max_clips_per_ref: int = 2) -> list[dict]:
    all_items: list[dict] = []
    for ref in YOUTUBE_REFS[:limit_refs]:
        all_items.extend(harvest_transitions(ref["url"], ref["id"], ref["kind"], ref["trim_head"], ref["trim_tail"], max_clips_per_ref))
    MANIFEST.write_text(json.dumps(all_items, indent=2), encoding="utf-8")
    return all_items
