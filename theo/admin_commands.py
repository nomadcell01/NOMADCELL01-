"""Administration explicite des permissions de T.H.E.O."""

from .admin_auth import AdminAuthenticator
from .admin_confirmation import AdminConfirmation
from .permissions import PermissionGate
from .security_log import SecurityLog


class AdminCommands:
    SENSITIVE = PermissionGate.SENSITIVE

    def __init__(self, permissions: PermissionGate, confirmation: AdminConfirmation | None = None, authenticator: AdminAuthenticator | None = None, security_log: SecurityLog | None = None):
        self.permissions = permissions
        self.confirmation = confirmation or permissions.confirmation
        self.authenticator = authenticator
        self.security_log = security_log

    def _log(self, event: str, detail: str | None = None) -> None:
        if self.security_log:
            self.security_log.record(event, self.authenticator.current_admin() if self.authenticator else None, detail)

    def handle(self, command: str) -> str:
        parts = command.strip().split(maxsplit=1)
        name = parts[0] if parts else ""

        if name == "/confirm":
            if self.authenticator and not self.authenticator.is_authenticated():
                self._log("admin_denied", "confirm: unauthenticated")
                return "Administrateur non authentifié ou session expirée."
            if len(parts) < 2:
                return "Usage: /confirm <permission>"
            permission = parts[1]
            if permission not in self.SENSITIVE:
                return "Permission non sensible: aucune confirmation requise."
            self.confirmation.confirm(permission)
            self.authenticator and self.authenticator.touch()
            self._log("permission_confirmed", permission)
            return "Permission sensible confirmée. Utilisez /grant <permission>."

        if name == "/grant":
            if len(parts) < 2:
                return "Usage: /grant <permission>"
            permission = parts[1]
            if permission in self.SENSITIVE:
                if self.authenticator and not self.authenticator.is_authenticated():
                    self._log("admin_denied", f"grant: {permission}")
                    return "Administrateur non authentifié ou session expirée."
                if not self.confirmation.is_confirmed(permission):
                    self._log("permission_denied", permission)
                    return "Permission sensible: confirmation administrateur requise."
                self.authenticator and self.authenticator.touch()
            self.permissions.grant(permission)
            self._log("permission_granted", permission)
            return "Permission accordée."

        if name == "/revoke":
            if len(parts) < 2:
                return "Usage: /revoke <permission>"
            permission = parts[1]
            self.permissions.revoke(permission)
            if permission in self.SENSITIVE:
                self.confirmation.revoke(permission)
            if self.authenticator:
                self.authenticator.touch()
            self._log("permission_revoked", permission)
            return "Permission révoquée."

        return "Commande inconnue."
