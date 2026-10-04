from pathlib import Path

from theo.memory import TheoMemory


def test_memory_starts_empty(tmp_path: Path):
    memory = TheoMemory(tmp_path / "memory.json")
    assert memory.get("project") is None


def test_memory_survives_reload(tmp_path: Path):
    path = tmp_path / "memory.json"
    TheoMemory(path).set("project", "NOMADCELL01")

    reloaded = TheoMemory(path)
    assert reloaded.get("project") == "NOMADCELL01"


def test_memory_can_forget(tmp_path: Path):
    path = tmp_path / "memory.json"
    memory = TheoMemory(path)
    memory.set("temporary", "test")
    memory.forget("temporary")

    assert memory.get("temporary") is None
