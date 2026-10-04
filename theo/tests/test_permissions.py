from theo.permissions import PermissionGate


def test_read_permissions_are_allowed_by_default():
    gate = PermissionGate()
    assert gate.check("files.read") is True


def test_sensitive_permissions_require_explicit_grant():
    gate = PermissionGate()
    assert gate.check("phone.call") is False
    gate.grant("phone.call")
    assert gate.check("phone.call") is True
