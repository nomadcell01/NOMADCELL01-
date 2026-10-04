"""Authentification locale de deux administrateurs T.H.E.O."""

import hashlib
import hmac


class AdminAuthenticator:
    def __init__(self, secrets: dict[str, str] | str):
        if isinstance(secrets, str):
            secrets = {"admin1": secrets}
        if not secrets or any(not value for value in secrets.values()):
            raise ValueError("Secret administrateur obligatoire.")
        self._secret_hashes = {
            admin_id: hashlib.sha256(secret.encode("utf-8")).digest()
            for admin_id, secret in secrets.items()
        }
        self._authenticated_admin: str | None = None

    def authenticate(self, secret: str) -> bool:
        candidate = hashlib.sha256(secret.encode("utf-8")).digest()
        for admin_id, stored_hash in self._secret_hashes.items():
            if hmac.compare_digest(candidate, stored_hash):
                self._authenticated_admin = admin_id
                return True
        self._authenticated_admin = None
        return False

    def is_authenticated(self) -> bool:
        return self._authenticated_admin is not None

    def current_admin(self) -> str | None:
        return self._authenticated_admin

    def logout(self) -> None:
        self._authenticated_admin = None
