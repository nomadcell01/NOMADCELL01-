"""Point d'entrée local de T.H.E.O. pour Termux/Android."""

import getpass
import os
from pathlib import Path

from .admin_auth import AdminAuthenticator
from .admin_commands import AdminCommands
from .commands import TheoCommands
from .file_manager import FileManager
from .memory_commands import MemoryCommands
from .memory_guard import MemoryGuard
from .memory_store import TheoMemory
from .permissions import PermissionGate

DEFAULT_STORAGE = Path("~/storage/shared").expanduser()


def storage_root() -> Path:
    configured = os.environ.get("THEO_STORAGE_ROOT")
    return Path(configured).expanduser() if configured else DEFAULT_STORAGE


def build_services():
    root = storage_root()
    secret = os.environ.get("THEO_ADMIN_SECRET")
    if not secret:
        raise RuntimeError("THEO_ADMIN_SECRET doit être configuré avant de lancer T.H.E.O.")
    authenticator = AdminAuthenticator(secret)
    permissions = PermissionGate()
    files = TheoCommands(FileManager(root))
    memory = MemoryCommands(MemoryGuard(TheoMemory(root / ".theo" / "memory.json"), permissions))
    admin = AdminCommands(permissions, authenticator=authenticator)
    return files, memory, admin, authenticator


def main() -> None:
    files, memory, admin, authenticator = build_services()
    print("T.H.E.O. Avel — NOMADCELL01")
    print("Tape /help. /quit pour quitter.")

    while True:
        try:
            command = input("T.H.E.O.> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break

        if command in {"/quit", "/exit"}:
            break
        if command == "/admin-login":
            try:
                secret = getpass.getpass("Secret administrateur: ")
            except (EOFError, KeyboardInterrupt):
                print("\nConnexion annulée.")
                continue
            print("Administrateur authentifié." if authenticator.authenticate(secret) else "Authentification refusée.")
            continue
        if command == "/admin-logout":
            authenticator.logout()
            print("Session administrateur fermée.")
            continue
        if command == "/help":
            print("/files | /ls [dossier] | /read <fichier> | /remember <clé> <valeur> | /memory <clé> | /forget <clé> | /admin-login | /admin-logout | /confirm <permission> | /grant <permission> | /revoke <permission> | /quit")
            continue
        if command.startswith(("/confirm", "/grant", "/revoke")):
            print(admin.handle(command))
        elif command.startswith(("/remember", "/memory", "/forget")):
            print(memory.handle(command))
        else:
            print(files.handle(command))


if __name__ == "__main__":
    main()
