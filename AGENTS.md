# MR-AutoCut Engineering Rules — Micro-Modular Architecture

## Core Rule: ≤ 15 LOC per Source File
Every code file (`.py`, `.ts`, `.js`) MUST stay **≤ 15 non-empty lines of code**.
When any file approaches or exceeds 15 LOC:
1. Split by **single responsibility / single function** (one function or model per file).
2. Group related micro-modules into **department subfolders** with a tiny `__init__.py` or `index.ts` barrel re-export.
3. Keep each department self-contained with clear boundaries.

## Department Folder Structure

### Backend (`backend/mr_autocut/`)
- `models/` — Pydantic data contracts (`sequence.py`, `segment.py`, `media.py`, `director.py`)
- `media/` — `probe.py`, `waveform.py`, `upload.py`, `scanner.py`, `classify.py`
- `engine/` — `silence.py`, `segments.py`, `reel.py`, `captions.py`, `render.py`, `director.py`
- `filmcraft/` — `locate.py`, `status.py`, `inspect.py`, `compile.py`, `execute.py`
- `learning/` — `paths.py`, `log_delta.py`, `stats.py`
- `api/` — `app.py`, `routes_media.py`, `routes_engine.py`, `routes_filmcraft.py`, `routes_learning.py`

### Frontend (`frontend/src/`)
- `state/` — `types.ts`, `presets.ts`, `signals.ts`, `actions_analyze.ts`, `actions_media.ts`, `actions_filmcraft.ts`
- `sections/topbar/` — `view.ts`, `bindings.ts`, `index.ts`
- `sections/inspector/` — `tab_autocut.ts`, `tab_assets.ts`, `tab_motion.ts`, `tab_captions.ts`, `tab_director.ts`, `index.ts`
- `sections/monitor/` — `view.ts`, `bindings.ts`, `index.ts`
- `sections/bridge/` — `view.ts`, `queue.ts`, `index.ts`
- `sections/timeline/` — `waveform.ts`, `cuts.ts`, `playhead.ts`, `index.ts`

## Verification
Run the automated LOC guard before committing:
```bash
python3 scripts/check_loc.py
```
