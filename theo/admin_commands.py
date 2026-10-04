"""Administration explicite des permissions de T.H.E.O."""

from .admin_confirmation import AdminConfirmation
from .permissions import PermissionGate


class AdminCommands:
    SENSITIVE = PermissionGate.SENSITIVE

    def __init__(
        self,
        permissions: PermissionGate,
        confirmation: AdminConfirmation | None = None,
    ):
        self.permissions = permissions
        self.confirmation = confirmation or permissions.confirmation

    def handle(self, command: str) -> str:
        parts = command.strip().split(maxsplit=1)
        name = parts[0] if parts else ""

        if name == "/confirm":
            if len(parts) < 2:
                return "Usage: /confirm <permission>"
            permission = parts[1]
            if permission not in self.SENSITIVE:
                return "Permission non sensible: aucune confirmation requise."
            self.confirmation.confirm(permission)
            return "Permission sensible confirmée. Utilisez /grant <permission>."

        if name == "/grant":
            if len(parts) < 2:
                return "Usage: /grant <permission>"
            permission = parts[1]
            if permission in self.SENSITIVE:
                if not self.confirmation.is_confirmed(permission):
                    return "Permission sensible: confirmation administrateur requise."
            self.permissions.grant(permission)
            return "Permission accordée."

        if name == "/revoke":
            if len(parts) < 2:
                return "Usage: /revoke <permission>"
            permission = parts[1]
            self.permissions.revoke(permission)
            if permission in self.SENSITIVE:
                self.confirmation.revoke(permission)
            return "Permission révoquée."

        return "Commande inconnue."
