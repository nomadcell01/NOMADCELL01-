from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class TheoConfig:
    home: Path
    data_dir: Path
    memory_file: Path
    allowed_roots: tuple[Path, ...]

    @classmethod
    def default(cls) -> "TheoConfig":
        home = Path.home() / "theo"
        data = home / "data"
        return cls(home, data, data / "memory.json", (home, Path.home() / "storage" / "shared"))

    def ensure(self) -> None:
        self.home.mkdir(parents=True, exist_ok=True)
        self.data_dir.mkdir(parents=True, exist_ok=True)
