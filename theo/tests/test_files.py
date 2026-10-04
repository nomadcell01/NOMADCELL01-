from pathlib import Path

import pytest

from theo.files import SafeFiles


def test_resolve_stays_inside_allowed_root(tmp_path):
    files = SafeFiles((tmp_path,))
    assert files.resolve("notes.txt") == tmp_path / "notes.txt"


def test_path_traversal_is_rejected(tmp_path):
    files = SafeFiles((tmp_path,))
    with pytest.raises(PermissionError):
        files.resolve("../secret.txt")


def test_read_text_file(tmp_path):
    target = tmp_path / "note.txt"
    target.write_text("bonjour T.H.E.O.", encoding="utf-8")
    files = SafeFiles((tmp_path,))
    assert files.read_text("note.txt") == "bonjour T.H.E.O."


def test_read_binary_extension_is_rejected(tmp_path):
    target = tmp_path / "image.jpg"
    target.write_bytes(b"not text")
    files = SafeFiles((tmp_path,))
    with pytest.raises(PermissionError):
        files.read_text("image.jpg")
