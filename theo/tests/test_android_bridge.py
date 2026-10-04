from theo.android_bridge import AndroidBridge


def test_safe_command_is_available_without_android_binary():
    bridge = AndroidBridge(runner=lambda *args: "ok")
    assert bridge.run_safe("battery") == "ok"


def test_unknown_command_is_rejected():
    bridge = AndroidBridge(runner=lambda *args: "should-not-run")
    assert bridge.run_safe("format_phone") == "Commande refusée."


def test_battery_status_normalizes_known_fields():
    raw = '{"percentage": 82, "plugged": "USB", "status": "CHARGING", "secret": "hidden"}'
    bridge = AndroidBridge(runner=lambda *args: raw)

    assert bridge.battery_status() == {
        "ok": True,
        "percentage": 82,
        "plugged": "USB",
        "status": "CHARGING",
    }


def test_battery_status_rejects_invalid_json():
    bridge = AndroidBridge(runner=lambda *args: "not-json")

    assert bridge.battery_status() == {
        "ok": False,
        "error": "Réponse batterie invalide.",
    }


def test_storage_status_reports_usage():
    bridge = AndroidBridge()
    result = bridge.storage_status(".")

    assert result["ok"] is True
    assert result["total_bytes"] > 0
    assert result["free_bytes"] >= 0
