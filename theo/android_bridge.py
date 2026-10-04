"""Pont sécurisé entre T.H.E.O. et Android/Termux."""

from collections.abc import Callable
import json
import re
import shutil
import subprocess
from typing import Any


class AndroidBridge:
    SAFE_COMMANDS = {
        "battery": "termux-battery-status",
        "device": "termux-device-info",
        "telephony": "termux-telephony-deviceinfo",
        "location": "termux-location",
        "contacts": "termux-contact-list",
        "bluetooth": "termux-bluetooth-info",
        "wifi": "termux-wifi-connectioninfo",
        "wifi_scan": "termux-wifi-scaninfo",
        "calendar": "termux-calendar-list",
    }

    ACTUATOR_COMMANDS = {
        "notify": "termux-notification",
        "vibrate": "termux-vibrate",
        "speak": "termux-tts-speak",
        "clipboard_set": "termux-clipboard-set",
        "call": "termux-telephony-call",
        "sms": "termux-sms-send",
        "bluetooth_enable": "termux-bluetooth-enable",
        "bluetooth_disable": "termux-bluetooth-disable",
        "wifi_enable": "termux-wifi-enable",
        "wifi_disable": "termux-wifi-disable",
        "torch_on": "termux-torch",
        "torch_off": "termux-torch",
    }

    def __init__(self, runner: Callable[..., str] | None = None) -> None:
        self._runner = runner or self._run_termux

    @classmethod
    def _run_termux(cls, command: str = "battery", *args: str) -> str:
        executable = cls.SAFE_COMMANDS.get(command) or cls.ACTUATOR_COMMANDS.get(command)
        if executable is None:
            return "Commande refusée."
        try:
            result = subprocess.run(
                [executable, *args],
                capture_output=True,
                text=True,
                check=False,
                timeout=10,
            )
        except FileNotFoundError:
            return "Termux:API indisponible."
        except subprocess.TimeoutExpired:
            return "Commande Android expirée."

        output = result.stdout.strip() or result.stderr.strip()
        return output or "Commande Android exécutée."

    def run_safe(self, command: str) -> str:
        if command not in self.SAFE_COMMANDS:
            return "Commande refusée."
        return self._runner(command)

    def notify(self, title: str, content: str) -> str:
        if not isinstance(title, str) or not isinstance(content, str):
            return "Notification invalide."
        title = title.strip()[:120]
        content = content.strip()[:500]
        if not title or not content:
            return "Notification invalide."
        return self._runner("notify", "--title", title, "--content", content)

    def vibrate(self, duration_ms: int = 300) -> str:
        if not isinstance(duration_ms, int) or isinstance(duration_ms, bool):
            return "Durée vibration invalide."
        if duration_ms < 1 or duration_ms > 5000:
            return "Durée vibration invalide."
        return self._runner("vibrate", "-d", str(duration_ms))

    def speak(self, text: str) -> str:
        if not isinstance(text, str):
            return "Texte vocal invalide."
        text = text.strip()[:1000]
        if not text:
            return "Texte vocal invalide."
        return self._runner("speak", text)

    def clipboard_set(self, text: str) -> str:
        if not isinstance(text, str):
            return "Texte presse-papiers invalide."
        text = text.strip()[:10000]
        if not text:
            return "Texte presse-papiers invalide."
        return self._runner("clipboard_set", text)

    @staticmethod
    def _phone_number(value: str) -> str | None:
        if not isinstance(value, str):
            return None
        value = value.strip()
        if not re.fullmatch(r"[+0-9][0-9 .()-]{5,24}", value):
            return None
        return value

    def call(self, number: str) -> str:
        number = self._phone_number(number)
        if number is None:
            return "Numéro de téléphone invalide."
        return self._runner("call", number)

    def sms(self, number: str, message: str) -> str:
        number = self._phone_number(number)
        if number is None:
            return "Numéro de téléphone invalide."
        if not isinstance(message, str):
            return "Message SMS invalide."
        message = message.strip()[:2000]
        if not message:
            return "Message SMS invalide."
        return self._runner("sms", "--number", number, "--message", message)

    def _toggle(self, action: str, enabled: bool) -> str:
        if not isinstance(enabled, bool):
            return "État invalide."
        return self._runner(action if enabled else action.replace("_enable", "_disable"))

    def bluetooth_set(self, enabled: bool) -> str:
        return self._toggle("bluetooth_enable", enabled)

    def wifi_set(self, enabled: bool) -> str:
        return self._toggle("wifi_enable", enabled)

    def torch_set(self, enabled: bool) -> str:
        if not isinstance(enabled, bool):
            return "État lampe invalide."
        return self._runner("torch_on" if enabled else "torch_off", "-q")

    def _json_status(self, command: str, error_message: str) -> dict[str, Any]:
        raw = self.run_safe(command)
        if raw.startswith((
            "Termux:API indisponible.",
            "Commande Android expirée.",
            "Aucune réponse Android.",
            "Commande refusée.",
        )):
            return {"ok": False, "error": raw}

        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            return {"ok": False, "error": error_message}

        if not isinstance(data, dict) and command not in {"contacts", "wifi_scan", "calendar"}:
            return {"ok": False, "error": "Réponse Android inattendue."}
        if command == "contacts" and not isinstance(data, list):
            return {"ok": False, "error": "Réponse contacts inattendue."}
        if command in {"wifi_scan", "calendar"} and not isinstance(data, list):
            return {"ok": False, "error": "Réponse calendrier/Wi-Fi inattendue."}
        return {"ok": True, "data": data}

    def battery_status(self) -> dict[str, Any]:
        result = self._json_status("battery", "Réponse batterie invalide.")
        if not result.get("ok"):
            return result
        data = result["data"]
        normalized: dict[str, Any] = {"ok": True}
        for key in ("percentage", "plugged", "status", "health", "temperature", "current"):
            if key in data:
                normalized[key] = data[key]
        return normalized

    def device_info(self) -> dict[str, Any]:
        result = self._json_status("device", "Réponse appareil invalide.")
        if not result.get("ok"):
            return result
        return {"ok": True, "data": result["data"]}

    def telephony_info(self) -> dict[str, Any]:
        result = self._json_status("telephony", "Réponse téléphonie invalide.")
        if not result.get("ok"):
            return result
        return {"ok": True, "data": result["data"]}

    def location(self, provider: str = "network") -> dict[str, Any]:
        if provider not in {"network", "gps", "passive"}:
            return {"ok": False, "error": "Fournisseur de localisation invalide."}
        raw = self._runner("location", "-p", provider)
        if raw.startswith(("Termux:API indisponible.", "Commande Android expirée.", "Commande refusée.")):
            return {"ok": False, "error": raw}
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            return {"ok": False, "error": "Réponse localisation invalide."}
        if not isinstance(data, dict):
            return {"ok": False, "error": "Réponse localisation inattendue."}
        return {"ok": True, "data": data}

    def contacts(self) -> dict[str, Any]:
        result = self._json_status("contacts", "Réponse contacts invalide.")
        if not result.get("ok"):
            return result
        contacts = []
        for item in result["data"]:
            if not isinstance(item, dict):
                continue
            contact = {}
            for key in ("name", "number", "type"):
                if key in item:
                    contact[key] = item[key]
            if contact:
                contacts.append(contact)
        return {"ok": True, "data": contacts}

    def calendar(self) -> dict[str, Any]:
        result = self._json_status("calendar", "Réponse calendrier invalide.")
        if not result.get("ok"):
            return result
        events = []
        for item in result["data"]:
            if isinstance(item, dict):
                events.append(item)
        return {"ok": True, "data": events}

    def bluetooth_info(self) -> dict[str, Any]:
        result = self._json_status("bluetooth", "Réponse Bluetooth invalide.")
        if not result.get("ok"):
            return result
        return {"ok": True, "data": result["data"]}

    def wifi_info(self) -> dict[str, Any]:
        result = self._json_status("wifi", "Réponse Wi-Fi invalide.")
        if not result.get("ok"):
            return result
        return {"ok": True, "data": result["data"]}

    def wifi_scan(self) -> dict[str, Any]:
        result = self._json_status("wifi_scan", "Réponse scan Wi-Fi invalide.")
        if not result.get("ok"):
            return result
        networks = []
        for item in result["data"]:
            if not isinstance(item, dict):
                continue
            network = {}
            for key in ("ssid", "bssid", "frequency_mhz", "level", "capabilities"):
                if key in item:
                    network[key] = item[key]
            if network:
                networks.append(network)
        return {"ok": True, "data": networks}

    @staticmethod
    def storage_status(path: str) -> dict[str, Any]:
        try:
            total, used, free = shutil.disk_usage(path)
        except OSError:
            return {"ok": False, "error": "Stockage inaccessible."}
        return {
            "ok": True,
            "path": path,
            "total_bytes": total,
            "used_bytes": used,
            "free_bytes": free,
        }
