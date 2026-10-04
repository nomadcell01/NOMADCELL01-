"""Accès sécurisé aux fichiers du stockage autorisé de T.H.E.O."""

from pathlib import Path
import os
import tempfile


class FileManager:
    TEXT_EXTENSIONS = {".txt", ".md", ".json", ".py", ".csv", ".log"}
    MAX_READ_CHARS = 200_000
    MAX_WRITE_CHARS = 200_000

    def __init__(self, root: str | Path):
        self.root = Path(root).expanduser().resolve()

    def _safe_path(self, relative: str | Path) -> Path:
        if not isinstance(relative, (str, Path)):
            raise TypeError("Chemin fichier invalide.")
        target = (self.root / relative).resolve()
        if target != self.root and self.root not in target.parents:
            raise PermissionError("Accès fichier refusé.")
        return target

    def list_files(self, relative: str | Path = ".") -> list[str]:
        base = self._safe_path(relative)
        if not base.is_dir():
            raise NotADirectoryError(str(relative))
        return sorted(
            str(p.relative_to(self.root))
            for p in base.iterdir()
            if p.is_file()
        )

    def read_text(
        self,
        relative: str | Path,
        max_chars: int = MAX_READ_CHARS,
    ) -> str:
        if not isinstance(max_chars, int) or isinstance(max_chars, bool):
            raise TypeError("Limite de lecture invalide.")
        if max_chars <= 0:
            raise ValueError("Limite de lecture invalide.")
        max_chars = min(max_chars, self.MAX_READ_CHARS)

        target = self._safe_path(relative)
        if not target.is_file():
            raise FileNotFoundError(str(relative))
        if target.suffix.lower() not in self.TEXT_EXTENSIONS:
            raise PermissionError("Lecture de ce type de fichier refusée.")
        return target.read_text(encoding="utf-8")[:max_chars]

    def write_text(
        self,
        relative: str | Path,
        content: str,
        overwrite: bool = False,
    ) -> str:
        if not isinstance(content, str):
            raise TypeError("Contenu fichier invalide.")
        if len(content) > self.MAX_WRITE_CHARS:
            raise ValueError("Contenu fichier trop volumineux.")
        if not isinstance(overwrite, bool):
            raise TypeError("Option écrasement invalide.")

        target = self._safe_path(relative)
        if target.suffix.lower() not in self.TEXT_EXTENSIONS:
            raise PermissionError("Écriture de ce type de fichier refusée.")
        if target.exists() and not overwrite:
            raise FileExistsError(str(relative))

        target.parent.mkdir(parents=True, exist_ok=True)
        fd, temp_name = tempfile.mkstemp(
            prefix=".theo-write-",
            dir=str(target.parent),
            text=True,
        )
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                handle.write(content)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temp_name, target)
        except Exception:
            try:
                os.unlink(temp_name)
            except FileNotFoundError:
                pass
            raise

        return str(target.relative_to(self.root))
