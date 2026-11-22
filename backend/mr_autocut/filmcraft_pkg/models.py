"""Pydantic contracts for FilmCraft bridge, script compilation, and execution."""
from pydantic import BaseModel, Field
from ..engine import Segment, SequenceSpec

class FilmCraftStatus(BaseModel):
    cli_available: bool; cli_path: str | None; cli_version: str | None; ffmpeg_available: bool

class ScriptRequest(BaseModel):
    segments: list[Segment]; sequence: SequenceSpec = Field(default_factory=SequenceSpec); bin_name: str = "MR-AutoCut"; normalize_audio: bool = True; scene_detect: bool = False; lumetri_preset: str | None = None; bridge_addr: str | None = None; project_path: str | None = None

class ScriptResult(BaseModel):
    jsonl: str; command_count: int; cli_invocation: str

class ExecuteResult(BaseModel):
    exit_code: int; stdout: str; stderr: str; cli_invocation: str
