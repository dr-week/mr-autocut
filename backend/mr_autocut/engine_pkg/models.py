"""Pydantic data contracts for sequence, segments, analyze, reel, render, and AI Director."""
from pathlib import Path
from pydantic import BaseModel, Field

RENDER_DIR = Path(__file__).resolve().parent.parent.parent / ".cache" / "renders"; RENDER_DIR.mkdir(parents=True, exist_ok=True)
class SequenceSpec(BaseModel): width: int = Field(default=1920, ge=128, le=7680); height: int = Field(default=1080, ge=128, le=7680); fps: float = Field(default=30.0, gt=1.0, le=240.0); fit_mode: str = "fill"
class Segment(BaseModel): index: int; start: float; end: float; duration: float; kind: str = "speech"; scale: float = 1.0; transition: str | None = None; light_leak: bool = False; sfx: str | None = None; enabled: bool = True; label: str = ""
class AnalyzeRequest(BaseModel): media_path: str | None = None; duration_sec: float = Field(default=42.0, gt=0.1); silence_db: float = Field(default=-32.0, le=0.0, ge=-80.0); min_silence_sec: float = Field(default=0.30, gt=0.05, le=10.0); padding_sec: float = Field(default=0.06, ge=0.0, le=1.0); min_clip_sec: float = Field(default=0.35, gt=0.05, le=10.0); punch_in_alternate: bool = True; punch_in_scale: float = Field(default=1.12, ge=1.0, le=1.5); auto_sfx: bool = True; auto_light_leak: bool = True
class AnalyzeResult(BaseModel): source_duration: float; kept_duration: float; removed_duration: float; reduction_pct: float; silence_regions: list[tuple[float, float]]; segments: list[Segment]; mode: str
class ReelPlanRequest(BaseModel): source_duration: float = Field(default=60.0, gt=1.0); target_duration_sec: float = Field(default=30.0, gt=3.0, le=180.0); avg_shot_sec: float = Field(default=1.6, gt=0.3, le=10.0); hook_duration_sec: float = Field(default=3.0, gt=0.5, le=10.0); sequence: SequenceSpec = Field(default_factory=SequenceSpec); transition: str = "whip-flash"; auto_sfx: bool = True; auto_light_leak: bool = True; segments: list[Segment] | None = None
class ReelPlanResult(BaseModel): sequence: SequenceSpec; target_duration_sec: float; actual_duration_sec: float; shot_count: int; shots: list[Segment]
class CaptionLine(BaseModel): start: float; end: float; text: str
class RenderRequest(BaseModel): media_path: str; segments: list[Segment]; sequence: SequenceSpec = Field(default_factory=SequenceSpec); captions: list[CaptionLine] = Field(default_factory=list)
class RenderResult(BaseModel): job_id: str; output_path: str; width: int; height: int; duration_sec: float
class DirectorPromptRequest(BaseModel): instruction: str; sequence: SequenceSpec = Field(default_factory=SequenceSpec); segments: list[Segment] = Field(default_factory=list); available_assets: dict[str, list[str]] = Field(default_factory=dict)
class DirectorPromptResult(BaseModel): prompt: str; expected_schema: dict
