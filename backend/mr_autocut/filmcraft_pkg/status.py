"""Locate filmcraft-cli binary and check runtime status."""
import shutil, subprocess
from pathlib import Path
from .models import FilmCraftStatus

def _find_filmcraft_cli() -> str | None:
    if found := shutil.which("filmcraft-cli"): return found
    p = Path.home() / ".local" / "bin" / "filmcraft-cli"
    return str(p) if p.is_file() else None

def get_filmcraft_status() -> FilmCraftStatus:
    cli = _find_filmcraft_cli(); ver = None
    if cli:
        try: ver = subprocess.check_output([cli, "--version"], text=True, stderr=subprocess.STDOUT, timeout=5).strip()
        except Exception: ver = None
    return FilmCraftStatus(cli_available=bool(cli and ver), cli_path=cli, cli_version=ver, ffmpeg_available=bool(shutil.which("ffmpeg")))
