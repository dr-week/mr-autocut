"""Edit-delta telemetry logger and Colab style profile loader."""
import json
from datetime import datetime, timezone
from pathlib import Path
from pydantic import BaseModel

LOGS_DIR = Path(__file__).resolve().parent.parent / "training_logs"; LOGS_DIR.mkdir(parents=True, exist_ok=True); EDITS_LOG, STYLE_PROFILE_PATH = LOGS_DIR / "edits.jsonl", LOGS_DIR / "style_profile.json"
class EditDelta(BaseModel): clip_features: dict; suggested: dict; user_final: dict
class LearningStats(BaseModel): logged_edits: int; log_path: str; style_profile_loaded: bool; style_profile: dict | None = None

def log_edit_delta(delta: EditDelta) -> LearningStats:
    with EDITS_LOG.open("a", encoding="utf-8") as fh: fh.write(json.dumps({"ts": datetime.now(timezone.utc).isoformat(), **delta.model_dump()}) + "\n")
    return get_learning_stats()

def get_learning_stats() -> LearningStats:
    cnt = sum(1 for ln in EDITS_LOG.read_text(encoding="utf-8").splitlines() if ln.strip()) if EDITS_LOG.is_file() else 0
    prof = json.loads(STYLE_PROFILE_PATH.read_text(encoding="utf-8")) if STYLE_PROFILE_PATH.is_file() else None
    return LearningStats(logged_edits=cnt, log_path=str(EDITS_LOG), style_profile_loaded=prof is not None, style_profile=prof)
