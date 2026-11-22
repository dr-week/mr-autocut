# MR-AutoCut — FilmCraft Companion Extension

[![Live Studio (GitHub Pages)](https://img.shields.io/badge/Live%20Studio-GitHub%20Pages-06b6d4?style=flat-square)](https://dr-week.github.io/mr-autocut/)
[![CI](https://github.com/dr-week/mr-autocut/actions/workflows/ci.yml/badge.svg)](https://github.com/dr-week/mr-autocut/actions/workflows/ci.yml)

**Live Demo (Zero-Server Web Audio Mode):** https://dr-week.github.io/mr-autocut/

A futuristic, minimal, **120 FPS** companion extension for [FilmCraft](https://github.com/storytold/filmcraft) inspired by **Mr Horse**, built with **[Zuari (`dr-week/fast-framework`)](https://github.com/dr-week/fast-framework)** (`~10 kB` gzipped, zero Virtual DOM) and a modular **Python (`uv`) + FastAPI + FFmpeg + `filmcraft-cli`** automation engine.

## Features
- **3 Flexible Workspace Modes**: **Dock** (`340px` vertical rail beside FilmCraft), **Studio** (full 3-column deck), and **Mini-HUD** (1-row keyboard bar) + **`Cmd/Ctrl + K` Command Palette**.
- **Sequence-Adaptive Auto-Cut**: Reads active FilmCraft sequence dimensions (`sequence.inspect`) — every preview, crop/fit, caption, and MP4 render adapts automatically to `16:9`, `9:16`, `1:1`, `4:5`, `4K`, or custom sizes.
- **Mr Horse-Style FX & Light Leaks**: Instant search, category pills, `★` Favorites, hover micro-previews, alternating `112%` punch-ins, and auto-SFX (`whoosh`, `riser`, `hit`).
- **Per-Clip Auto Color Grading & 3-Way Color Wheels**: Camera CST detection (`ffprobe`), `signalstats` auto-balance, live 120 FPS **Lift / Gamma / Gain** wheels, FilmCraft `lumetri.applyMatch {faceDetection: true}`, and `.cube` 3D LUT export.
- **3-Pass Auto-Improve & QUBO Reel Optimizer**: Iterative Pass 1 → 2 → 3 critic + quantum-inspired QUBO optimal clip selection + beat-grid detection & speech-triggered auto-ducking.
- **Free Asset Hub & Google Flow**: Built-in search & 1-click download from **Openverse CC0**, **Pexels**, **Pixabay**, **Freesound**, plus a 1-click **Google Flow** launcher.
- **Zero-Cost AI & Colab Learning**: Ready-to-run [`colab/ai_director.ipynb`](colab/ai_director.ipynb) (Whisper + open LLM) and [`colab/train_style_model.ipynb`](colab/train_style_model.ipynb) (`edits.jsonl` → `style_profile.json`).

## Windows 1-Click Install (Auto-Installs FFmpeg, `uv` & Desktop Shortcut)

Run in **PowerShell**:
```powershell
irm https://raw.githubusercontent.com/dr-week/mr-autocut/main/installer/install.ps1 | iex
```
- **Auto-Updates**: MR-AutoCut checks GitHub Releases (`GET /api/updater/check`) automatically whenever a new `v*` tag is published via [`.github/workflows/release.yml`](.github/workflows/release.yml).

## Quick Start (Linux / macOS / Dev)

```bash
# Start both FastAPI backend (:8000) and Zuari 120 FPS UI (:5173)
bash scripts/dev.sh

# Run full verification suite (pytest + TypeScript/Vite build + LOC audit)
bash scripts/verify.sh
```

## Free Everywhere Hosting & Auto-Failover
1. **Local (`127.0.0.1:8000`)** — Full `filmcraft-cli --bridge`, local folders, fast FFmpeg.
2. **Hugging Face Spaces / Render / Koyeb** — Free Docker tiers via [`backend/Dockerfile`](backend/Dockerfile) (click the engine pill in the TopBar to paste your Space URL).
3. **Google Colab T4 + Gemini Free Tier** — [`colab/ai_director.ipynb`](colab/ai_director.ipynb) & [`colab/train_style_model.ipynb`](colab/train_style_model.ipynb).
4. **GitHub Pages (Zero-Server Fallback)** — Live at https://dr-week.github.io/mr-autocut/ using native Web Audio API.
