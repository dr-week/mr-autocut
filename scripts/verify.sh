#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$HOME/.local/bin:$PATH"

echo "=== 1. Backend Tests ==="
(cd "$ROOT/backend" && uv run pytest -v)

echo "=== 2. Frontend Typecheck & Build ==="
(cd "$ROOT/frontend" && npm run build)

echo "=== 3. Micro-Modular LOC Audit ==="
python3 "$ROOT/scripts/check_loc.py" || true
