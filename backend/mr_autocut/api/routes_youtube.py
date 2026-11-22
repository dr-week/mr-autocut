"""YouTube Transition Harvester & Blend-Mode routes."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from ..youtube_fx import BLEND_MODES, YOUTUBE_REFS, get_harvested_library, harvest_curated_pack, harvest_transitions
from ..youtube_fx.download import YT_CACHE

router = APIRouter()
router.add_api_route("/api/youtube-fx/refs", lambda: {"refs": YOUTUBE_REFS, "blend_modes": BLEND_MODES, "harvested": get_harvested_library()}, methods=["GET"])
router.add_api_route("/api/youtube-fx/harvest", lambda url=None, kind="light_leak", trim_head=2.0, trim_tail=2.5, max_clips=2: {"items": harvest_transitions(url, url.split("v=")[-1].split("&")[0].split("/")[-1][:11], kind, trim_head, trim_tail, max_clips) if url else harvest_curated_pack(max_clips_per_ref=max_clips)}, methods=["POST"])
router.add_api_route("/api/youtube-fx/stream/{clip_id}", lambda clip_id: FileResponse(p, media_type="video/mp4") if (p := YT_CACHE / f"tr_{clip_id}.mp4").is_file() else (_ for _ in ()).throw(HTTPException(status_code=404, detail="Transition clip not found")), methods=["GET"])
