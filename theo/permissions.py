"""Permission gate for T.H.E.O. phone actions."""

from collections.abc import Callable

from .admin_confirmation import AdminConfirmation


class PermissionGate:
    READ_ONLY = {
        "files.read",
        "status.read",
        "battery.read",
        "calendar.read",
    }
    SENSITIVE = {
        "memory.sensitive.read",
        "memory.sensitive.write",
        "phone.call",
        "phone.sms",
        "phone.contacts.read",
        "phone.contacts.write",
        "files.write",
        "actuator.write",
    }

    def __init__(
        self,
        confirmation: AdminConfirmation | None = None,
        auth_checker: Callable[[], bool] | None = None,
    ) -> None:
        self._granted: set[str] = set()
        self.confirmation = confirmation or AdminConfirmation()
        self._auth_checker = auth_checker
        self._quiet_mode = True
        self._physical_unlock = False

    def check(self, permission: str) -> bool:
        if permission in self.READ_ONLY:
            return True
        if permission in self.SENSITIVE:
            if self._auth_checker is not None and not self._auth_checker():
                self.lock_all()
                return False
            return (
                not self._quiet_mode
                and self._physical_unlock
                and permission in self._granted
                and self.confirmation.is_confirmed(permission)
            )
        return permission in self._granted

    def grant(self, permission: str) -> None:
        self._granted.add(permission)

    def revoke(self, permission: str) -> None:
        self._granted.discard(permission)

    def set_quiet_mode(self, enabled: bool) -> None:
        self._quiet_mode = enabled
        if enabled:
            self._physical_unlock = False

    def quiet_mode(self) -> bool:
        return self._quiet_mode

    def set_physical_unlock(self, unlocked: bool) -> None:
        self._physical_unlock = unlocked

    def physical_unlock(self) -> bool:
        return self._physical_unlock

    def lock_all(self) -> None:
        """Verrouille immédiatement toutes les actions sensibles."""
        self._quiet_mode = True
        self._physical_unlock = False
