from pathlib import Path

from theo.config import TheoConfig
from theo.core import Theo


def make_config(tmp_path: Path) -> TheoConfig:
    home = tmp_path / "theo"
    return TheoConfig(home, home / "data", home / "data" / "memory.json", (home,))


def test_memory_persists(tmp_path):
    cfg = make_config(tmp_path)
    first = Theo(cfg)
    first.handle("/remember NOMAD est notre projet principal")
    second = Theo(cfg)
    assert "NOMAD est notre projet principal" in second.memory.recent()


def test_unknown_input_does_not_execute_shell(tmp_path):
    theo = Theo(make_config(tmp_path))
    _, response = theo.handle("rm -rf /")
    assert "Message reçu" in response


def test_status(tmp_path):
    theo = Theo(make_config(tmp_path))
    _, response = theo.handle("/status")
    assert "T.H.E.O. actif" in response
