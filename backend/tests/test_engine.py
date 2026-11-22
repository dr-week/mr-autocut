import subprocess
from pathlib import Path
from fastapi.testclient import TestClient

from mr_autocut.media import ffprobe_media
from mr_autocut.server import app

client = TestClient(app)


def _make_synthetic_clip(out_path: Path) -> Path:
    """Create a 4-second synthetic MP4 with tone (0-1.5s), silence (1.5-2.5s), tone (2.5-4s)."""
    cmd = [
        "ffmpeg",
        "-y",
        "-hide_banner",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "testsrc=duration=4:size=640x360:rate=24",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=440:duration=1.5",
        "-f",
        "lavfi",
        "-i",
        "anullsrc=r=44100:cl=mono:d=1.0",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=660:duration=1.5",
        "-filter_complex",
        "[1:a][2:a][3:a]concat=n=3:v=0:a=1[aout]",
        "-map",
        "0:v",
        "-map",
        "[aout]",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-c:a",
        "aac",
        str(out_path),
    ]
    subprocess.run(cmd, check=True, timeout=30)
    return out_path


def test_health_status_and_sequence_inspect():
    assert client.get("/api/health").json()["status"] == "ok"
    st = client.get("/api/filmcraft/status").json()
    assert st["ffmpeg_available"] is True
    assert st["cli_available"] is True
    assert "0.20.1" in st["cli_version"]

    seq = client.get("/api/filmcraft/sequence").json()
    assert seq["width"] > 0 and seq["height"] > 0 and seq["fps"] > 0


def test_real_ffmpeg_upload_analyze_and_sequence_adaptive_render(tmp_path: Path):
    clip = _make_synthetic_clip(tmp_path / "sample.mp4")

    with clip.open("rb") as fh:
        up = client.post(
            "/api/media/upload",
            files={"file": ("sample.mp4", fh, "video/mp4")},
        )
    assert up.status_code == 200
    info = up.json()
    assert info["width"] == 640 and info["height"] == 360
    assert len(info["waveform"]) == 160

    # Real FFmpeg silencedetect on uploaded clip
    an = client.post(
        "/api/analyze",
        json={
            "media_path": info["path"],
            "silence_db": -30.0,
            "min_silence_sec": 0.4,
            "padding_sec": 0.05,
        },
    ).json()
    assert an["mode"] == "ffmpeg"
    assert len(an["segments"]) >= 2
    assert an["removed_duration"] > 0.4

    # Render matched to a 9:16 vertical sequence (360x640) with ASS caption
    rend = client.post(
        "/api/render",
        json={
            "media_path": info["path"],
            "segments": an["segments"],
            "sequence": {"width": 360, "height": 640, "fps": 24.0, "fit_mode": "fill"},
            "captions": [{"start": 0.0, "end": 1.2, "text": "MR-AUTOCUT LIVE"}],
        },
    )
    assert rend.status_code == 200
    r = rend.json()
    assert r["width"] == 360 and r["height"] == 640
    meta = ffprobe_media(r["output_path"])
    assert meta["width"] == 360 and meta["height"] == 640


def test_project_folder_scan_director_learning_and_filmcraft_execute(tmp_path: Path):
    for sub, fname in [
        ("footage", "main.mp4"),
        ("broll", "city.mov"),
        ("music", "beat_120bpm.mp3"),
        ("sfx", "fast_whoosh_01.wav"),
        ("sfx", "cinematic_riser.wav"),
        ("overlays", "warm_lightleak_01.mp4"),
    ]:
        (tmp_path / sub).mkdir(exist_ok=True)
        (tmp_path / sub / fname).write_bytes(b"stub")

    scan = client.get("/api/assets/scan", params={"root": str(tmp_path)}).json()
    assert len(scan["footage"]) == 1
    assert scan["sfx"][0]["sub_tag"] in ("whoosh", "riser")
    assert scan["overlays"][0]["sub_tag"] == "lightleak"

    # AI Director prompt builder
    dp = client.post(
        "/api/director/prompt",
        json={
            "instruction": "Make a punchy 20s reel with light leaks on scene changes",
            "sequence": {"width": 1080, "height": 1920, "fps": 30.0},
        },
    ).json()
    assert "1080x1920" in dp["prompt"]
    assert "segments" in dp["expected_schema"]

    # Edit-delta learning logger
    learn = client.post(
        "/api/learning/log",
        json={
            "clip_features": {"duration": 2.1, "rms_db": -18.0},
            "suggested": {"keep": True, "punch_in": True},
            "user_final": {"keep": True, "punch_in": False},
        },
    ).json()
    assert learn["logged_edits"] >= 1

    # Headless filmcraft-cli --demo execution
    ex = client.post(
        "/api/filmcraft/execute",
        json={
            "segments": [
                {"index": 1, "start": 0.0, "end": 1.0, "duration": 1.0, "enabled": True}
            ],
            "sequence": {"width": 1920, "height": 1080, "fps": 30.0, "fit_mode": "fill"},
        },
    ).json()
    assert "filmcraft-cli" in ex["cli_invocation"]
    assert ex["exit_code"] in (0, 1)


def test_phase2_audio_beats_ducking_and_phase3_style_profile(tmp_path: Path):
    clip = _make_synthetic_clip(tmp_path / "beats.mp4")
    b = client.post("/api/audio/beats", params={"media_path": str(clip), "duration": 4.0}).json()
    assert b["bpm_estimate"] > 0

    duck = client.post(
        "/api/audio/ducking",
        json=[{"index": 1, "start": 0.5, "end": 2.0, "duration": 1.5, "enabled": True}],
    ).json()
    assert len(duck) == 1 and duck[0]["volume_db"] == -12.0

    prof = client.post("/api/learning/profile", json={"avg_shot_sec": 1.4, "punch_in_probability": 0.5}).json()
    assert prof["style_profile_loaded"] is True
    assert prof["style_profile"]["avg_shot_sec"] == 1.4


def test_color_science_auto_balance_and_cube_lut(tmp_path: Path):
    clip = _make_synthetic_clip(tmp_path / "grade.mp4")
    res = client.post("/api/color/analyze", params={"media_path": str(clip), "timestamp": 0.5}).json()
    assert res["science"]["color_space"]
    assert "lift" in res["grade"] and "gamma" in res["grade"] and "gain" in res["grade"]

    cube = client.post("/api/color/cube", json={"grade": res["grade"]})
    assert cube.status_code == 200
    assert "LUT_3D_SIZE 17" in cube.text


def test_qubo_reel_optimizer_and_filmcraft_color_match():
    segs = [
        {"index": i + 1, "start": i * 3.0, "end": (i + 1) * 3.0, "duration": 3.0, "kind": "hook" if i == 0 else ("broll" if i % 2 else "speech"), "enabled": True}
        for i in range(6)
    ]
    opt = client.post("/api/reel/optimize", params={"target_sec": 9.0}, json=segs).json()
    assert opt["actual_sec"] == 9.0
    assert len(opt["segments"]) == 3

    match = client.post("/api/color/match", params={"reference_seconds": 1.0}, json=[101, 102, 103]).json()
    assert match["command_count"] == 3
    assert "lumetri.applyMatch" in match["jsonl"]
