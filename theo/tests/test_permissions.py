from theo.permissions import PermissionGate


def test_read_permissions_are_allowed_by_default():
    gate = PermissionGate()
    assert gate.check("files.read") is True


def test_sensitive_permissions_require_explicit_grant_and_unlock():
    gate = PermissionGate()
    gate.grant("phone.call")

    assert gate.check("phone.call") is False

    gate.set_quiet_mode(False)
    gate.set_physical_unlock(True)
    gate.confirmation.confirm("phone.call")

    assert gate.check("phone.call") is True


def test_lock_all_revokes_sensitive_access_state():
    gate = PermissionGate()
    gate.grant("phone.call")
    gate.confirmation.confirm("phone.call")
    gate.set_quiet_mode(False)
    gate.set_physical_unlock(True)

    gate.lock_all()

    assert gate.quiet_mode() is True
    assert gate.physical_unlock() is False
    assert gate.check("phone.call") is False


def test_expired_auth_locks_sensitive_actions():
    state = {"authenticated": True}

    def auth_checker():
        return state["authenticated"]

    gate = PermissionGate(auth_checker=auth_checker)
    gate.grant("phone.call")
    gate.confirmation.confirm("phone.call")
    gate.set_quiet_mode(False)
    gate.set_physical_unlock(True)

    state["authenticated"] = False

    assert gate.check("phone.call") is False
    assert gate.quiet_mode() is True
    assert gate.physical_unlock() is False
