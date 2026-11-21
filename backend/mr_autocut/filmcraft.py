"""Bridge to filmcraft-cli (inspect sequence, compile multi-track JSONL, execute live/headless)."""

from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
from pathlib import Path
from pydantic import BaseModel, Field

from .engine import Segment, SequenceSpec


class FilmCraftStatus(BaseModel):
    cli_available: bool
    cli_path: str | None
    cli_version: str | None
    ffmpeg_available: bool


class ScriptRequest(BaseModel):
    segments: list[Segment]
    sequence: SequenceSpec = Field(default_factory=SequenceSpec)
    bin_name: str = "MR-AutoCut"
    normalize_audio: bool = True
    scene_detect: bool = False
    lumetri_preset: str | None = None
    bridge_addr: str | None = None
    project_path: str | None = None


class ScriptResult(BaseModel):
    jsonl: str
    command_count: int
    cli_invocation: str


class ExecuteResult(BaseModel):
    exit_code: int
    stdout: str
    stderr: str
    cli_invocation: str


def _find_filmcraft_cli() -> str | None:
    found = shutil.which("filmcraft-cli")
    if found:
        return found
    local_bin = Path.home() / ".local" / "bin" / "filmcraft-cli"
    return str(local_bin) if local_bin.is_file() else None


def get_filmcraft_status() -> FilmCraftStatus:
    cli_path = _find_filmcraft_cli()
    version: str | None = None
    if cli_path:
        try:
            version = subprocess.check_output(
                [cli_path, "--version"], text=True, stderr=subprocess.STDOUT, timeout=5
            ).strip()
        except Exception:
            version = None
    return FilmCraftStatus(
        cli_available=bool(cli_path and version),
        cli_path=cli_path,
        cli_version=version,
        ffmpeg_available=bool(shutil.which("ffmpeg")),
    )


def inspect_sequence(
    bridge_addr: str | None = None, project_path: str | None = None
) -> SequenceSpec:
    """Read active sequence width/height/fps from filmcraft-cli, falling back to 1920x1080."""
    cli = _find_filmcraft_cli()
    if not cli:
        return SequenceSpec()

    cmd = [cli]
    if bridge_addr:
        cmd += ["--bridge", bridge_addr]
    elif project_path and Path(project_path).is_file():
        cmd += ["--project", project_path]
    else:
        cmd += ["--demo"]
    cmd += ["inspect", "sequence"]

    try:
        out = subprocess.check_output(cmd, text=True, stderr=subprocess.DEVNULL, timeout=10)
        data = json.loads(out)
        seq = data.get("sequence") or data
        w = int(seq.get("width") or seq.get("frameWidth") or 1920)
        h = int(seq.get("height") or seq.get("frameHeight") or 1080)
        fps = float(seq.get("fps") or seq.get("frameRate") or 30.0)
        return SequenceSpec(width=w, height=h, fps=fps)
    except Exception:
        return SequenceSpec()


def generate_filmcraft_jsonl(req: ScriptRequest) -> ScriptResult:
    """Compile enabled segments & automation options into a real filmcraft-cli JSONL script."""
    enabled = [s for s in req.segments if s.enabled]
    lines: list[str] = [
        f"# MR-AutoCut -> FilmCraft ({req.sequence.width}x{req.sequence.height} @ {req.sequence.fps}fps, {len(enabled)} cuts)",
        json.dumps({"id": "file.newBin", "params": {"name": req.bin_name}}),
    ]

    if req.scene_detect:
        lines.append(
            json.dumps(
                {
                    "id": "clip.sceneEditDetection",
                    "params": {"sensitivity": 50, "applyCuts": True, "wait": True},
                }
            )
        )

    for seg in enabled:
        lines.append(json.dumps({"id": "timeline.razor", "params": {"seconds": seg.start}}))
        lines.append(json.dumps({"id": "timeline.razor", "params": {"seconds": seg.end}}))

    # Auto-fit clips to active sequence size
    fit_cmd = "clip.fillFrame" if req.sequence.fit_mode == "fill" else "clip.fitToFrame"
    lines.append(json.dumps({"id": fit_cmd, "params": {}}))

    if req.normalize_audio:
        lines.append(
            json.dumps({"id": "clip.audioGain", "params": {"mode": "normalizeAll", "db": -3.0}})
        )

    if req.lumetri_preset:
        lines.append(
            json.dumps({"id": "lumetri.applyPreset", "params": {"name": req.lumetri_preset}})
        )

    jsonl = "\n".join(lines) + "\n"
    if req.bridge_addr:
        invocation = f"filmcraft-cli --bridge {req.bridge_addr} run autocut.jsonl"
    elif req.project_path:
        invocation = f"filmcraft-cli --project {req.project_path} --save run autocut.jsonl"
    else:
        invocation = "filmcraft-cli --demo run autocut.jsonl"

    return ScriptResult(
        jsonl=jsonl,
        command_count=len(lines) - 1,
        cli_invocation=invocation,
    )


def execute_filmcraft_script(req: ScriptRequest) -> ExecuteResult:
    """Execute the compiled JSONL script against FilmCraft (--bridge, --project, or --demo)."""
    cli = _find_filmcraft_cli()
    if not cli:
        return ExecuteResult(
            exit_code=127,
            stdout="",
            stderr="filmcraft-cli not found on PATH",
            cli_invocation="",
        )

    compiled = generate_filmcraft_jsonl(req)
    with tempfile.NamedTemporaryFile("w", suffix=".jsonl", delete=False, encoding="utf-8") as tf:
        tf.write(compiled.jsonl)
        script_path = tf.name

    cmd = [cli]
    if req.bridge_addr:
        cmd += ["--bridge", req.bridge_addr]
    elif req.project_path:
        cmd += ["--project", req.project_path, "--save"]
    else:
        cmd += ["--demo"]
    cmd += ["--keep-going", "run", script_path]

    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        return ExecuteResult(
            exit_code=proc.returncode,
            stdout=proc.stdout,
            stderr=proc.stderr,
            cli_invocation=compiled.cli_invocation,
        )
    finally:
        Path(script_path).unlink(missing_ok=True)
