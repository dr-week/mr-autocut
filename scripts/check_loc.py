#!/usr/bin/env python3
"""Enforce the <= 15 non-empty LOC micro-modular rule across source files."""

from pathlib import Path
import sys

MAX_LOC = 15
ROOT = Path(__file__).resolve().parent.parent
TARGETS = [ROOT / "backend" / "mr_autocut", ROOT / "frontend" / "src"]

violations = []
for base in TARGETS:
    if not base.exists():
        continue
    for f in sorted(base.rglob("*")):
        if f.suffix not in {".py", ".ts", ".js"}:
            continue
        loc = sum(1 for ln in f.read_text(encoding="utf-8").splitlines() if ln.strip())
        if loc > MAX_LOC:
            violations.append((f.relative_to(ROOT), loc))

if violations:
    print(f"Found {len(violations)} file(s) over {MAX_LOC} LOC:")
    for rel, loc in violations:
        print(f"  {rel}: {loc} LOC")
    sys.exit(1)

print(f"All source files pass the <= {MAX_LOC} LOC micro-modular rule!")
