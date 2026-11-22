"""GitHub Releases auto-updater check for MR-AutoCut."""

from __future__ import annotations

import json
import urllib.request
from pydantic import BaseModel

APP_VERSION = "0.2.0"
RELEASES_URL = "https://api.github.com/repos/dr-week/mr-autocut/releases/latest"


class UpdateStatus(BaseModel):
    current_version: str
    latest_version: str
    update_available: bool
    release_url: str


def check_for_updates() -> UpdateStatus:
    req = urllib.request.Request(RELEASES_URL, headers={"User-Agent": "MR-AutoCut-Updater/0.2"})
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    latest = str(data.get("tag_name") or APP_VERSION).lstrip("v")
    return UpdateStatus(current_version=APP_VERSION, latest_version=latest, update_available=(latest != APP_VERSION), release_url=data.get("html_url") or "https://github.com/dr-week/mr-autocut/releases")
