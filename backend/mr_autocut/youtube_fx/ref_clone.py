"""Extract frame-accurate cut & beat-transition blueprint from a reference video (local or YouTube URL)."""
import re, subprocess
from ..engine import probe_duration
from .download import download_yt_source

def extract_ref_blueprint(ref_source: str, scene_thresh: float = 0.32) -> dict:
    path = str(download_yt_source(ref_source, ref_source.split("v=")[-1].split("&")[0].split("/")[-1][:11])) if ref_source.startswith("http") else ref_source
    dur = probe_duration(path) or 15.0
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-vf", f"scale=320:-1,select='gt(scene,{scene_thresh})',showinfo", "-f", "null", "-"], capture_output=True, text=True, timeout=45).stderr
    cuts = sorted({0.0, *[round(float(t), 2) for t in re.findall(r"pts_time:([0-9.]+)", out) if 0.35 <= float(t) <= dur - 0.35], round(dur, 2)})
    if len(cuts) < 3: cuts = [round(dur * i / 6, 2) for i in range(7)]
    slots = [{"slot": i + 1, "start": cuts[i], "end": cuts[i + 1], "duration": round(cuts[i + 1] - cuts[i], 2), "role": "hook" if i == 0 else ("climax" if i == len(cuts) - 2 else "beat_cut"), "transition": "flash_screen" if i % 2 == 1 else "whip_pan", "sfx": "whoosh" if i % 2 == 1 else "hit"} for i in range(len(cuts) - 1)]
    return {"ref_path": path, "duration": round(dur, 2), "slot_count": len(slots), "slots": slots}
