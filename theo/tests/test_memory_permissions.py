from pathlib import Path

from theo.memory_guard import MemoryGuard
from theo.memory_store import TheoMemory
from theo.permissions import PermissionGate


def test_normal_memory_is_allowed(tmp_path: Path):
    memory = TheoMemory(tmp_path / "memory.json")
    guard = MemoryGuard(memory, PermissionGate())

    assert guard.remember("project", "NOMADCELL01") == "Mémoire enregistrée."
    assert memory.get("project") == "NOMADCELL01"


def test_sensitive_memory_requires_permission(tmp_path: Path):
    memory = TheoMemory(tmp_path / "memory.json")
    permissions = PermissionGate()
    guard = MemoryGuard(memory, permissions)

    assert guard.remember("private.note", "secret") == "Autorisation mémoire sensible requise."
    permissions.grant("memory.sensitive.write")
    assert guard.remember("private.note", "secret") == "Mémoire enregistrée."
