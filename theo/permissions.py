"""Permission gate for T.H.E.O. phone actions."""


class PermissionGate:
    READ_ONLY = {"files.read", "status.read", "battery.read"}

    def __init__(self) -> None:
        self._granted: set[str] = set()

    def check(self, permission: str) -> bool:
        return permission in self.READ_ONLY or permission in self._granted

    def grant(self, permission: str) -> None:
        self._granted.add(permission)

    def revoke(self, permission: str) -> None:
        self._granted.discard(permission)
