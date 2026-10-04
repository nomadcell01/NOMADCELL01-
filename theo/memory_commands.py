"""Commandes mémoire de T.H.E.O."""

from .memory_guard import MemoryGuard


class MemoryCommands:
    def __init__(self, guard: MemoryGuard):
        self.guard = guard

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
            allowed, value = self.guard.read(parts[1])
            if not allowed:
                return "Autorisation mémoire sensible requise."
            return "Mémoire vide." if value is None else value

        if name == "/forget":
            if len(parts) < 2:
                return "Usage: /forget <clé>"
            return self.guard.forget(parts[1])

        return "Commande inconnue."
