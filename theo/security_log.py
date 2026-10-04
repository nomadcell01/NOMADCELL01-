"""Journal de sécurité local de T.H.E.O."""

import json
from datetime import datetime, timezone
from pathlib import Path


class SecurityLog:
    def __init__(self, path: str | Path):
        self.path = Path(path).expanduser()
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def record(self, event: str, admin: str | None = None, detail: str | None = None) -> None:
        entry = {
            "time": datetime.now(timezone.utc).isoformat(),
            "event": event,
        }
        if admin:
            entry["admin"] = admin
        if detail:
            entry["detail"] = detail
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(entry, ensure_ascii=False) + "\n")

    def recent(self, limit: int = 50) -> list[dict]:
        if limit <= 0 or not self.path.exists():
            return []
        lines = self.path.read_text(encoding="utf-8").splitlines()[-limit:]
        result = []
        for line in lines:
            try:
                result.append(json.loads(line))
            except json.JSONDecodeError:
                continue
        return result
