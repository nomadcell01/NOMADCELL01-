"""Point d'entrée local de T.H.E.O. pour Termux/Android."""

import os
from pathlib import Path

from .commands import TheoCommands
from .file_manager import FileManager

DEFAULT_STORAGE = Path("~/storage/shared").expanduser()


def storage_root() -> Path:
    configured = os.environ.get("THEO_STORAGE_ROOT")
    return Path(configured).expanduser() if configured else DEFAULT_STORAGE


def build_commands() -> TheoCommands:
    return TheoCommands(FileManager(storage_root()))


def main() -> None:
    commands = build_commands()
    print("T.H.E.O. Avel — NOMADCELL01")
    print("Tape /help ou /files. /quit pour quitter.")
    while True:
        try:
            command = input("T.H.E.O.> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break

        if command in {"/quit", "/exit"}:
            break
        if command == "/help":
            print("/files | /ls [dossier] | /read <fichier> | /quit")
            continue
        print(commands.handle(command))


if __name__ == "__main__":
    main()
