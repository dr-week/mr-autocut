# MR-AutoCut — FilmCraft Companion Extension

A futuristic, minimal companion studio for [FilmCraft](https://getartcraft.com/apps/filmcraft) inspired by Mr Horse, built for **advanced auto-cutting**, **9:16 video reel creation**, and **one-click motion FX**.

## Architecture

- **`backend/`** — Python (`uv`) + FastAPI + FFmpeg (`silencedetect` / `ffprobe`) + `filmcraft-cli` bridge (`--bridge 127.0.0.1:PORT` or headless `--project`).
- **`frontend/`** — TypeScript + React + Vite futuristic minimal dark UI panel.

## Quick Start

```bash
# 1. Start the Auto-Cut & FilmCraft engine
cd backend
uv sync --extra dev
uv run uvicorn mr_autocut.server:app --reload --port 8000

# 2. Start the companion UI
cd ../frontend
npm install
npm run dev
```

## Testing

```bash
cd backend && uv run pytest -v
cd frontend && npm run build
```
