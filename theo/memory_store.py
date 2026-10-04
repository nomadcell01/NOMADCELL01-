"""Mémoire locale persistante et volontaire de T.H.E.O."""

import json
from pathlib import Path
from typing import Any


class TheoMemory:
    def __init__(self, path: str | Path):
        self.path = Path(path).expanduser()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._data: dict[str, Any] = {}
        self._load()

    def _load(self) -> None:
        if not self.path.exists():
            return
        try:
            loaded = json.loads(self.path.read_text(encoding="utf-8"))
            self._data = loaded if isinstance(loaded, dict) else {}
        except (OSError, json.JSONDecodeError):
            self._data = {}

    def _save(self) -> None:
        """Écrit atomiquement la mémoire locale pour éviter un fichier partiellement écrit."""
        temporary = self.path.with_name(self.path.name + ".tmp")
        try:
            temporary.write_text(
                json.dumps(self._data, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            temporary.replace(self.path)
        except OSError:
            try:
                temporary.unlink(missing_ok=True)
            except OSError:
                pass
            raise

    def get(self, key: str, default: Any = None) -> Any:
        return self._data.get(key, default)

    def set(self, key: str, value: Any) -> None:
        self._data[key] = value
        self._save()

    def forget(self, key: str) -> None:
        self._data.pop(key, None)
        self._save()

    def keys(self) -> list[str]:
        """Retourne les clés sans exposer directement le dictionnaire interne."""
        return sorted(self._data)
