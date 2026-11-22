"""Auto-Cut analyze, reel plan/QUBO, MP4 render/download, AI Director, and 3-Pass routes."""
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from ..engine import AnalyzeRequest, AnalyzeResult, DirectorPromptRequest, DirectorPromptResult, RENDER_DIR, ReelPlanRequest, ReelPlanResult, RenderRequest, RenderResult, Segment, analyze_media, build_director_prompt, build_reel_plan, render_sequence_ffmpeg
from ..multipass import run_multipass_improve
from ..qubo import optimize_reel_qubo

router = APIRouter(); router.add_api_route("/api/analyze", analyze_media, response_model=AnalyzeResult, methods=["POST"]); router.add_api_route("/api/reel/plan", build_reel_plan, response_model=ReelPlanResult, methods=["POST"]); router.add_api_route("/api/director/prompt", build_director_prompt, response_model=DirectorPromptResult, methods=["POST"])
def _render(req: RenderRequest) -> RenderResult: return render_sequence_ffmpeg(req) if Path(req.media_path).is_file() else (_ for _ in ()).throw(HTTPException(status_code=404, detail="Source media file not found"))
def _dl(job_id: str) -> FileResponse: return FileResponse(o, media_type="video/mp4", filename=o.name) if (o := RENDER_DIR / f"autocut_{job_id}.mp4").is_file() else (_ for _ in ()).throw(HTTPException(status_code=404, detail="Rendered file not found"))
def _opt(segments: list[dict], target_sec: float = 15.0): ch = optimize_reel_qubo([Segment(**s) for s in segments], target_sec=target_sec); return {"target_sec": target_sec, "actual_sec": round(sum(s.duration for s in ch), 2), "segments": ch}
def _mp(segments: list[dict], max_passes: int = 3): return {"passes": run_multipass_improve([Segment(**s) for s in segments], max_passes=max_passes)}
router.add_api_route("/api/render", _render, response_model=RenderResult, methods=["POST"]); router.add_api_route("/api/render/download/{job_id}", _dl, methods=["GET"]); router.add_api_route("/api/reel/optimize", _opt, methods=["POST"]); router.add_api_route("/api/multipass/improve", _mp, methods=["POST"])
