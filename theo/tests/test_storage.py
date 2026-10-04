from pathlib import Path

from theo.config import TheoConfig
from theo.core import Theo


def test_status_mentions_shared_storage(tmp_path):
    shared = tmp_path / "shared"
    shared.mkdir()
    config = TheoConfig(
        home=tmp_path / "theo",
        data_dir=tmp_path / "theo" / "data",
        memory_file=tmp_path / "theo" / "data" / "memory.json",
        allowed_roots=(tmp_path,),
        shared_storage=shared,
    )
    theo = Theo(config)
    keep_running, response = theo.handle("/status")
    assert keep_running is True
    assert "stockage" in response.lower()
