"""Garde-fou pour la mémoire sensible de T.H.E.O."""

from .memory_store import TheoMemory
from .permissions import PermissionGate


class MemoryGuard:
    SENSITIVE_PREFIXES = ("private.", "secret.", "security.")

    def __init__(self, memory: TheoMemory, permissions: PermissionGate):
        self.memory = memory
        self.permissions = permissions

    def remember(self, key: str, value: str) -> str:
        sensitive = key.startswith(self.SENSITIVE_PREFIXES)
        if sensitive and not self.permissions.check("memory.sensitive.write"):
            return "Autorisation mémoire sensible requise."
        self.memory.set(key, value)
        return "Mémoire enregistrée."

    def forget(self, key: str) -> str:
        self.memory.forget(key)
        return "Mémoire supprimée."
