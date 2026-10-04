from __future__ import annotations

from pathlib import Path


class SafeFiles:
    def __init__(self, allowed_roots: tuple[Path, ...]) -> None:
        self.allowed_roots = tuple(p.expanduser().resolve() for p in allowed_roots)

    def resolve(self, raw: str) -> Path:
        candidate = Path(raw).expanduser().resolve()
        if not any(candidate == root or root in candidate.parents for root in self.allowed_roots):
            raise PermissionError("Chemin hors des dossiers autorisés.")
        return candidate

    def list_text(self, raw: str, limit: int = 50) -> list[str]:
        directory = self.resolve(raw)
        if not directory.is_dir():
            raise NotADirectoryError(raw)
        allowed = {".txt", ".md", ".json", ".py", ".csv", ".log"}
        return [str(p.relative_to(directory)) for p in sorted(directory.iterdir()) if p.is_file() and p.suffix.lower() in allowed][:limit]

    def read_text(self, raw: str, max_chars: int = 20000) -> str:
        path = self.resolve(raw)
        if not path.is_file():
            raise FileNotFoundError(raw)
        if path.suffix.lower() not in {".txt", ".md", ".json", ".py", ".csv", ".log"}:
            raise PermissionError("Type de fichier non autorisé en V1.")
        return path.read_text(encoding="utf-8", errors="replace")[:max_chars]
