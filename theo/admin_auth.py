"""Authentification locale de deux administrateurs T.H.E.O. avec expiration de session."""

import hashlib
import hmac
import time


class AdminAuthenticator:
    def __init__(
        self,
        secrets: dict[str, str] | str,
        session_timeout: int = 900,
        clock=time.monotonic,
    ):
        if isinstance(secrets, str):
            secrets = {"admin1": secrets}
        if (
            not isinstance(secrets, dict)
            or not secrets
            or any(
                not isinstance(admin_id, str)
                or not admin_id.strip()
                or not isinstance(secret, str)
                or not secret
                for admin_id, secret in secrets.items()
            )
        ):
            raise ValueError("Secrets administrateur invalides.")
        if len(secrets) > 2:
            raise ValueError("T.H.E.O. autorise au maximum deux administrateurs.")
        if session_timeout <= 0:
            raise ValueError("Durée de session invalide.")

        self._secret_hashes = {
            admin_id.strip(): hashlib.sha256(secret.encode("utf-8")).digest()
            for admin_id, secret in secrets.items()
        }
        self._session_timeout = session_timeout
        self._clock = clock
        self._authenticated_admin: str | None = None
        self._last_activity: float | None = None

    def authenticate(self, secret: str) -> bool:
        if not isinstance(secret, str) or not secret:
            self.logout()
            return False

        candidate = hashlib.sha256(secret.encode("utf-8")).digest()
        for admin_id, stored_hash in self._secret_hashes.items():
            if hmac.compare_digest(candidate, stored_hash):
                self._authenticated_admin = admin_id
                self._last_activity = self._clock()
                return True

        self.logout()
        return False

    def _expire_if_needed(self) -> None:
        if self._authenticated_admin is None or self._last_activity is None:
            return
        if self._clock() - self._last_activity >= self._session_timeout:
            self.logout()

    def is_authenticated(self) -> bool:
        self._expire_if_needed()
        return self._authenticated_admin is not None

    def current_admin(self) -> str | None:
        if not self.is_authenticated():
            return None
        return self._authenticated_admin

    def touch(self) -> None:
        if self.is_authenticated():
            self._last_activity = self._clock()

    def logout(self) -> None:
        self._authenticated_admin = None
        self._last_activity = None
