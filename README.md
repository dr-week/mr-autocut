# MR-AutoCut v0.4.0 — FilmCraft Companion Extension

[![Live Studio (GitHub Pages)](https://img.shields.io/badge/Live%20Studio-GitHub%20Pages-06b6d4?style=flat-square)](https://dr-week.github.io/mr-autocut/)
[![CI](https://github.com/dr-week/mr-autocut/actions/workflows/ci.yml/badge.svg)](https://github.com/dr-week/mr-autocut/actions/workflows/ci.yml)
[![Windows Installer (.exe / .msi)](https://img.shields.io/badge/Windows%20Installer-.exe%20%7C%20.msi-2563eb?style=flat-square)](https://github.com/dr-week/mr-autocut/releases/latest)
[![Hugging Face Space](https://img.shields.io/badge/%F0%9F%A4%97%20HF%20Space-mr--autocut-f59e0b?style=flat-square)](https://huggingface.co/spaces/dr-week/mr-autocut)

**Live Demo (Zero-Server Web Audio Mode):** https://dr-week.github.io/mr-autocut/

A futuristic, minimal, **120 FPS** companion extension for [FilmCraft](https://github.com/storytold/filmcraft) inspired by **Mr Horse**, built with **[Zuari (`dr-week/fast-framework`)](https://github.com/dr-week/fast-framework)** (`~10 kB` gzipped, zero Virtual DOM) and a micro-modular **Python (`uv`) + FastAPI + FFmpeg + `yt-dlp` + `filmcraft-cli`** automation engine (**100% of source files ≤ 15 LOC**).

## Features
- **3 Flexible Workspace Modes**: **Dock** (`340px` vertical rail beside FilmCraft), **Studio** (full 3-column deck), and **Mini-HUD** (1-row keyboard bar) + **`Cmd/Ctrl + K` Command Palette** + **TopBar Auto-Update Pill**.
- **Sequence-Adaptive Auto-Cut & Conversion**: Reads active FilmCraft sequence dimensions (`sequence.inspect`) — every preview, crop/fit, caption, and MP4 render adapts automatically to `16:9`, `9:16`, `1:1`, `4:5`, `4K`, or custom sizes.
- **YouTube Transition Harvester & Blend-Mode Compositor (`yt-dlp` + FFmpeg + FilmCraft `V2`)**:
  - Downloads transition/overlay compilations from YouTube (including the 7 curated reference packs), **automatically trims the first & last few seconds to strip channel intro/outro logos**, detects flash peaks (`select='gt(scene,0.18)'`), and slices clean individual **`.mp4` overlays + `.wav` SFX** from the middle.
  - Automatically applies the right blending mode per clip category: **`Screen`** for light leaks/film burns, **`Linear Dodge (Add)`** for VFX energy flashes, **`Multiply`** for crumpled paper/retro textures, and **`Overlay`** for film grain — both in **FilmCraft (`V2` overlay + `A2` SFX + `effects.setParam {effect:"opacity", param:"blend"}`)** and in **FFmpeg (`format=gbrp,blend=all_mode=screen`)**.
- **Per-Clip Auto Color Grading & 3-Way Color Wheels**: Camera CST detection (`ffprobe`), `signalstats` auto-balance, live 120 FPS **Lift / Gamma / Gain** wheels, FilmCraft `lumetri.applyMatch {faceDetection: true}`, and `.cube` 3D LUT export.
- **3-Pass Auto-Improve & QUBO Reel Optimizer**: Iterative Pass 1 → 2 → 3 critic + quantum-inspired QUBO optimal clip selection + beat-grid detection & speech-triggered auto-ducking.
- **Free Asset Hub & Google Flow**: Built-in search & 1-click download from **Openverse CC0**, **Pexels**, **Pixabay**, **Freesound**, plus a 1-click **Google Flow** launcher.
- **Zero-Cost AI & Colab Learning**: Ready-to-run [`colab/ai_director.ipynb`](colab/ai_director.ipynb) (Whisper + open LLM) and [`colab/train_style_model.ipynb`](colab/train_style_model.ipynb) (`edits.jsonl` → `style_profile.json`).

## Windows Installer (`.exe` / `.msi`) & 1-Click Bootstrapper

Download the latest signed Windows installer from **[GitHub Releases](https://github.com/dr-week/mr-autocut/releases/latest)**, or run in **PowerShell**:
```powershell
irm https://raw.githubusercontent.com/dr-week/mr-autocut/main/installer/install.ps1 | iex
```
- **Auto-Updates**: Installed Tauri desktop builds check `latest.json` on GitHub Releases automatically, and the web studio displays a live **TopBar update pill** via `GET /api/updater/check`.

## Quick Start (Linux / macOS / Dev)

```bash
# Start both FastAPI backend (:8000) and Zuari 120 FPS UI (:5173)
bash scripts/dev.sh

# Run full verification suite (10/10 pytest + TypeScript/Vite build + <=15 LOC audit)
bash scripts/verify.sh
```

## Free Everywhere Hosting & Auto-Failover
1. **Local (`127.0.0.1:8000`)** — Full `filmcraft-cli --bridge`, YouTube Harvester, local folders, fast FFmpeg.
2. **Hugging Face Space (`https://dr-week-mr-autocut.hf.space`)** — Auto-deployed Docker backend via [`.github/workflows/deploy-space.yml`](.github/workflows/deploy-space.yml) and [`backend/Dockerfile`](backend/Dockerfile).
3. **Google Colab T4 + Gemini Free Tier** — [`colab/ai_director.ipynb`](colab/ai_director.ipynb) & [`colab/train_style_model.ipynb`](colab/train_style_model.ipynb).
4. **GitHub Pages (Zero-Server Fallback)** — Live at https://dr-week.github.io/mr-autocut/ using native Web Audio API.
