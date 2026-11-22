"""Compile enabled segments & overlay blend modes into filmcraft-cli JSONL script."""
import json
from .models import ScriptRequest, ScriptResult

def generate_filmcraft_jsonl(req: ScriptRequest) -> ScriptResult:
    en = [s for s in req.segments if s.enabled]
    lns = [f"# MR-AutoCut -> FilmCraft ({req.sequence.width}x{req.sequence.height} @ {req.sequence.fps}fps, {len(en)} cuts)", json.dumps({"id": "file.newBin", "params": {"name": req.bin_name}})]
    if req.scene_detect: lns.append(json.dumps({"id": "clip.sceneEditDetection", "params": {"sensitivity": 50, "applyCuts": True, "wait": True}}))
    for s in en: lns.extend([json.dumps({"id": "timeline.razor", "params": {"seconds": s.start}}), json.dumps({"id": "timeline.razor", "params": {"seconds": s.end}})])
    lns.append(json.dumps({"id": "clip.fillFrame" if req.sequence.fit_mode == "fill" else "clip.fitToFrame", "params": {}}))
    if req.normalize_audio: lns.append(json.dumps({"id": "clip.audioGain", "params": {"mode": "normalizeAll", "db": -3.0}}))
    if req.lumetri_preset: lns.append(json.dumps({"id": "lumetri.applyPreset", "params": {"name": req.lumetri_preset}}))
    if cuts := [round(s.end, 2) for s in en[:-1] if s.light_leak or s.transition]:
        from ..youtube_fx import build_overlay_jsonl; lns.extend(build_overlay_jsonl(cuts, kind="light_leak"))
    inv = f"filmcraft-cli --bridge {req.bridge_addr} run autocut.jsonl" if req.bridge_addr else (f"filmcraft-cli --project {req.project_path} --save run autocut.jsonl" if req.project_path else "filmcraft-cli --demo run autocut.jsonl")
    return ScriptResult(jsonl="\n".join(lns) + "\n", command_count=len(lns) - 1, cli_invocation=inv)
