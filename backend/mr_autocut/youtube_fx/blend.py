"""Recommended FilmCraft & FFmpeg blend mode rules by overlay category."""
BLEND_MODES = {
    "light_leak": {"filmcraft": "Screen", "ffmpeg": "screen", "opacity": 88.0},
    "light_leak_4k": {"filmcraft": "Screen", "ffmpeg": "screen", "opacity": 90.0},
    "film_burn_sfx": {"filmcraft": "Screen", "ffmpeg": "screen", "opacity": 92.0},
    "retro_film": {"filmcraft": "Screen", "ffmpeg": "screen", "opacity": 85.0},
    "film_overlay": {"filmcraft": "Screen", "ffmpeg": "screen", "opacity": 85.0},
    "vfx_sfx_pack": {"filmcraft": "Linear Dodge (Add)", "ffmpeg": "addition", "opacity": 85.0},
    "paper_texture": {"filmcraft": "Multiply", "ffmpeg": "multiply", "opacity": 78.0},
    "grain": {"filmcraft": "Overlay", "ffmpeg": "overlay", "opacity": 65.0},
}

def pick_blend(kind: str) -> dict:
    return BLEND_MODES.get(kind, BLEND_MODES["light_leak"])
