"""Per-clip camera color science & transfer curve detection via ffprobe."""
import json, subprocess
from pydantic import BaseModel

class ColorScienceInfo(BaseModel):
    color_space: str = "bt709"; color_trc: str = "bt709"; is_log_or_hdr: bool = False; recommended_input_lut: str | None = None

def detect_color_science(media_path: str) -> ColorScienceInfo:
    out = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=color_space,color_transfer", "-of", "json", media_path], text=True, stderr=subprocess.DEVNULL, timeout=10)
    s = (json.loads(out).get("streams") or [{}])[0]
    trc = (s.get("color_transfer") or "bt709").lower()
    is_hdr = trc in {"arib-std-b67", "smpte2084", "log", "log100", "log316"}
    return ColorScienceInfo(color_space=(s.get("color_space") or "bt709").lower(), color_trc=trc, is_log_or_hdr=is_hdr, recommended_input_lut="builtin:log_to_rec709" if is_hdr else None)
