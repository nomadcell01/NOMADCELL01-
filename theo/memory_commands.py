"""Commandes mémoire de T.H.E.O."""

from .memory_guard import MemoryGuard


class MemoryCommands:
    COMMANDS = {"/remember", "/memory", "/memory-keys", "/forget"}

    def __init__(self, guard: MemoryGuard):
        self.guard = guard

    def handle(self, command: str) -> str:
        if not isinstance(command, str):
            return "Commande mémoire invalide."

        parts = command.strip().split(maxsplit=2)
        name = parts[0] if parts else ""

        if name == "/remember":
            if len(parts) < 3:
                return "Usage: /remember <clé> <valeur>"
            try:
                return self.guard.remember(parts[1], parts[2])
            except (TypeError, ValueError) as exc:
                return f"Mémoire refusée: {exc}"

        if name == "/memory":
            if len(parts) == 1:
                return "Aucune clé demandée."
            try:
                allowed, value = self.guard.read(parts[1])
            except (TypeError, ValueError) as exc:
                return f"Mémoire refusée: {exc}"
            if not allowed:
                return "Autorisation mémoire sensible requise."
            return "Mémoire vide." if value is None else value

        if name == "/memory-keys":
            keys = self.guard.list_keys()
            return "Aucune mémoire enregistrée." if not keys else "\n".join(keys)

        if name == "/forget":
            if len(parts) < 2:
                return "Usage: /forget <clé>"
            try:
                return self.guard.forget(parts[1])
            except (TypeError, ValueError) as exc:
                return f"Mémoire refusée: {exc}"

        return "Commande inconnue." if name else "Commande vide."
