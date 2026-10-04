from pathlib import Path

from theo.commands import TheoCommands
from theo.file_manager import FileManager


def test_ls_lists_files(tmp_path: Path):
    (tmp_path / "Documents").mkdir()
    (tmp_path / "Documents" / "note.txt").write_text("bonjour", encoding="utf-8")
    commands = TheoCommands(FileManager(tmp_path))

    assert commands.handle("/ls Documents") == "Documents/note.txt"


def test_files_is_alias_for_ls(tmp_path: Path):
    (tmp_path / "note.txt").write_text("bonjour", encoding="utf-8")
    commands = TheoCommands(FileManager(tmp_path))

    assert commands.handle("/files") == "note.txt"


def test_read_returns_document_content(tmp_path: Path):
    (tmp_path / "note.txt").write_text("Bonjour T.H.E.O.", encoding="utf-8")
    commands = TheoCommands(FileManager(tmp_path))

    assert commands.handle("/read note.txt") == "Bonjour T.H.E.O."


def test_unknown_command_is_rejected(tmp_path: Path):
    commands = TheoCommands(FileManager(tmp_path))

    assert commands.handle("/delete note.txt") == "Commande inconnue."
