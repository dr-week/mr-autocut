"""Per-clip FFmpeg signalstats auto-balance -> Lift / Gamma / Gain."""
import re, subprocess
from pydantic import BaseModel, Field

class WheelRGB(BaseModel):
    r: float = 0.0; g: float = 0.0; b: float = 0.0; luma: float = 0.0

class ColorGrade(BaseModel):
    lift: WheelRGB = Field(default_factory=WheelRGB); gamma: WheelRGB = Field(default_factory=WheelRGB); gain: WheelRGB = Field(default_factory=WheelRGB); saturation: float = 1.0

def auto_balance_clip(media_path: str, timestamp: float = 0.5) -> ColorGrade:
    txt = subprocess.run(["ffmpeg", "-hide_banner", "-ss", str(timestamp), "-i", media_path, "-vframes", "1", "-vf", "signalstats,metadata=mode=print", "-f", "null", "-"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=15).stderr
    grab = lambda k, d: float(m.group(1)) if (m := re.search(rf"lavfi\.signalstats\.{k}=([0-9.]+)", txt)) else d
    yavg, uavg, vavg = grab("YAVG", 120.0), grab("UAVG", 128.0), grab("VAVG", 128.0)
    return ColorGrade(lift=WheelRGB(luma=-0.02), gamma=WheelRGB(r=round((128.0 - vavg) / 255.0, 3), g=0.0, b=round((128.0 - uavg) / 255.0, 3), luma=round(max(-0.35, min(0.35, (124.0 - yavg) / 255.0)), 3)), gain=WheelRGB(luma=0.04), saturation=1.08)
