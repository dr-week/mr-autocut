"""YouTube Transition Harvester, Auto-Search, Best-Movement & Gen-Z VFX routes."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from ..youtube_fx import BLEND_MODES, YOUTUBE_REFS, VfxPlan, build_vfx_plan, find_best_movements, get_harvested_library, harvest_curated_pack, harvest_transitions, search_youtube_fx
from ..youtube_fx.download import YT_CACHE

router = APIRouter()
router.add_api_route("/api/youtube-fx/refs", lambda: {"refs": YOUTUBE_REFS, "blend_modes": BLEND_MODES, "harvested": get_harvested_library()}, methods=["GET"])
router.add_api_route("/api/youtube-fx/harvest", lambda url=None, kind="light_leak", trim_head=2.0, trim_tail=2.5, max_clips=2: {"items": harvest_transitions(url, url.split("v=")[-1].split("&")[0].split("/")[-1][:11], kind, trim_head, trim_tail, max_clips) if url else harvest_curated_pack(max_clips_per_ref=max_clips)}, methods=["POST"])
router.add_api_route("/api/youtube-fx/stream/{clip_id}", lambda clip_id: FileResponse(p, media_type="video/mp4") if (p := YT_CACHE / f"tr_{clip_id}.mp4").is_file() else (_ for _ in ()).throw(HTTPException(status_code=404, detail="Transition clip not found")), methods=["GET"])
def _yt_srch(q: str = "light leak transition", limit: int = 4): return {"query": q, "items": search_youtube_fx(q, limit=limit)}
def _vfx(prompt: str = "", script_text: str = "") -> VfxPlan: return build_vfx_plan(prompt=prompt, script_text=script_text)
def _mov(media_path: str, top_k: int = 4): return {"movements": find_best_movements(media_path, top_k=top_k)}
router.add_api_route("/api/youtube-fx/search", _yt_srch, methods=["GET"]); router.add_api_route("/api/vfx/plan", _vfx, response_model=VfxPlan, methods=["POST"]); router.add_api_route("/api/vfx/movements", _mov, methods=["POST"])
