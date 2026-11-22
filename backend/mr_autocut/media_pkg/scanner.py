"""Scan a project folder for footage/, broll/, music/, sfx/, overlays/."""
from pathlib import Path
from .models import AssetItem, ProjectFolderScan

_VID, _AUD = {".mp4", ".mov", ".mkv", ".webm", ".avi", ".mxf"}, {".wav", ".mp3", ".aac", ".flac", ".ogg", ".m4a"}

def _tag(n: str, c: str) -> str:
    l = n.lower()
    if c == "sfx": return "whoosh" if any(k in l for k in ("whoosh", "swoosh", "whip", "swish")) else ("riser" if any(k in l for k in ("riser", "swell", "build", "sweep")) else ("hit" if any(k in l for k in ("hit", "impact", "boom", "drop", "punch")) else "general"))
    return "lightleak" if c == "overlays" and any(k in l for k in ("leak", "burn", "flare", "flash", "glow")) else "general"

def scan_project_folder(root: str) -> ProjectFolderScan:
    rt, b = Path(root).expanduser(), {k: [] for k in ("footage", "broll", "music", "sfx", "overlays")}
    for cat in (b if rt.is_dir() else ()):
        sub, exts = rt / cat, (_AUD if cat in ("music", "sfx") else _VID)
        if sub.is_dir(): b[cat] = [AssetItem(name=f.name, path=str(f), category=cat, sub_tag=_tag(f.name, cat)) for f in sorted(sub.iterdir()) if f.is_file() and f.suffix.lower() in exts]
    return ProjectFolderScan(root=str(rt), **b)
