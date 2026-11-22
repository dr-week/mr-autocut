#!/usr/bin/env python3
"""Scaffold a <= 15 LOC micro-module inside a backend or frontend department."""

from pathlib import Path
import sys

if len(sys.argv) != 4 or sys.argv[1] not in {"backend", "frontend"}:
    print("Usage: python3 scripts/new_module.py <backend|frontend> <department> <name>")
    sys.exit(2)

side, dept, name = sys.argv[1], sys.argv[2], sys.argv[3]
root = Path(__file__).resolve().parent.parent
if side == "backend":
    target = root / "backend" / "mr_autocut" / dept / f"{name}.py"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(f'"""{dept}.{name} micro-module."""\n\nfrom __future__ import annotations\n', encoding="utf-8")
else:
    target = root / "frontend" / "src" / dept / f"{name}.ts"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(f"// {dept}/{name} micro-module\nexport function {name}() {{}}\n", encoding="utf-8")
print(f"Created {target.relative_to(root)}")
