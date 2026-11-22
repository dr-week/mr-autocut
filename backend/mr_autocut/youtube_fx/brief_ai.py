"""Turn any client brief into a universal Free-AI Blueprint Prompt & parse AI responses into cuts, transitions & VFX."""
import json
from pydantic import BaseModel

class BriefBlueprint(BaseModel):
    script_lines: list[str]; hook_text: str; timeline: list[dict]; vfx: list[str]; ai_prompt: str

def build_brief_blueprint(brief: str, duration: float = 15.0) -> BriefBlueprint:
    lns = [l.strip() for l in brief.splitlines() if l.strip()] or ["EVENT HIGHLIGHT", "BEAT DROP", "FINAL REVEAL"]
    hk, step = lns[0][:18].upper(), round(duration / max(3, len(lns) + 1), 2)
    tl = [{"slot": i + 1, "start": round(i * step, 2), "end": round((i + 1) * step, 2), "script": lns[i % len(lns)], "transition": "flash_screen" if i % 2 else "whip_pan", "blend": "Screen", "vfx": "speed_ramp_300_40" if i % 2 else "mask_saber_glow", "sfx": "whoosh" if i % 2 else "hit"} for i in range(max(3, len(lns)))]
    schema = {"hook_text": hk, "script_lines": lns, "timeline": tl, "vfx": ["Speed Ramp", "Mask + Glow", "3D Text Behind", "YouTube Screen Leak"]}
    prompt = f"CLIENT BRIEF:\n{brief}\n\nBreak this brief into: 1) script_lines, 2) exact transition timestamps & blend modes (Screen/Add/Multiply), 3) speed-ramp & mask-glow VFX per cut. Return ONLY valid JSON matching:\n{json.dumps(schema, indent=2)}"
    return BriefBlueprint(script_lines=lns, hook_text=hk, timeline=tl, vfx=schema["vfx"], ai_prompt=prompt)
