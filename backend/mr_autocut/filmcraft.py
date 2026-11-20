"""Bridge to filmcraft-cli (headless .fcproj or live --bridge 127.0.0.1:PORT)."""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path
from pydantic import BaseModel

from .engine import Segment


class FilmCraftStatus(BaseModel):
    cli_available: bool
    cli_path: str | None
    cli_version: str | None
    ffmpeg_available: bool


class ScriptRequest(BaseModel):
    segments: list[Segment]
    bin_name: str = "MR-AutoCut"
    sequence_name: str = "AutoCut Reel 9x16"
    bridge_addr: str | None = None
    project_path: str | None = None


class ScriptResult(BaseModel):
    jsonl: str
    command_count: int
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
            out = subprocess.check_output(
                [cli_path, "--version"], text=True, stderr=subprocess.STDOUT, timeout=5
            ).strip()
            version = out
        except Exception:
            version = None
    return FilmCraftStatus(
        cli_available=bool(cli_path and version),
        cli_path=cli_path,
        cli_version=version,
        ffmpeg_available=bool(shutil.which("ffmpeg")),
    )


def generate_filmcraft_jsonl(req: ScriptRequest) -> ScriptResult:
    """Generate a filmcraft-cli `run` JSONL command script for the planned cuts."""
    lines: list[str] = [
        f"# MR-AutoCut -> FilmCraft script ({len(req.segments)} segments)",
        json.dumps({"id": "file.newBin", "params": {"name": req.bin_name}}),
    ]
    for seg in req.segments:
        # Place razor cuts at each segment boundary on the active sequence
        lines.append(
            json.dumps(
                {
                    "id": "timeline.razor",
                    "params": {"seconds": seg.start},
                }
            )
        )
        lines.append(
            json.dumps(
                {
                    "id": "timeline.razor",
                    "params": {"seconds": seg.end},
                }
            )
        )

    jsonl = "\n".join(lines) + "\n"
    if req.bridge_addr:
        invocation = f"filmcraft-cli --bridge {req.bridge_addr} run autocut.jsonl"
    elif req.project_path:
        invocation = f"filmcraft-cli --project {req.project_path} --save run autocut.jsonl"
    else:
        invocation = "filmcraft-cli --demo --save-as autocut.fcproj run autocut.jsonl"

    return ScriptResult(
        jsonl=jsonl,
        command_count=len(lines) - 1,
        cli_invocation=invocation,
    )
