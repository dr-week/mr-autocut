"""Parse prompt + script into Gen-Z / Car-Edit VFX, speed ramps, mask+glow, text-behind-subject & YouTube search."""
import json
from pydantic import BaseModel

class VfxPlan(BaseModel): tags: list[str]; speed_curve: str; glow_color: str; text_behind: str | None; yt_query: str; css_fx: str; filmcraft_jsonl: str; filmora_package: dict

def build_vfx_plan(prompt: str = "", script_text: str = "") -> VfxPlan:
    p = f"{prompt} {script_text}".lower(); tags, cmds = [], []; spd = "velocity_300_40" if any(k in p for k in ("car", "speed", "ramp", "velocity", "phonk", "drift", "beat", "fast")) else "normal"
    if spd != "normal": tags.append("Speed Ramp (300%->40%)"); cmds.extend([json.dumps({"id": "effects.apply", "params": {"effect": "time_remap"}}), json.dumps({"id": "clip.timeInterpolation.opticalFlow", "params": {}})])
    if any(k in p for k in ("glow", "mask", "saber", "neon", "car", "outline", "edge")): tags.extend(["Subject Mask", "Edge Saber Glow"]); cmds.extend([json.dumps({"id": "masks.add", "params": {"effect": "opacity", "shape": "bezier"}}), json.dumps({"id": "masks.track", "params": {"method": "positionScaleRotation"}}), json.dumps({"id": "effects.apply", "params": {"effect": "edge_glow"}}), json.dumps({"id": "effects.apply", "params": {"effect": "wonder_glow"}})])
    if any(k in p for k in ("shake", "rgb", "flash", "gen z", "car", "phonk", "hit", "bass")): tags.extend(["Camera Shake", "RGB Split"]); cmds.extend([json.dumps({"id": "effects.apply", "params": {"effect": "camera_shake"}}), json.dumps({"id": "effects.apply", "params": {"effect": "rgb_split"}})])
    tb = (script_text.strip().splitlines()[0][:18].upper() if script_text.strip() else "VELOCITY") if any(k in p for k in ("behind", "3d", "title", "car", "mask", "text", "script")) or script_text.strip() else None
    if tb: tags.append(f"Text Behind Subject ('{tb}')"); cmds.extend([json.dumps({"id": "timeline.place", "params": {"track": "V2", "seconds": 0.0, "insert": False}}), json.dumps({"id": "effects.apply", "params": {"effect": "graphic_text"}}), json.dumps({"id": "timeline.place", "params": {"track": "V3", "seconds": 0.0, "insert": False}}), json.dumps({"id": "masks.add", "params": {"effect": "opacity", "shape": "polygon"}})])
    yt_q = "car edit flash transition sfx" if "car" in p else ("glitch vfx overlay transition" if "gen z" in p else "light leak film burn transition")
    return VfxPlan(tags=tags or ["Best Movement Auto-Cut", "YouTube Light Leak (Screen)"], speed_curve=spd, glow_color="#38bdf8", text_behind=tb, yt_query=yt_q, css_fx="contrast(1.16) saturate(1.28) drop-shadow(0 0 18px #38bdf8)" if "Edge Saber Glow" in tags else "contrast(1.08) saturate(1.14)", filmcraft_jsonl="\n".join(cmds), filmora_package={"target": ["Filmora", "FilmCraft", "Premiere"], "speed_curve": spd, "effects": tags, "text_behind": tb, "youtube_query": yt_q, "script_lines": [l.strip() for l in script_text.splitlines() if l.strip()]})
