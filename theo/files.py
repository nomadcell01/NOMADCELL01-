from __future__ import annotations

from pathlib import Path


class SafeFiles:
    TEXT_EXTENSIONS = {".txt", ".md", ".json", ".py", ".csv", ".log"}

    def __init__(self, allowed_roots: tuple[Path, ...]) -> None:
        self.allowed_roots = tuple(p.expanduser().resolve() for p in allowed_roots)

    def resolve(self, raw: str) -> Path:
        requested = Path(raw).expanduser()
        if requested.is_absolute():
            candidates = (requested.resolve(),)
        else:
            candidates = tuple((root / requested).resolve() for root in self.allowed_roots)

        for candidate in candidates:
            if any(candidate == root or root in candidate.parents for root in self.allowed_roots):
                return candidate

        raise PermissionError("Chemin hors des dossiers autorisés.")

    def list_text(self, raw: str, limit: int = 50) -> list[str]:
        directory = self.resolve(raw)
        if not directory.is_dir():
            raise NotADirectoryError(raw)
        return [
            str(p.relative_to(directory))
            for p in sorted(directory.iterdir())
            if p.is_file() and p.suffix.lower() in self.TEXT_EXTENSIONS
        ][:limit]

    def read_text(self, raw: str, max_chars: int = 20000) -> str:
        path = self.resolve(raw)
        if not path.is_file():
            raise FileNotFoundError(raw)
        if path.suffix.lower() not in self.TEXT_EXTENSIONS:
            raise PermissionError("Type de fichier non autorisé en V1.")
        return path.read_text(encoding="utf-8", errors="replace")[:max_chars]
