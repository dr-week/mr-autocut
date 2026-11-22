"""Audio beats/ducking, color analyze/cube/match, and learning telemetry routes."""
import json
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from ..audio import build_ducking_curve, detect_beats_ffmpeg
from ..color import ColorGrade, auto_balance_clip, detect_color_science, generate_cube_lut
from ..engine import Segment
from ..learning import STYLE_PROFILE_PATH, LearningStats, get_learning_stats, log_edit_delta

router = APIRouter(); router.add_api_route("/api/learning/log", log_edit_delta, response_model=LearningStats, methods=["POST"]); router.add_api_route("/api/learning/stats", get_learning_stats, response_model=LearningStats, methods=["GET"]); router.add_api_route("/api/audio/beats", detect_beats_ffmpeg, methods=["POST"])
def _prof(profile: dict) -> LearningStats: STYLE_PROFILE_PATH.write_text(json.dumps(profile, indent=2), encoding="utf-8"); return get_learning_stats()
def _duck(segments: list[dict], duck_db: float = -12.0): return build_ducking_curve([Segment(**s) for s in segments], duck_db=duck_db)
def _col_an(media_path: str, timestamp: float = 0.5): return {"science": detect_color_science(media_path), "grade": auto_balance_clip(media_path, timestamp)}
def _col_cb(grade: dict, title: str = "MR-AutoCut Grade", size: int = 17): return PlainTextResponse(generate_cube_lut(ColorGrade(**grade), title=title, size=size), media_type="text/plain")
def _col_mt(clip_ids: list[int], reference_seconds: float = 0.5): return {"command_count": len(clip_ids), "jsonl": "\n".join(json.dumps({"id": "lumetri.applyMatch", "params": {"clip": cid, "referenceTime": int(reference_seconds * 254016000000), "faceDetection": True}}) for cid in clip_ids) + "\n"}
router.add_api_route("/api/learning/profile", _prof, response_model=LearningStats, methods=["POST"]); router.add_api_route("/api/audio/ducking", _duck, methods=["POST"]); router.add_api_route("/api/color/analyze", _col_an, methods=["POST"]); router.add_api_route("/api/color/cube", _col_cb, methods=["POST"]); router.add_api_route("/api/color/match", _col_mt, methods=["POST"])
