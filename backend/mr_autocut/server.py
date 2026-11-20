"""FastAPI server for MR-AutoCut FilmCraft extension."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .engine import (
    AnalyzeRequest,
    AnalyzeResult,
    ReelPlanRequest,
    ReelPlanResult,
    analyze_media,
    build_reel_plan,
)
from .filmcraft import (
    FilmCraftStatus,
    ScriptRequest,
    ScriptResult,
    generate_filmcraft_jsonl,
    get_filmcraft_status,
)
from .presets import AUTO_CUT_PRESETS, MOTION_PRESETS, REEL_PRESETS

app = FastAPI(title="MR-AutoCut Engine", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "engine": "mr-autocut"}


@app.get("/api/filmcraft/status", response_model=FilmCraftStatus)
def filmcraft_status() -> FilmCraftStatus:
    return get_filmcraft_status()


@app.get("/api/presets")
def get_presets() -> dict:
    return {
        "auto_cut": [p.model_dump() for p in AUTO_CUT_PRESETS],
        "reel": [p.model_dump() for p in REEL_PRESETS],
        "motion": [p.model_dump() for p in MOTION_PRESETS],
    }


@app.post("/api/analyze", response_model=AnalyzeResult)
def analyze(req: AnalyzeRequest) -> AnalyzeResult:
    return analyze_media(req)


@app.post("/api/reel/plan", response_model=ReelPlanResult)
def reel_plan(req: ReelPlanRequest) -> ReelPlanResult:
    return build_reel_plan(req)


@app.post("/api/filmcraft/script", response_model=ScriptResult)
def filmcraft_script(req: ScriptRequest) -> ScriptResult:
    return generate_filmcraft_jsonl(req)
