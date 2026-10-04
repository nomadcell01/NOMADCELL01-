"""Pont sécurisé entre T.H.E.O. et Android/Termux."""

from collections.abc import Callable
import json
import shutil
import subprocess
from typing import Any


class AndroidBridge:
    SAFE_COMMANDS = {
        "battery": "termux-battery-status",
        "device": "termux-device-info",
    }

    ACTUATOR_COMMANDS = {
        "notify": "termux-notification",
        "vibrate": "termux-vibrate",
        "speak": "termux-tts-speak",
        "clipboard_set": "termux-clipboard-set",
    }

    def __init__(self, runner: Callable[..., str] | None = None) -> None:
        self._runner = runner or self._run_termux

    @classmethod
    def _run_termux(cls, command: str = "battery", *args: str) -> str:
        executable = cls.SAFE_COMMANDS.get(command) or cls.ACTUATOR_COMMANDS.get(command)
        if executable is None:
            return "Commande refusée."
        try:
            result = subprocess.run(
                [executable, *args],
                capture_output=True,
                text=True,
                check=False,
                timeout=10,
            )
        except FileNotFoundError:
            return "Termux:API indisponible."
        except subprocess.TimeoutExpired:
            return "Commande Android expirée."

        output = result.stdout.strip() or result.stderr.strip()
        return output or "Commande Android exécutée."

    def run_safe(self, command: str) -> str:
        if command not in self.SAFE_COMMANDS:
            return "Commande refusée."
        return self._runner(command)

    def notify(self, title: str, content: str) -> str:
        if not isinstance(title, str) or not isinstance(content, str):
            return "Notification invalide."
        title = title.strip()[:120]
        content = content.strip()[:500]
        if not title or not content:
            return "Notification invalide."
        return self._runner("notify", "--title", title, "--content", content)

    def vibrate(self, duration_ms: int = 300) -> str:
        if not isinstance(duration_ms, int) or isinstance(duration_ms, bool):
            return "Durée vibration invalide."
        if duration_ms < 1 or duration_ms > 5000:
            return "Durée vibration invalide."
        return self._runner("vibrate", "-d", str(duration_ms))

    def speak(self, text: str) -> str:
        if not isinstance(text, str):
            return "Texte vocal invalide."
        text = text.strip()[:1000]
        if not text:
            return "Texte vocal invalide."
        return self._runner("speak", text)

    def clipboard_set(self, text: str) -> str:
        if not isinstance(text, str):
            return "Texte presse-papiers invalide."
        text = text.strip()[:10000]
        if not text:
            return "Texte presse-papiers invalide."
        return self._runner("clipboard_set", text)

    def _json_status(self, command: str, error_message: str) -> dict[str, Any]:
        raw = self.run_safe(command)
        if raw.startswith((
            "Termux:API indisponible.",
            "Commande Android expirée.",
            "Aucune réponse Android.",
            "Commande refusée.",
        )):
            return {"ok": False, "error": raw}

        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            return {"ok": False, "error": error_message}

        if not isinstance(data, dict):
            return {"ok": False, "error": "Réponse Android inattendue."}
        return {"ok": True, "data": data}

    def battery_status(self) -> dict[str, Any]:
        result = self._json_status("battery", "Réponse batterie invalide.")
        if not result.get("ok"):
            return result
        data = result["data"]
        normalized: dict[str, Any] = {"ok": True}
        for key in ("percentage", "plugged", "status", "health", "temperature", "current"):
            if key in data:
                normalized[key] = data[key]
        return normalized

    def device_info(self) -> dict[str, Any]:
        result = self._json_status("device", "Réponse appareil invalide.")
        if not result.get("ok"):
            return result
        return {"ok": True, "data": result["data"]}

    @staticmethod
    def storage_status(path: str) -> dict[str, Any]:
        try:
            total, used, free = shutil.disk_usage(path)
        except OSError:
            return {"ok": False, "error": "Stockage inaccessible."}
        return {
            "ok": True,
            "path": path,
            "total_bytes": total,
            "used_bytes": used,
            "free_bytes": free,
        }
