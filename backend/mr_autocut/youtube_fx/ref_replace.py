"""Map client raw clips + brief into a Reference Video's exact cut/transition blueprint."""
import json
from ..engine import Segment
from .ref_clone import extract_ref_blueprint
from .vfx_plan import build_vfx_plan

def clone_reference_with_raw(ref_source: str, raw_clips: list[str], client_brief: str = "Event highlight", pacing: float = 1.0) -> dict:
    bp, vfx = extract_ref_blueprint(ref_source), build_vfx_plan(prompt=client_brief, script_text=client_brief)
    pool = raw_clips or [bp["ref_path"]]; segs, cursor = [], 0.0
    for i, sl in enumerate(bp["slots"]):
        d = round(max(0.35, sl["duration"] / max(0.5, pacing)), 2); clip = pool[i % len(pool)]
        segs.append(Segment(index=i + 1, start=round(cursor, 2), end=round(cursor + d, 2), duration=d, kind="hook" if i == 0 else "beat", scale=1.14 if i % 2 == 1 else 1.0, transition=sl["transition"], light_leak=(i % 2 == 1), sfx=sl["sfx"], label=f"{i+1:02d} · {sl['role'].upper()} ({Path_name(clip)})"))
        cursor += d
    fc = "\n".join([json.dumps({"id": "file.import", "params": {"paths": pool[:8]}}), *[json.dumps({"id": "timeline.razor", "params": {"seconds": s.end}}) for s in segs], vfx.filmcraft_jsonl]).strip()
    return {"blueprint": bp, "client_brief": client_brief, "pacing": pacing, "segments": [s.model_dump() for s in segs], "vfx_tags": vfx.tags, "filmcraft_jsonl": fc, "filmora_package": {**vfx.filmora_package, "mode": "reference_clone", "slots": len(segs)}}

def Path_name(p: str) -> str: return p.replace("\\", "/").split("/")[-1][:16]
