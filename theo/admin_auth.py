"""Authentification locale de l'administrateur T.H.E.O."""

import hashlib
import hmac


class AdminAuthenticator:
    def __init__(self, secret: str):
        if not secret:
            raise ValueError("Secret administrateur obligatoire.")
        self._secret_hash = hashlib.sha256(secret.encode("utf-8")).digest()
        self._authenticated = False

    def authenticate(self, secret: str) -> bool:
        candidate = hashlib.sha256(secret.encode("utf-8")).digest()
        self._authenticated = hmac.compare_digest(candidate, self._secret_hash)
        return self._authenticated

    def is_authenticated(self) -> bool:
        return self._authenticated

    def logout(self) -> None:
        self._authenticated = False
