"""Commandes locales sûres de T.H.E.O."""

from .file_manager import FileManager


class TheoCommands:
    def __init__(self, files: FileManager):
        self.files = files

    def handle(self, command: str) -> str:
        parts = command.strip().split(maxsplit=1)
        name = parts[0] if parts else ""
        argument = parts[1] if len(parts) > 1 else "."

        try:
            if name in {"/ls", "/files"}:
                return "\n".join(self.files.list_files(argument))
            if name == "/read":
                if len(parts) < 2:
                    return "Usage: /read <fichier>"
                return self.files.read_text(parts[1])
        except (PermissionError, FileNotFoundError, NotADirectoryError) as exc:
            return f"Accès refusé ou fichier introuvable: {exc}"

        return "Commande inconnue."
