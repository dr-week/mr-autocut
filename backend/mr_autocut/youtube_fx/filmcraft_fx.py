"""Generate FilmCraft V2 overlay + A2 SFX + Opacity blend-mode JSONL commands."""
import json
from .blend import pick_blend
from .library import get_harvested_library

def build_overlay_jsonl(cut_times: list[float], kind: str = "light_leak") -> list[str]:
    lib, blend, cmds = get_harvested_library(), pick_blend(kind), []
    paths = [it["video_path"] for it in lib if it.get("kind") == kind] or [it["video_path"] for it in lib]
    if paths: cmds.append(json.dumps({"id": "file.import", "params": {"paths": paths[:4]}}))
    for i, t in enumerate(cut_times):
        cmds.append(json.dumps({"id": "timeline.place", "params": {"track": "V2", "audioTrack": "A2", "seconds": round(max(0.0, t - 0.5), 2), "insert": False}}))
        cmds.append(json.dumps({"id": "effects.setParam", "params": {"effect": "opacity", "param": "blend", "value": blend["filmcraft"]}}))
        cmds.append(json.dumps({"id": "effects.setParam", "params": {"effect": "opacity", "param": "opacity", "value": blend["opacity"]}}))
    return cmds
