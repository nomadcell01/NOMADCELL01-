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


def admin_secrets() -> dict[str, str]:
    result = {}
    for admin_id in ("admin1", "admin2"):
        secret = os.environ.get(f"THEO_{admin_id.upper()}_SECRET")
        if secret:
            result[admin_id] = secret
    if not result:
        raise RuntimeError("Configure THEO_ADMIN1_SECRET ou THEO_ADMIN2_SECRET avant de lancer T.H.E.O.")
    return result


def build_services():
    root = storage_root()
    authenticator = AdminAuthenticator(admin_secrets())
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
                print("\\nConnexion annulée.")
                continue
            if authenticator.authenticate(secret):
                print(f"Administrateur {authenticator.current_admin()} authentifié.")
            else:
                print("Authentification refusée.")
            continue
        if command == "/admin-logout":
            authenticator.logout()
            print("Session administrateur fermée.")
            continue
        if command == "/admin-status":
            current = authenticator.current_admin()
            print(f"Administrateur connecté: {current}." if current else "Aucun administrateur connecté.")
            continue
        if command == "/help":
            print("/files | /ls [dossier] | /read <fichier> | /remember <clé> <valeur> | /memory <clé> | /forget <clé> | /admin-login | /admin-logout | /admin-status | /confirm <permission> | /grant <permission> | /revoke <permission> | /quit")
            continue
        if command.startswith(("/confirm", "/grant", "/revoke")):
            print(admin.handle(command))
        elif command.startswith(("/remember", "/memory", "/forget")):
            print(memory.handle(command))
        else:
            print(files.handle(command))


if __name__ == "__main__":
    main()
