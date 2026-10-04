"""Administration explicite des permissions de T.H.E.O."""

from .permissions import PermissionGate


class AdminCommands:
    def __init__(self, permissions: PermissionGate):
        self.permissions = permissions

    def handle(self, command: str) -> str:
        parts = command.strip().split(maxsplit=1)
        name = parts[0] if parts else ""

        if name == "/grant":
            if len(parts) < 2:
                return "Usage: /grant <permission>"
            self.permissions.grant(parts[1])
            return "Permission accordée."

        if name == "/revoke":
            if len(parts) < 2:
                return "Usage: /revoke <permission>"
            self.permissions.revoke(parts[1])
            return "Permission révoquée."

        return "Commande inconnue."
