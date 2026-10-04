from __future__ import annotations

import shutil
import subprocess


class AndroidBridge:
    def available(self, command: str) -> bool:
        return shutil.which(command) is not None

    def _run(self, command: str, *args: str) -> tuple[bool, str]:
        if not self.available(command):
            return False, f"Capacité indisponible : {command}"
        try:
            result = subprocess.run([command, *args], capture_output=True, text=True, timeout=10, check=False)
            output = (result.stdout or result.stderr).strip()
            return result.returncode == 0, output
        except (OSError, subprocess.SubprocessError) as exc:
            return False, f"Échec {command}: {exc}"

    def battery(self) -> tuple[bool, str]:
        return self._run("termux-battery-status")

    def notify(self, title: str, content: str) -> tuple[bool, str]:
        return self._run("termux-notification", "--title", title, "--content", content)

    def clipboard_get(self) -> tuple[bool, str]:
        return self._run("termux-clipboard-get")
