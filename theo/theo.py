"""Point d'entrée local de T.H.E.O. pour Termux/Android."""

import os
from pathlib import Path

from .commands import TheoCommands
from .file_manager import FileManager
from .memory_commands import MemoryCommands
from .memory_store import TheoMemory

DEFAULT_STORAGE = Path("~/storage/shared").expanduser()


def storage_root() -> Path:
    configured = os.environ.get("THEO_STORAGE_ROOT")
    return Path(configured).expanduser() if configured else DEFAULT_STORAGE


def build_services() -> tuple[TheoCommands, MemoryCommands]:
    root = storage_root()
    files = TheoCommands(FileManager(root))
    memory = MemoryCommands(TheoMemory(root / ".theo" / "memory.json"))
    return files, memory


def main() -> None:
    files, memory = build_services()
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
            print("/files | /ls [dossier] | /read <fichier> | /remember <clé> <valeur> | /memory <clé> | /forget <clé> | /quit")
            continue

        if command.startswith(("/remember", "/memory", "/forget")):
            print(memory.handle(command))
        else:
            print(files.handle(command))


if __name__ == "__main__":
    main()
