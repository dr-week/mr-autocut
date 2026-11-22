"""ASS subtitle writer and AI Director prompt builder."""
import json
from pathlib import Path
from .models import CaptionLine, DirectorPromptRequest, DirectorPromptResult, SequenceSpec

def _t(sec: float) -> str:
    return f"{int(sec // 3600)}:{int((sec % 3600) // 60):02d}:{int(sec % 60):02d}.{int(round((sec - int(sec)) * 100)) % 100:02d}"

def write_ass_captions(captions: list[CaptionLine], seq: SequenceSpec, out_path: Path) -> Path:
    fs, mv = max(28, int(seq.height * 0.048)), max(36, int(seq.height * 0.12))
    hdr = f"[Script Info]\nScriptType: v4.00+\nPlayResX: {seq.width}\nPlayResY: {seq.height}\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Minimal,DejaVu Sans,{fs},&H00FFFFFF,&H0038BDF8,&H00080A10,&H80000000,-1,0,0,0,100,100,0,0,1,3,1,2,40,40,{mv},1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n"
    out_path.write_text(hdr + "\n".join(f"Dialogue: 0,{_t(c.start)},{_t(c.end)},Minimal,,0,0,0,,{c.text}" for c in captions) + "\n", encoding="utf-8")
    return out_path

def build_director_prompt(req: DirectorPromptRequest) -> DirectorPromptResult:
    sch = {"segments": [{"index": 1, "start": 0.0, "end": 3.2, "duration": 3.2, "kind": "hook", "scale": 1.12, "transition": "whip-pan", "light_leak": True, "sfx": "whoosh", "label": "01 · Hook"}]}
    return DirectorPromptResult(prompt=f"You are an expert Premiere Pro / FilmCraft video editor.\nTarget Sequence: {req.sequence.width}x{req.sequence.height} @ {req.sequence.fps}fps ({req.sequence.fit_mode}).\nUser Direction: {req.instruction}\nAvailable Project Assets: {json.dumps(req.available_assets)}\nCurrent Detected Segments: {json.dumps([s.model_dump() for s in req.segments])}\n\nReturn ONLY valid JSON matching this schema:\n{json.dumps(sch, indent=2)}", expected_schema=sch)
