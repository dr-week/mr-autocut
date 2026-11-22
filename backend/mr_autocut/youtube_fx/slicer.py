"""Slice individual transition overlays and synced SFX wavs from a YouTube source."""
import subprocess
from .blend import pick_blend
from .download import YT_CACHE, download_yt_source
from .peaks import find_transition_windows

def harvest_transitions(url: str, vid_id: str, kind: str = "light_leak", trim_head: float = 2.0, trim_tail: float = 2.5, max_clips: int = 2) -> list[dict]:
    src, items, blend = download_yt_source(url, vid_id), [], pick_blend(kind)
    for idx, (st, en, pk) in enumerate(find_transition_windows(str(src), trim_head, trim_tail, max_clips), 1):
        clip_mp4, sfx_wav = YT_CACHE / f"tr_{vid_id}_{idx:02d}.mp4", YT_CACHE / f"sfx_{vid_id}_{idx:02d}.wav"
        if not clip_mp4.is_file(): subprocess.run(["ffmpeg", "-y", "-hide_banner", "-v", "error", "-ss", str(st), "-to", str(en), "-i", str(src), "-c:v", "libx264", "-preset", "veryfast", "-c:a", "aac", str(clip_mp4)], check=True, timeout=45)
        if not sfx_wav.is_file(): subprocess.run(["ffmpeg", "-y", "-hide_banner", "-v", "error", "-ss", str(st), "-to", str(en), "-i", str(src), "-vn", "-ac", "2", "-ar", "44100", str(sfx_wav)], check=False, timeout=30)
        items.append({"id": f"{vid_id}_{idx:02d}", "source_id": vid_id, "kind": kind, "start": st, "end": en, "peak_offset": round(pk - st, 2), "duration": round(en - st, 2), "video_path": str(clip_mp4), "sfx_path": str(sfx_wav) if sfx_wav.is_file() else None, "blend": blend})
    return items
