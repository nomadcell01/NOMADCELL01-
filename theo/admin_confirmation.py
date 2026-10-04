"""Confirmation explicite des permissions sensibles."""

class AdminConfirmation:
    def __init__(self):
        self._confirmed: set[str] = set()

    def is_confirmed(self, permission: str) -> bool:
        return permission in self._confirmed

    def confirm(self, permission: str) -> None:
        self._confirmed.add(permission)

    def revoke(self, permission: str) -> None:
        self._confirmed.discard(permission)
