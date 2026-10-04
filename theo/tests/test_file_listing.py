from pathlib import Path

from theo.files import SafeFiles


def test_list_entries_is_sorted_and_marks_directories(tmp_path):
    (tmp_path / "Z.txt").write_text("z", encoding="utf-8")
    (tmp_path / "A.md").write_text("a", encoding="utf-8")
    (tmp_path / "Documents").mkdir()

    files = SafeFiles((tmp_path,))
    assert files.list_entries(".") == ["A.md", "Documents/", "Z.txt"]


def test_list_entries_does_not_escape_root(tmp_path):
    files = SafeFiles((tmp_path,))
    try:
        files.list_entries("../")
    except PermissionError:
        return
    raise AssertionError("Le chemin hors racine aurait dû être refusé.")
