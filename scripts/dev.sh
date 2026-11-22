#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$HOME/.local/bin:$PATH"

trap 'kill 0' EXIT
(cd "$ROOT/backend" && uv run uvicorn mr_autocut.server:app --reload --port 8000) &
(cd "$ROOT/frontend" && npm run dev) &
wait
