from __future__ import annotations

from .android import AndroidBridge
from .config import TheoConfig
from .files import SafeFiles
from .memory import MemoryStore


class Theo:
    def __init__(self, config: TheoConfig | None = None) -> None:
        self.config = config or TheoConfig.default()
        self.config.ensure()
        self.memory = MemoryStore(self.config.memory_file)
        self.memory.load()
        self.files = SafeFiles(self.config.allowed_roots)
        self.android = AndroidBridge()

    def handle(self, text: str) -> tuple[bool, str]:
        command = text.strip()
        if not command:
            return True, ""
        if command == "/help":
            return True, "Commandes: /help /status /memory /remember <texte> /ls <dossier> /files <dossier> /read <fichier> /battery /notify <titre> | <message> /clipboard /quit"
        if command == "/status":
            return True, f"T.H.E.O. actif — mémoire: {len(self.memory.recent(100000))} entrée(s) — stockage: {self.config.shared_storage}"
        if command == "/memory":
            items = self.memory.recent()
            return True, "\n".join(f"- {x}" for x in items) if items else "Mémoire vide."
        if command.startswith("/remember "):
            value = command[10:].strip()
            self.memory.remember(value)
            return True, "Mémoire enregistrée."
        if command.startswith("/ls "):
            try:
                return True, "\n".join(self.files.list_entries(command[4:].strip())) or "Dossier vide."
            except (PermissionError, FileNotFoundError, NotADirectoryError) as exc:
                return True, f"Accès refusé: {exc}"
        if command.startswith("/files "):
            try:
                return True, "\n".join(self.files.list_text(command[7:].strip())) or "Aucun fichier texte trouvé."
            except (PermissionError, FileNotFoundError, NotADirectoryError) as exc:
                return True, f"Accès refusé: {exc}"
        if command.startswith("/read "):
            try:
                return True, self.files.read_text(command[6:].strip())
            except (PermissionError, FileNotFoundError, NotADirectoryError) as exc:
                return True, f"Accès refusé: {exc}"
        if command == "/battery":
            ok, output = self.android.battery()
            return True, output if ok else output
        if command.startswith("/notify "):
            payload = command[8:]
            title, sep, message = payload.partition("|")
            if not sep or not title.strip() or not message.strip():
                return True, "Format: /notify titre | message"
            ok, output = self.android.notify(title.strip(), message.strip())
            return True, output if ok else output
        if command == "/clipboard":
            ok, output = self.android.clipboard_get()
            return True, output if ok else output
        if command == "/quit":
            return False, "Arrêt de T.H.E.O."
        return True, f"Je t'écoute. Pour une commande téléphone, utilise /help. Message reçu: {command}"
