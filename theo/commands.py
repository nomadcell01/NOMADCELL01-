"""Commandes locales sûres de T.H.E.O."""

from .file_manager import FileManager


class TheoCommands:
    COMMANDS = {"/ls", "/files", "/read", "/write"}

    def __init__(self, files: FileManager):
        self.files = files

    def handle(self, command: str) -> str:
        if not isinstance(command, str):
            return "Commande invalide."

        parts = command.strip().split(maxsplit=1)
        name = parts[0] if parts else ""
        argument = parts[1].strip() if len(parts) > 1 else "."

        try:
            if name in {"/ls", "/files"}:
                return "\n".join(self.files.list_files(argument))
            if name == "/read":
                if len(parts) < 2 or not argument:
                    return "Usage: /read <fichier>"
                return self.files.read_text(argument)
            if name == "/write":
                if len(parts) < 2 or "|" not in argument:
                    return "Usage: /write <fichier> | <contenu>"
                relative, content = argument.split("|", 1)
                relative = relative.strip()
                if not relative:
                    return "Usage: /write <fichier> | <contenu>"
                return self.files.write_text(relative, content, overwrite=False)
        except (PermissionError, FileNotFoundError, FileExistsError, NotADirectoryError, TypeError, ValueError) as exc:
            return f"Accès refusé ou fichier invalide: {exc}"

        if name:
            return "Commande inconnue."
        return "Commande vide."
