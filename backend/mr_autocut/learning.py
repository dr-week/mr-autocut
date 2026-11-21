"""Edit-delta telemetry logger and Colab style profile loader."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from pydantic import BaseModel

LOGS_DIR = Path(__file__).resolve().parent.parent / "training_logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)
EDITS_LOG = LOGS_DIR / "edits.jsonl"
STYLE_PROFILE_PATH = LOGS_DIR / "style_profile.json"


class EditDelta(BaseModel):
    clip_features: dict
    suggested: dict
    user_final: dict


class LearningStats(BaseModel):
    logged_edits: int
    log_path: str
    style_profile_loaded: bool
    style_profile: dict | None = None


def log_edit_delta(delta: EditDelta) -> LearningStats:
    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        **delta.model_dump(),
    }
    with EDITS_LOG.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record) + "\n")
    return get_learning_stats()


def get_learning_stats() -> LearningStats:
    count = 0
    if EDITS_LOG.is_file():
        with EDITS_LOG.open("r", encoding="utf-8") as fh:
            count = sum(1 for line in fh if line.strip())
    profile = None
    if STYLE_PROFILE_PATH.is_file():
        try:
            profile = json.loads(STYLE_PROFILE_PATH.read_text(encoding="utf-8"))
        except Exception:
            profile = None
    return LearningStats(
        logged_edits=count,
        log_path=str(EDITS_LOG),
        style_profile_loaded=profile is not None,
        style_profile=profile,
    )
