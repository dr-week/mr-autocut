from fastapi.testclient import TestClient

from mr_autocut.server import app

client = TestClient(app)


def test_health_and_filmcraft_status():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

    st = client.get("/api/filmcraft/status").json()
    assert st["ffmpeg_available"] is True
    assert st["cli_available"] is True
    assert "0.20.1" in st["cli_version"]


def test_presets_and_analyze():
    presets = client.get("/api/presets").json()
    assert len(presets["auto_cut"]) >= 4
    assert len(presets["reel"]) >= 3
    assert len(presets["motion"]) >= 6

    analysis = client.post(
        "/api/analyze",
        json={"duration_sec": 42.0, "silence_db": -32.0, "min_silence_sec": 0.3},
    ).json()
    assert analysis["kept_duration"] > 0
    assert analysis["removed_duration"] > 0
    assert len(analysis["segments"]) >= 4


def test_reel_plan_and_filmcraft_script():
    plan = client.post(
        "/api/reel/plan",
        json={"source_duration": 60.0, "target_duration_sec": 30.0, "avg_shot_sec": 1.6},
    ).json()
    assert plan["aspect"] == "9:16"
    assert plan["shot_count"] >= 10
    assert plan["shots"][0]["kind"] == "hook"

    script = client.post(
        "/api/filmcraft/script",
        json={"segments": plan["shots"][:3], "bridge_addr": "127.0.0.1:9001"},
    ).json()
    assert script["command_count"] == 7
    assert "timeline.razor" in script["jsonl"]
    assert "--bridge 127.0.0.1:9001" in script["cli_invocation"]
