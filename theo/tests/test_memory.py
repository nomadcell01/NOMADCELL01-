from pathlib import Path

import pytest

from theo.memory_store import TheoMemory


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


def test_memory_rejects_empty_key(tmp_path: Path):
    memory = TheoMemory(tmp_path / "memory.json")

    with pytest.raises(ValueError):
        memory.set("   ", "value")


def test_memory_rejects_oversized_value(tmp_path: Path):
    memory = TheoMemory(tmp_path / "memory.json")

    with pytest.raises(ValueError):
        memory.set("note", "x" * (TheoMemory.MAX_VALUE_LENGTH + 1))
