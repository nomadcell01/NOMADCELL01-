"""Pont minimal et sécurisé entre T.H.E.O. et Android/Termux."""

from collections.abc import Callable
import json
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
        """Retourne uniquement un objet JSON batterie valide ou un état d'erreur."""
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

        return {"ok": True, "data": data}
