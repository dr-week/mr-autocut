"""Composite a transition overlay + SFX onto a rendered MP4 using FFmpeg blend modes."""
import subprocess
from pathlib import Path

def apply_overlay_blend(base_mp4: str, overlay_mp4: str, blend_mode: str = "screen", opacity: float = 0.85, width: int = 1920, height: int = 1080) -> str:
    out_path = str(Path(base_mp4).with_name(f"blended_{Path(base_mp4).name}"))
    vf = f"[1:v]scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height},format=gbrp[ov];[0:v]format=gbrp[bs];[bs][ov]blend=all_mode={blend_mode}:all_opacity={opacity},format=yuv420p[vout]"
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-v", "error", "-i", base_mp4, "-stream_loop", "-1", "-i", overlay_mp4, "-filter_complex", vf, "-map", "[vout]", "-map", "0:a?", "-shortest", "-c:v", "libx264", "-preset", "veryfast", "-c:a", "copy", out_path], check=True, timeout=120)
    return out_path
