"""Garde-fou pour la mémoire sensible de T.H.E.O."""

from .memory_store import TheoMemory
from .permissions import PermissionGate
from .security_log import SecurityLog


class MemoryGuard:
    SENSITIVE_PREFIXES = ("private.", "secret.", "security.")

    def __init__(self, memory: TheoMemory, permissions: PermissionGate, security_log: SecurityLog | None = None):
        self.memory = memory
        self.permissions = permissions
        self.security_log = security_log

    def _sensitive(self, key: str) -> bool:
        return key.startswith(self.SENSITIVE_PREFIXES)

    def _log(self, event: str, key: str) -> None:
        if self.security_log:
            self.security_log.record(event, detail=f"memory:{key}")

    def remember(self, key: str, value: str) -> str:
        if self._sensitive(key) and not self.permissions.check("memory.sensitive.write"):
            self._log("memory_write_denied", key)
            return "Autorisation mémoire sensible requise."
        self.memory.set(key, value)
        self._log("memory_written", key)
        return "Mémoire enregistrée."

    def read(self, key: str) -> tuple[bool, str | None]:
        if self._sensitive(key) and not self.permissions.check("memory.sensitive.read"):
            self._log("memory_read_denied", key)
            return False, None
        value = self.memory.get(key)
        self._log("memory_read", key)
        return True, None if value is None else str(value)

    def forget(self, key: str) -> str:
        if self._sensitive(key) and not self.permissions.check("memory.sensitive.write"):
            self._log("memory_delete_denied", key)
            return "Autorisation mémoire sensible requise."
        self.memory.forget(key)
        self._log("memory_deleted", key)
        return "Mémoire supprimée."
