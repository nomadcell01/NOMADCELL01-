"""Accès sécurisé aux fichiers du stockage autorisé de T.H.E.O."""

from pathlib import Path


class FileManager:
    TEXT_EXTENSIONS = {".txt", ".md", ".json", ".py", ".csv", ".log"}

    def __init__(self, root: str | Path):
        self.root = Path(root).expanduser().resolve()

    def _safe_path(self, relative: str | Path) -> Path:
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

    def read_text(self, relative: str | Path, max_chars: int = 200_000) -> str:
        target = self._safe_path(relative)
        if not target.is_file():
            raise FileNotFoundError(str(relative))
        if target.suffix.lower() not in self.TEXT_EXTENSIONS:
            raise PermissionError("Lecture de ce type de fichier refusée.")
        return target.read_text(encoding="utf-8")[:max_chars]
