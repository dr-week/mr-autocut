"""Extract duration, width, height, fps, and audio presence via ffprobe."""
import json, subprocess

def ffprobe_media(path: str) -> dict:
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", path], text=True, stderr=subprocess.DEVNULL, timeout=15)
    data = json.loads(out)
    dur, w, h, fps, aud = float(data.get("format", {}).get("duration") or 0.0), 1920, 1080, 30.0, False
    for s in data.get("streams", []):
        if s.get("codec_type") == "video":
            w, h = int(s.get("width") or w), int(s.get("height") or h)
            num, den = (s.get("r_frame_rate") or "30/1").split("/", 1) if "/" in (s.get("r_frame_rate") or "30/1") else ("30", "1")
            fps = round(float(num) / max(1.0, float(den)), 3)
        elif s.get("codec_type") == "audio": aud = True
    return {"duration": round(dur, 3), "width": w, "height": h, "fps": fps, "has_audio": aud}
