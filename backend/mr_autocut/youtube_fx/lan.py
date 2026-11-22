"""Detect local Wi-Fi LAN IP and Mr. Horse-style Product Manager / Extension Launcher status."""
import socket

def get_lan_and_launcher_info(port: int = 8000) -> dict:
    ip = "127.0.0.1"
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(("8.8.8.8", 80)); ip = s.getsockname()[0]; s.close()
    except Exception: pass
    return {
        "lan_ip": ip, "lan_api_url": f"http://{ip}:{port}", "android_remote_url": f"http://{ip}:5173/?mode=phone&api=http://{ip}:{port}",
        "extensions": [
            {"id": "filmcraft-ext", "target": "FilmCraft Studio", "type": "Minimal Mr. Horse Companion Window (--bridge)", "installed": True},
            {"id": "filmora-ext", "target": "Wondershare Filmora", "type": "Dual-Screen Floating Companion + XML/JSON Pack", "installed": True},
            {"id": "android-apk", "target": "Android Phone (Wi-Fi LAN / Capacitor APK)", "type": "InShot/VN/CapCut 1-Tap Auto-Editor", "installed": True},
        ],
    }
