from pathlib import Path

from theo.config import TheoConfig
from theo.core import Theo


def test_read_command_reads_allowed_text(tmp_path):
    root = tmp_path / "shared"
    root.mkdir()
    (root / "note.txt").write_text("Bonjour NOMADCELL01", encoding="utf-8")

    config = TheoConfig(
        home=tmp_path / "theo",
        data_dir=tmp_path / "theo" / "data",
        memory_file=tmp_path / "theo" / "data" / "memory.json",
        allowed_roots=(root,),
    )
    theo = Theo(config)

    keep_running, response = theo.handle("/read note.txt")

    assert keep_running is True
    assert response == "Bonjour NOMADCELL01"


def test_read_command_rejects_unknown_path(tmp_path):
    root = tmp_path / "shared"
    root.mkdir()

    config = TheoConfig(
        home=tmp_path / "theo",
        data_dir=tmp_path / "theo" / "data",
        memory_file=tmp_path / "theo" / "data" / "memory.json",
        allowed_roots=(root,),
    )
    theo = Theo(config)

    keep_running, response = theo.handle("/read ../secret.txt")

    assert keep_running is True
    assert response.startswith("Accès refusé:")
