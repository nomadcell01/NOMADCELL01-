from theo.android_bridge import AndroidBridge


def test_safe_command_is_available_without_android_binary():
    bridge = AndroidBridge(runner=lambda *args: "ok")
    assert bridge.run_safe("battery") == "ok"


def test_unknown_command_is_rejected():
    bridge = AndroidBridge(runner=lambda *args: "should-not-run")
    assert bridge.run_safe("format_phone") == "Commande refusée."
