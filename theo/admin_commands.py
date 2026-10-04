"""Administration explicite des permissions et des verrous de T.H.E.O."""

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

    def _require_admin(self) -> bool:
        if self.authenticator and not self.authenticator.is_authenticated():
            self._log("admin_denied", "control: unauthenticated")
            return False
        return True

    def handle(self, command: str) -> str:
        parts = command.strip().split(maxsplit=1)
        name = parts[0] if parts else ""

        if name == "/quiet-on":
            if not self._require_admin():
                return "Administrateur non authentifié ou session expirée."
            self.permissions.set_quiet_mode(True)
            self._log("quiet_mode_on")
            return "Mode tranquillité activé. Actions sensibles verrouillées."

        if name == "/quiet-off":
            if not self._require_admin():
                return "Administrateur non authentifié ou session expirée."
            self.permissions.set_quiet_mode(False)
            self._log("quiet_mode_off")
            return "Mode tranquillité désactivé. Le verrou physique reste actif."

        if name == "/physical-unlock":
            if not self._require_admin():
                return "Administrateur non authentifié ou session expirée."
            if self.permissions.quiet_mode():
                self._log("physical_unlock_denied", "quiet_mode")
                return "Déverrouillage refusé: désactivez d'abord le mode tranquillité."
            self.permissions.set_physical_unlock(True)
            self._log("physical_unlock")
            return "Verrou physique logique déverrouillé."

        if name == "/physical-lock":
            if not self._require_admin():
                return "Administrateur non authentifié ou session expirée."
            self.permissions.set_physical_unlock(False)
            self._log("physical_lock")
            return "Verrou physique logique activé."

        if name == "/safety-status":
            quiet = "ON" if self.permissions.quiet_mode() else "OFF"
            physical = "UNLOCKED" if self.permissions.physical_unlock() else "LOCKED"
            return f"Mode tranquillité: {quiet} | Verrou physique: {physical}"

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
