"""Media upload/stream, project scan, and free stock / Google Flow asset routes."""
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from ..media import MediaInfo, ProjectFolderScan, resolve_cached_media, save_uploaded_bytes, scan_project_folder
from ..multipass import FREE_ASSET_SOURCES, build_flow_prompt
from ..multipass.fetch import download_asset, search_free_assets

router = APIRouter(); router.add_api_route("/api/assets/scan", scan_project_folder, response_model=ProjectFolderScan, methods=["GET"]); router.add_api_route("/api/assets/sources", lambda: {"sources": FREE_ASSET_SOURCES}, methods=["GET"]); router.add_api_route("/api/assets/flow-prompt", build_flow_prompt, methods=["GET"])
async def _up(file: UploadFile = File(...)) -> MediaInfo: return save_uploaded_bytes(file.filename or "clip.mp4", c) if (c := await file.read()) else (_ for _ in ()).throw(HTTPException(status_code=400, detail="Empty upload"))
def _st(media_id: str) -> FileResponse: return FileResponse(p) if (p := resolve_cached_media(media_id)) else (_ for _ in ()).throw(HTTPException(status_code=404, detail="Media not found"))
def _srch(q: str, source: str = "openverse", orientation: str = "landscape", limit: int = 6): return {"items": search_free_assets(q, source, orientation, limit)}
def _dl(url: str, filename: str, dest_dir: str | None = None): s = download_asset(url, filename, dest_dir); return {"saved_path": str(s), "size_bytes": s.stat().st_size}
router.add_api_route("/api/media/upload", _up, response_model=MediaInfo, methods=["POST"]); router.add_api_route("/api/media/{media_id}/stream", _st, methods=["GET"]); router.add_api_route("/api/assets/search", _srch, methods=["GET"]); router.add_api_route("/api/assets/download", _dl, methods=["POST"])
