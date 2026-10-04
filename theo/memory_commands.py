"""Commandes mémoire de T.H.E.O."""

from .memory_guard import MemoryGuard


class MemoryCommands:
    def __init__(self, guard: MemoryGuard):
        self.guard = guard
        self.memory = guard.memory

    def handle(self, command: str) -> str:
        parts = command.strip().split(maxsplit=2)
        name = parts[0] if parts else ""

        if name == "/remember":
            if len(parts) < 3:
                return "Usage: /remember <clé> <valeur>"
            return self.guard.remember(parts[1], parts[2])

        if name == "/memory":
            if len(parts) == 1:
                return "Aucune clé demandée."
            value = self.memory.get(parts[1])
            return "Mémoire vide." if value is None else str(value)

        if name == "/forget":
            if len(parts) < 2:
                return "Usage: /forget <clé>"
            return self.guard.forget(parts[1])

        return "Commande inconnue."
