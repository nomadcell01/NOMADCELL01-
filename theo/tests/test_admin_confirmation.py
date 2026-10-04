from theo.admin_confirmation import AdminConfirmation


def test_sensitive_permission_requires_explicit_confirmation():
    confirmation = AdminConfirmation()
    assert confirmation.is_confirmed("files.write") is False
    confirmation.confirm("files.write")
    assert confirmation.is_confirmed("files.write") is True


def test_confirmation_can_be_revoked():
    confirmation = AdminConfirmation()
    confirmation.confirm("files.write")
    confirmation.revoke("files.write")
    assert confirmation.is_confirmed("files.write") is False
