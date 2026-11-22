"""Sequence-adaptive FFmpeg MP4 renderer with ASS captions."""
import subprocess, uuid
from .captions import write_ass_captions
from .models import RENDER_DIR, RenderRequest, RenderResult
from .silence import probe_duration

def render_sequence_ffmpeg(req: RenderRequest) -> RenderResult:
    en = [s for s in req.segments if s.enabled]
    if not en: raise ValueError("No enabled segments to render")
    jid, seq = uuid.uuid4().hex[:10], req.sequence; out_path = RENDER_DIR / f"autocut_{jid}.mp4"
    svf = f"scale={seq.width}:{seq.height}:force_original_aspect_ratio=decrease,pad={seq.width}:{seq.height}:(ow-iw)/2:(oh-ih)/2:black" if seq.fit_mode == "fit" else f"scale={seq.width}:{seq.height}:force_original_aspect_ratio=increase,crop={seq.width}:{seq.height}"
    fp = [f"[0:v]trim=start={s.start}:end={s.end},setpts=PTS-STARTPTS,{svf}[v{i}];[0:a]atrim=start={s.start}:end={s.end},asetpts=PTS-STARTPTS[a{i}]" for i, s in enumerate(en)] + [f"{''.join(f'[v{i}][a{i}]' for i in range(len(en)))}concat=n={len(en)}:v=1:a=1[vout][aout]"]
    if req.captions: fp.append(f"[vout]ass='{str(write_ass_captions(req.captions, seq, RENDER_DIR / f'autocut_{jid}.ass')).replace(':', chr(92) + ':')}'[vsub]")
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-v", "error", "-i", req.media_path, "-filter_complex", ";".join(fp), "-map", "[vsub]" if req.captions else "[vout]", "-map", "[aout]", "-r", str(seq.fps), "-c:v", "libx264", "-preset", "veryfast", "-c:a", "aac", str(out_path)], check=True, timeout=180)
    return RenderResult(job_id=jid, output_path=str(out_path), width=seq.width, height=seq.height, duration_sec=round(probe_duration(str(out_path)) or sum(s.duration for s in en), 3))
