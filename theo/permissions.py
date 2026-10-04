"""Permission gate for T.H.E.O. phone actions."""

from .admin_confirmation import AdminConfirmation


class PermissionGate:
    READ_ONLY = {"files.read", "status.read", "battery.read"}
    SENSITIVE = {
        "memory.sensitive.write",
        "phone.call",
        "phone.sms",
        "phone.contacts.write",
        "files.write",
    }

    def __init__(self, confirmation: AdminConfirmation | None = None) -> None:
        self._granted: set[str] = set()
        self.confirmation = confirmation or AdminConfirmation()

    def check(self, permission: str) -> bool:
        if permission in self.READ_ONLY:
            return True
        if permission in self.SENSITIVE:
            return (
                permission in self._granted
                and self.confirmation.is_confirmed(permission)
            )
        return permission in self._granted

    def grant(self, permission: str) -> None:
        self._granted.add(permission)

    def revoke(self, permission: str) -> None:
        self._granted.discard(permission)
