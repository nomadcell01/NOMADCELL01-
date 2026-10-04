"""Administration explicite des permissions de T.H.E.O."""

from .permissions import PermissionGate


class AdminCommands:
    SENSITIVE = {
        "memory.sensitive.write",
        "phone.call",
        "phone.sms",
        "phone.contacts.write",
        "files.write",
    }

    def __init__(self, permissions: PermissionGate):
        self.permissions = permissions

    def handle(self, command: str) -> str:
        parts = command.strip().split(maxsplit=1)
        name = parts[0] if parts else ""

        if name == "/grant":
            if len(parts) < 2:
                return "Usage: /grant <permission>"
            permission = parts[1]
            if permission in self.SENSITIVE:
                return "Permission sensible: confirmation administrateur requise."
            self.permissions.grant(permission)
            return "Permission accordée."

        if name == "/revoke":
            if len(parts) < 2:
                return "Usage: /revoke <permission>"
            self.permissions.revoke(parts[1])
            return "Permission révoquée."

        return "Commande inconnue."
