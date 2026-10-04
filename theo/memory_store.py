"""Mémoire locale persistante et volontaire de T.H.E.O."""

import json
from pathlib import Path
from typing import Any


class TheoMemory:
    MAX_KEY_LENGTH = 200
    MAX_VALUE_LENGTH = 100_000

    def __init__(self, path: str | Path):
        self.path = Path(path).expanduser()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._data: dict[str, Any] = {}
        self._load()

    @classmethod
    def _validate_key(cls, key: str) -> str:
        if not isinstance(key, str):
            raise TypeError("Clé mémoire invalide.")
        key = key.strip()
        if not key or len(key) > cls.MAX_KEY_LENGTH:
            raise ValueError("Clé mémoire invalide.")
        return key

    @classmethod
    def _validate_value(cls, value: Any) -> Any:
        if isinstance(value, str):
            if len(value) > cls.MAX_VALUE_LENGTH:
                raise ValueError("Valeur mémoire trop longue.")
            return value
        try:
            json.dumps(value, ensure_ascii=False)
        except (TypeError, ValueError):
            raise TypeError("Valeur mémoire non sérialisable.") from None
        return value

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
        return self._data.get(self._validate_key(key), default)

    def set(self, key: str, value: Any) -> None:
        key = self._validate_key(key)
        self._data[key] = self._validate_value(value)
        self._save()

    def forget(self, key: str) -> None:
        self._data.pop(self._validate_key(key), None)
        self._save()

    def keys(self) -> list[str]:
        """Retourne les clés sans exposer directement le dictionnaire interne."""
        return sorted(self._data)
