"""Inspect active sequence size and frame rate from filmcraft-cli."""
import json, subprocess
from pathlib import Path
from ..engine import SequenceSpec
from .status import _find_filmcraft_cli

def inspect_sequence(bridge_addr: str | None = None, project_path: str | None = None) -> SequenceSpec:
    cli = _find_filmcraft_cli()
    if not cli: return SequenceSpec()
    flag = ["--bridge", bridge_addr] if bridge_addr else (["--project", project_path] if project_path and Path(project_path).is_file() else ["--demo"])
    try:
        data = json.loads(subprocess.check_output([cli, *flag, "inspect", "sequence"], text=True, stderr=subprocess.DEVNULL, timeout=10))
        seq = data.get("sequence") or data
        return SequenceSpec(width=int(seq.get("width") or seq.get("frameWidth") or 1920), height=int(seq.get("height") or seq.get("frameHeight") or 1080), fps=float(seq.get("fps") or seq.get("frameRate") or 30.0))
    except Exception:
        return SequenceSpec()
