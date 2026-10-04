"""Pont minimal et sécurisé entre T.H.E.O. et Android/Termux."""

from collections.abc import Callable
import json
import shutil
import subprocess
from typing import Any


class AndroidBridge:
    def __init__(self, runner: Callable[..., str] | None = None) -> None:
        self._runner = runner or self._run_termux

    @staticmethod
    def _run_termux(*args: str) -> str:
        try:
            result = subprocess.run(
                ["termux-battery-status", *args],
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
        return output or "Aucune réponse Android."

    def run_safe(self, command: str) -> str:
        if command != "battery":
            return "Commande refusée."
        return self._runner()

    def battery_status(self) -> dict[str, Any]:
        """Retourne un état batterie normalisé sans exposer de réponse brute."""
        raw = self.run_safe("battery")
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
            return {"ok": False, "error": "Réponse batterie invalide."}

        if not isinstance(data, dict):
            return {"ok": False, "error": "Réponse batterie inattendue."}

        normalized: dict[str, Any] = {"ok": True}
        for key in ("percentage", "plugged", "status", "health", "temperature", "current"):
            if key in data:
                normalized[key] = data[key]

        return normalized

    @staticmethod
    def storage_status(path: str) -> dict[str, Any]:
        """Retourne l'espace disque d'un chemin autorisé sans exécuter de commande shell."""
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
