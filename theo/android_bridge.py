"""Pont minimal et sécurisé entre T.H.E.O. et Android/Termux."""

from collections.abc import Callable
import subprocess


class AndroidBridge:
    def __init__(self, runner: Callable[..., str] | None = None) -> None:
        self._runner = runner or self._run_termux

    @staticmethod
    def _run_termux(*args: str) -> str:
        result = subprocess.run(
            ["termux-battery-status", *args],
            capture_output=True,
            text=True,
            check=False,
        )
        return result.stdout.strip() or result.stderr.strip()

    def run_safe(self, command: str) -> str:
        if command != "battery":
            return "Commande refusée."
        return self._runner()
