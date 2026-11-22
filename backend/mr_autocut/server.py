"""FastAPI server for MR-AutoCut FilmCraft extension."""

from __future__ import annotations

from pathlib import Path
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .engine import (
    AnalyzeRequest,
    AnalyzeResult,
    DirectorPromptRequest,
    DirectorPromptResult,
    RENDER_DIR,
    ReelPlanRequest,
    ReelPlanResult,
    RenderRequest,
    RenderResult,
    SequenceSpec,
    analyze_media,
    build_director_prompt,
    build_reel_plan,
    render_sequence_ffmpeg,
)
from .filmcraft import (
    ExecuteResult,
    FilmCraftStatus,
    ScriptRequest,
    ScriptResult,
    execute_filmcraft_script,
    generate_filmcraft_jsonl,
    get_filmcraft_status,
    inspect_sequence,
)
from .learning import EditDelta, LearningStats, get_learning_stats, log_edit_delta
from .media import (
    MediaInfo,
    ProjectFolderScan,
    resolve_cached_media,
    save_uploaded_bytes,
    scan_project_folder,
)
from .presets import AUTO_CUT_PRESETS, MOTION_PRESETS, REEL_PRESETS

app = FastAPI(title="MR-AutoCut Engine", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "engine": "mr-autocut", "version": "0.2.0"}


@app.get("/api/filmcraft/status", response_model=FilmCraftStatus)
def filmcraft_status() -> FilmCraftStatus:
    return get_filmcraft_status()


@app.get("/api/filmcraft/sequence", response_model=SequenceSpec)
def filmcraft_sequence(
    bridge_addr: str | None = None, project_path: str | None = None
) -> SequenceSpec:
    return inspect_sequence(bridge_addr=bridge_addr, project_path=project_path)


@app.get("/api/presets")
def get_presets() -> dict:
    return {
        "auto_cut": [p.model_dump() for p in AUTO_CUT_PRESETS],
        "reel": [p.model_dump() for p in REEL_PRESETS],
        "motion": [p.model_dump() for p in MOTION_PRESETS],
    }


@app.post("/api/media/upload", response_model=MediaInfo)
async def upload_media(file: UploadFile = File(...)) -> MediaInfo:
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty upload")
    return save_uploaded_bytes(file.filename or "clip.mp4", content)


@app.get("/api/media/{media_id}/stream")
def stream_media(media_id: str) -> FileResponse:
    path = resolve_cached_media(media_id)
    if not path:
        raise HTTPException(status_code=404, detail="Media not found")
    return FileResponse(path)


@app.get("/api/assets/scan", response_model=ProjectFolderScan)
def assets_scan(root: str) -> ProjectFolderScan:
    return scan_project_folder(root)


@app.post("/api/analyze", response_model=AnalyzeResult)
def analyze(req: AnalyzeRequest) -> AnalyzeResult:
    return analyze_media(req)


@app.post("/api/reel/plan", response_model=ReelPlanResult)
def reel_plan(req: ReelPlanRequest) -> ReelPlanResult:
    return build_reel_plan(req)


@app.post("/api/render", response_model=RenderResult)
def render_video(req: RenderRequest) -> RenderResult:
    if not Path(req.media_path).is_file():
        raise HTTPException(status_code=404, detail="Source media file not found")
    return render_sequence_ffmpeg(req)


@app.get("/api/render/download/{job_id}")
def download_render(job_id: str) -> FileResponse:
    out = RENDER_DIR / f"autocut_{job_id}.mp4"
    if not out.is_file():
        raise HTTPException(status_code=404, detail="Rendered file not found")
    return FileResponse(out, media_type="video/mp4", filename=out.name)


@app.post("/api/director/prompt", response_model=DirectorPromptResult)
def director_prompt(req: DirectorPromptRequest) -> DirectorPromptResult:
    return build_director_prompt(req)


@app.post("/api/filmcraft/script", response_model=ScriptResult)
def filmcraft_script(req: ScriptRequest) -> ScriptResult:
    return generate_filmcraft_jsonl(req)


@app.post("/api/filmcraft/execute", response_model=ExecuteResult)
def filmcraft_execute(req: ScriptRequest) -> ExecuteResult:
    return execute_filmcraft_script(req)


@app.post("/api/learning/log", response_model=LearningStats)
def learning_log(delta: EditDelta) -> LearningStats:
    return log_edit_delta(delta)


@app.get("/api/learning/stats", response_model=LearningStats)
def learning_stats() -> LearningStats:
    return get_learning_stats()


@app.post("/api/audio/beats")
def audio_beats(media_path: str, duration: float = 10.0, sensitivity: float = 0.72):
    from .audio import detect_beats_ffmpeg
    return detect_beats_ffmpeg(media_path, duration=duration, sensitivity=sensitivity)


@app.post("/api/audio/ducking")
def audio_ducking(segments: list[dict], duck_db: float = -12.0):
    from .audio import build_ducking_curve
    from .engine import Segment
    return build_ducking_curve([Segment(**s) for s in segments], duck_db=duck_db)


@app.post("/api/learning/profile", response_model=LearningStats)
def learning_profile(profile: dict) -> LearningStats:
    import json
    from .learning import STYLE_PROFILE_PATH
    STYLE_PROFILE_PATH.write_text(json.dumps(profile, indent=2), encoding="utf-8")
    return get_learning_stats()


@app.post("/api/color/analyze")
def color_analyze(media_path: str, timestamp: float = 0.5):
    from .color import auto_balance_clip, detect_color_science
    return {"science": detect_color_science(media_path), "grade": auto_balance_clip(media_path, timestamp)}


@app.post("/api/color/cube")
def color_cube(grade: dict, title: str = "MR-AutoCut Grade", size: int = 17):
    from fastapi.responses import PlainTextResponse
    from .color import ColorGrade, generate_cube_lut
    return PlainTextResponse(generate_cube_lut(ColorGrade(**grade), title=title, size=size), media_type="text/plain")


@app.post("/api/reel/optimize")
def reel_optimize(segments: list[dict], target_sec: float = 15.0):
    from .engine import Segment
    from .qubo import optimize_reel_qubo
    chosen = optimize_reel_qubo([Segment(**s) for s in segments], target_sec=target_sec)
    return {"target_sec": target_sec, "actual_sec": round(sum(s.duration for s in chosen), 2), "segments": chosen}


@app.post("/api/color/match")
def color_match(clip_ids: list[int], reference_seconds: float = 0.5):
    import json
    lines = [json.dumps({"id": "lumetri.applyMatch", "params": {"clip": cid, "referenceTime": int(reference_seconds * 254016000000), "faceDetection": True}}) for cid in clip_ids]
    return {"command_count": len(lines), "jsonl": "\n".join(lines) + "\n"}


@app.get("/api/assets/sources")
def assets_sources():
    from .multipass import FREE_ASSET_SOURCES
    return {"sources": FREE_ASSET_SOURCES}


@app.get("/api/assets/flow-prompt")
def assets_flow_prompt(topic: str, aspect: str = "9:16"):
    from .multipass import build_flow_prompt
    return build_flow_prompt(topic=topic, aspect=aspect)


@app.post("/api/multipass/improve")
def multipass_improve(segments: list[dict], max_passes: int = 3):
    from .engine import Segment
    from .multipass import run_multipass_improve
    return {"passes": run_multipass_improve([Segment(**s) for s in segments], max_passes=max_passes)}
