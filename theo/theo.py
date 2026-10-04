"""Point d'entrée local de T.H.E.O. pour Termux/Android."""

import getpass
import os
from pathlib import Path

from .admin_auth import AdminAuthenticator
from .admin_commands import AdminCommands
from .android_bridge import AndroidBridge
from .commands import TheoCommands
from .file_manager import FileManager
from .memory_commands import MemoryCommands
from .memory_guard import MemoryGuard
from .memory_store import TheoMemory
from .permissions import PermissionGate
from .security_log import SecurityLog

DEFAULT_STORAGE = Path("~/storage/shared").expanduser()


def storage_root() -> Path:
    configured = os.environ.get("THEO_STORAGE_ROOT")
    return Path(configured).expanduser() if configured else DEFAULT_STORAGE


def admin_secrets() -> dict[str, str]:
    result = {}
    for admin_id in ("admin1", "admin2"):
        secret = os.environ.get(f"THEO_{admin_id.upper()}_SECRET")
        if secret:
            result[admin_id] = secret
    if not result:
        raise RuntimeError("Configure THEO_ADMIN1_SECRET ou THEO_ADMIN2_SECRET avant de lancer T.H.E.O.")
    return result


def build_services():
    root = storage_root()
    security_log = SecurityLog(root / ".theo" / "security.log")
    authenticator = AdminAuthenticator(admin_secrets())
    permissions = PermissionGate(auth_checker=authenticator.is_authenticated)
    permissions.lock_all()
    security_log.record("safety_lock_startup")
    files = TheoCommands(FileManager(root))
    memory = MemoryCommands(
        MemoryGuard(
            TheoMemory(root / ".theo" / "memory.json"),
            permissions,
            security_log,
        )
    )
    admin = AdminCommands(permissions, authenticator=authenticator, security_log=security_log)
    android = AndroidBridge()
    return files, memory, admin, authenticator, security_log, permissions, android


def main() -> None:
    files, memory, admin, authenticator, security_log, permissions, android = build_services()
    print("T.H.E.O. Avel — NOMADCELL01")
    print("Tape /help. /quit pour quitter.")

    while True:
        try:
            command = input("T.H.E.O.> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            security_log.record("session_closed", authenticator.current_admin())
            break

        if command in {"/quit", "/exit"}:
            security_log.record("session_closed", authenticator.current_admin())
            break
        if command == "/admin-login":
            try:
                secret = getpass.getpass("Secret administrateur: ")
            except (EOFError, KeyboardInterrupt):
                print("\nConnexion annulée.")
                continue
            if authenticator.authenticate(secret):
                admin_id = authenticator.current_admin()
                security_log.record("admin_login", admin_id)
                print(f"Administrateur {admin_id} authentifié.")
            else:
                security_log.record("admin_login_failed")
                print("Authentification refusée.")
            continue
        if command == "/admin-logout":
            admin_id = authenticator.current_admin()
            authenticator.logout()
            permissions.lock_all()
            security_log.record("admin_logout", admin_id)
            security_log.record("safety_lock_logout")
            print("Session administrateur fermée. Actions sensibles verrouillées.")
            continue
        if command == "/admin-status":
            current = authenticator.current_admin()
            print(f"Administrateur connecté: {current}." if current else "Aucun administrateur connecté.")
            continue
        if command == "/security-log":
            for entry in security_log.recent():
                print(entry)
            continue
        if command == "/battery":
            if not permissions.check("battery.read"):
                print("Lecture batterie refusée.")
            else:
                print(android.battery_status())
            continue
        if command == "/device":
            print(android.device_info())
            continue
        if command == "/telephony":
            print(android.telephony_info())
            continue
        if command == "/location":
            print(android.location())
            continue
        if command.startswith("/location "):
            provider = command.split(" ", 1)[1].strip()
            print(android.location(provider))
            continue
        if command == "/storage":
            print(android.storage_status(str(storage_root())))
            continue
        if command.startswith("/notify "):
            if not permissions.check("actuator.write"):
                print("Actionneur verrouillé: authentification, confirmation et déverrouillage requis.")
                continue
            _, payload = command.split(" ", 1)
            if "|" not in payload:
                print("Usage: /notify <titre> | <message>")
            else:
                title, content = payload.split("|", 1)
                print(android.notify(title, content))
            continue
        if command == "/vibrate":
            if not permissions.check("actuator.write"):
                print("Actionneur verrouillé: authentification, confirmation et déverrouillage requis.")
            else:
                print(android.vibrate())
            continue
        if command.startswith("/vibrate "):
            if not permissions.check("actuator.write"):
                print("Actionneur verrouillé: authentification, confirmation et déverrouillage requis.")
                continue
            try:
                duration = int(command.split(maxsplit=1)[1])
                print(android.vibrate(duration))
            except ValueError:
                print("Usage: /vibrate [durée_ms]")
            continue
        if command.startswith("/speak "):
            if not permissions.check("actuator.write"):
                print("Actionneur verrouillé: authentification, confirmation et déverrouillage requis.")
                continue
            print(android.speak(command.split(" ", 1)[1]))
            continue
        if command.startswith("/clipboard "):
            if not permissions.check("actuator.write"):
                print("Presse-papiers verrouillé: authentification, confirmation et déverrouillage requis.")
                continue
            print(android.clipboard_set(command.split(" ", 1)[1]))
            continue
        if command.startswith("/call "):
            if not permissions.check("phone.call"):
                print("Appel verrouillé: authentification, confirmation et déverrouillage requis.")
                continue
            print(android.call(command.split(" ", 1)[1]))
            continue
        if command.startswith("/sms "):
            if not permissions.check("phone.sms"):
                print("SMS verrouillé: authentification, confirmation et déverrouillage requis.")
                continue
            payload = command.split(" ", 1)[1]
            if "|" not in payload:
                print("Usage: /sms <numéro> | <message>")
            else:
                number, message = payload.split("|", 1)
                print(android.sms(number, message))
            continue
        if command.startswith("/write "):
            if not permissions.check("files.write"):
                print("Écriture verrouillée: authentification, confirmation et déverrouillage requis.")
                continue
            print(files.handle(command))
            continue
        if command == "/help":
            print("/battery | /device | /telephony | /location [network|gps|passive] | /storage | /notify <titre> | <message> | /vibrate [durée_ms] | /speak <texte> | /clipboard <texte> | /call <numéro> | /sms <numéro> | <message> | /write <fichier> | <contenu> | /files | /ls [dossier] | /read <fichier> | /remember <clé> <valeur> | /memory <clé> | /memory-keys | /forget <clé> | /admin-login | /admin-logout | /admin-status | /security-log | /quiet-on | /quiet-off | /physical-unlock | /physical-lock | /safety-status | /confirm <permission> | /grant <permission> | /revoke <permission> | /quit")
            continue
        if command.startswith(("/confirm", "/grant", "/revoke", "/quiet-", "/physical-", "/safety-status")):
            print(admin.handle(command))
        elif command.startswith(("/remember", "/memory", "/memory-keys", "/forget")):
            print(memory.handle(command))
        else:
            print(files.handle(command))


if __name__ == "__main__":
    main()
