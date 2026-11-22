"""Health, presets, FilmCraft status/sequence/script/execute, and updater routes."""
from fastapi import APIRouter
from ..engine import SequenceSpec
from ..filmcraft import ExecuteResult, FilmCraftStatus, ScriptRequest, ScriptResult, execute_filmcraft_script, generate_filmcraft_jsonl, get_filmcraft_status, inspect_sequence
from ..presets import AUTO_CUT_PRESETS, MOTION_PRESETS, REEL_PRESETS
from ..updater import APP_VERSION, UpdateStatus, check_for_updates

router = APIRouter()
router.add_api_route("/api/health", lambda: {"status": "ok", "engine": "mr-autocut", "version": "0.4.0"}, methods=["GET"]); router.add_api_route("/api/filmcraft/status", get_filmcraft_status, response_model=FilmCraftStatus, methods=["GET"])
router.add_api_route("/api/filmcraft/sequence", inspect_sequence, response_model=SequenceSpec, methods=["GET"]); router.add_api_route("/api/presets", lambda: {"auto_cut": [p.model_dump() for p in AUTO_CUT_PRESETS], "reel": [p.model_dump() for p in REEL_PRESETS], "motion": [p.model_dump() for p in MOTION_PRESETS]}, methods=["GET"])
router.add_api_route("/api/filmcraft/script", generate_filmcraft_jsonl, response_model=ScriptResult, methods=["POST"]); router.add_api_route("/api/filmcraft/execute", execute_filmcraft_script, response_model=ExecuteResult, methods=["POST"])
@router.get("/api/updater/check")
def updater_check():
    try: return check_for_updates()
    except Exception: return UpdateStatus(current_version=APP_VERSION, latest_version=APP_VERSION, update_available=False, release_url="https://github.com/dr-week/mr-autocut/releases")
