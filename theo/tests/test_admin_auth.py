from theo.admin_auth import AdminAuthenticator


def test_admin_starts_logged_out():
    auth = AdminAuthenticator("secret")
    assert auth.is_authenticated() is False


def test_correct_secret_authenticates():
    auth = AdminAuthenticator("secret")
    assert auth.authenticate("secret") is True
    assert auth.is_authenticated() is True


def test_wrong_secret_is_rejected():
    auth = AdminAuthenticator("secret")
    assert auth.authenticate("wrong") is False
    assert auth.is_authenticated() is False


def test_logout_removes_admin_session():
    auth = AdminAuthenticator("secret")
    auth.authenticate("secret")
    auth.logout()
    assert auth.is_authenticated() is False
