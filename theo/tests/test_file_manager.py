from pathlib import Path

import pytest

from theo.file_manager import FileManager


def test_list_files_stays_inside_root(tmp_path: Path):
    (tmp_path / "Documents").mkdir()
    (tmp_path / "Documents" / "note.txt").write_text("bonjour", encoding="utf-8")
    manager = FileManager(tmp_path)

    assert manager.list_files("Documents") == ["Documents/note.txt"]


def test_path_escape_is_rejected(tmp_path: Path):
    manager = FileManager(tmp_path)

    with pytest.raises(PermissionError):
        manager.read_text("../secret.txt")


def test_text_document_can_be_read(tmp_path: Path):
    (tmp_path / "note.txt").write_text("T.H.E.O.", encoding="utf-8")
    manager = FileManager(tmp_path)

    assert manager.read_text("note.txt") == "T.H.E.O."


def test_unsupported_file_type_is_rejected(tmp_path: Path):
    (tmp_path / "photo.jpg").write_bytes(b"fake")
    manager = FileManager(tmp_path)

    with pytest.raises(PermissionError):
        manager.read_text("photo.jpg")
