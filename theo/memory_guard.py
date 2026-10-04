"""Garde-fou pour la mémoire sensible de T.H.E.O."""

from .memory_store import TheoMemory
from .permissions import PermissionGate
from .security_log import SecurityLog


class MemoryGuard:
    SENSITIVE_PREFIXES = ("private.", "secret.", "security.")
    MAX_KEY_LENGTH = 128
    MAX_VALUE_LENGTH = 200_000

    def __init__(self, memory: TheoMemory, permissions: PermissionGate, security_log: SecurityLog | None = None):
        self.memory = memory
        self.permissions = permissions
        self.security_log = security_log

    def _validate_key(self, key: str) -> bool:
        if not key or len(key) > self.MAX_KEY_LENGTH:
            return False
        return not any(char.isspace() or ord(char) < 32 or ord(char) == 127 for char in key)

    def _validate_value(self, value: str) -> bool:
        return len(value) <= self.MAX_VALUE_LENGTH

    def _sensitive(self, key: str) -> bool:
        return key.startswith(self.SENSITIVE_PREFIXES)

    def _log(self, event: str, key: str) -> None:
        if self.security_log:
            self.security_log.record(event, detail=f"memory:{key}")

    def remember(self, key: str, value: str) -> str:
        if not self._validate_key(key):
            self._log("memory_write_invalid_key", key[:128])
            return "Clé mémoire invalide."
        if not self._validate_value(value):
            self._log("memory_write_value_too_large", key)
            return "Valeur mémoire trop volumineuse."
        if self._sensitive(key) and not self.permissions.check("memory.sensitive.write"):
            self._log("memory_write_denied", key)
            return "Autorisation mémoire sensible requise."
        self.memory.set(key, value)
        self._log("memory_written", key)
        return "Mémoire enregistrée."

    def read(self, key: str) -> tuple[bool, str | None]:
        if not self._validate_key(key):
            self._log("memory_read_invalid_key", key[:128])
            return False, None
        if self._sensitive(key) and not self.permissions.check("memory.sensitive.read"):
            self._log("memory_read_denied", key)
            return False, None
        value = self.memory.get(key)
        self._log("memory_read", key)
        return True, None if value is None else str(value)

    def list_keys(self) -> list[str]:
        """Liste seulement les clés que l'appelant est autorisé à voir."""
        visible = []
        for key in self.memory.keys():
            if self._sensitive(key) and not self.permissions.check("memory.sensitive.read"):
                self._log("memory_key_denied", key)
                continue
            visible.append(key)
        self._log("memory_keys_listed", "*")
        return visible

    def forget(self, key: str) -> str:
        if not self._validate_key(key):
            self._log("memory_delete_invalid_key", key[:128])
            return "Clé mémoire invalide."
        if self._sensitive(key) and not self.permissions.check("memory.sensitive.write"):
            self._log("memory_delete_denied", key)
            return "Autorisation mémoire sensible requise."
        self.memory.forget(key)
        self._log("memory_deleted", key)
        return "Mémoire supprimée."
