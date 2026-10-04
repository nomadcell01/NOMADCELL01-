from pathlib import Path

import pytest

from theo.security_log import SecurityLog


def test_security_log_records_and_reads_recent_entries(tmp_path: Path):
    log = SecurityLog(tmp_path / "security.log")

    log.record("admin_login", "admin1", "ok")
    log.record("safety_lock_startup")

    entries = log.recent()

    assert len(entries) == 2
    assert entries[0]["event"] == "admin_login"
    assert entries[0]["admin"] == "admin1"
    assert entries[1]["event"] == "safety_lock_startup"


def test_security_log_is_append_only(tmp_path: Path):
    log = SecurityLog(tmp_path / "security.log")

    with pytest.raises(PermissionError):
        log.clear()

    with pytest.raises(PermissionError):
        log.overwrite("blocked")
