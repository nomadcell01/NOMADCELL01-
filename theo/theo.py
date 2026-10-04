"""Point d'entrée local de T.H.E.O. pour Termux/Android."""

import os
from pathlib import Path

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


def build_services() -> tuple[TheoCommands, MemoryCommands, AdminCommands]:
    root = storage_root()
    permissions = PermissionGate()
    files = TheoCommands(FileManager(root))
    memory = MemoryCommands(MemoryGuard(TheoMemory(root / ".theo" / "memory.json"), permissions))
    admin = AdminCommands(permissions)
    return files, memory, admin


def main() -> None:
    files, memory, admin = build_services()
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

        if command == "/help":
            print("/files | /ls [dossier] | /read <fichier> | /remember <clé> <valeur> | /memory <clé> | /forget <clé> | /confirm <permission> | /grant <permission> | /revoke <permission> | /quit")
            continue

        if command.startswith(("/confirm", "/grant", "/revoke")):
            print(admin.handle(command))
        elif command.startswith(("/remember", "/memory", "/forget")):
            print(memory.handle(command))
        else:
            print(files.handle(command))


if __name__ == "__main__":
    main()
