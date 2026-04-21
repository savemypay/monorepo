import argparse
import json
import sys
from pathlib import Path
from typing import Sequence

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.entities.notification_installation import NotificationInstallation
from app.entities.notification_preference import NotificationPreference
from app.entities.notification_token import NotificationToken
from app.notifications.providers.firebase import FirebasePushProvider
from app.db.session import SessionLocal


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Send a test FCM web push with fcm_options.link")
    parser.add_argument("--title", required=True, help="Notification title")
    parser.add_argument("--body", required=True, help="Notification body")
    parser.add_argument("--link", required=True, help="Browser notification click target URL")
    parser.add_argument("--category", default="system", help="Notification category")
    parser.add_argument("--image-url", default=None, help="Optional notification image URL")
    parser.add_argument(
        "--data",
        default="{}",
        help='Optional JSON object for message data, for example \'{"screen":"home"}\'',
    )
    parser.add_argument("--installation-id", help="Send to a specific installation id")
    parser.add_argument("--actor-type", choices=["customer", "vendor", "admin"], help="Send to an actor type")
    parser.add_argument("--actor-id", type=int, help="Send to a specific actor id")
    return parser


def validate_target(args: argparse.Namespace) -> None:
    by_installation = bool(args.installation_id)
    by_actor = bool(args.actor_type) or args.actor_id is not None

    if by_installation and by_actor:
        raise SystemExit("Use either --installation-id or --actor-type/--actor-id, not both")
    if not by_installation and not by_actor:
        raise SystemExit("Provide --installation-id or both --actor-type and --actor-id")
    if by_actor and (not args.actor_type or args.actor_id is None):
        raise SystemExit("Both --actor-type and --actor-id are required when targeting an actor")


def parse_data(raw_data: str) -> dict[str, str]:
    try:
        data = json.loads(raw_data)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid --data JSON: {exc}") from exc

    if not isinstance(data, dict):
        raise SystemExit("--data must decode to a JSON object")

    return {str(key): str(value) for key, value in data.items()}


def preference_allows(preference: NotificationPreference | None, *, category: str) -> bool:
    if preference is None:
        return True
    if not bool(preference.push_enabled):
        return False
    if category == "marketing" and not bool(preference.marketing_enabled):
        return False
    if category == "transactional" and not bool(preference.transactional_enabled):
        return False
    if category == "system" and not bool(preference.system_enabled):
        return False
    return True


def get_installation_rows(db, *, installation_id: str, category: str) -> list[tuple[NotificationToken, NotificationInstallation, NotificationPreference | None]]:
    installation = (
        db.query(NotificationInstallation)
        .filter(NotificationInstallation.installation_id == installation_id)
        .first()
    )
    if installation is None:
        raise SystemExit(f"Installation not found: {installation_id}")
    if installation.platform != "web":
        raise SystemExit(f"Installation is not a web installation: platform={installation.platform}")
    if not bool(installation.notifications_enabled):
        raise SystemExit("Notifications are disabled for this installation")

    rows = (
        db.query(NotificationToken, NotificationInstallation, NotificationPreference)
        .join(NotificationInstallation, NotificationInstallation.id == NotificationToken.installation_db_id)
        .outerjoin(NotificationPreference, NotificationPreference.installation_db_id == NotificationInstallation.id)
        .filter(
            NotificationInstallation.installation_id == installation_id,
            NotificationInstallation.platform == "web",
            NotificationToken.is_active.is_(True),
            NotificationToken.channel == "push",
        )
        .order_by(NotificationToken.id.desc())
        .all()
    )
    return [row for row in rows if preference_allows(row[2], category=category)]


def get_actor_rows(db, *, actor_type: str, actor_id: int, category: str) -> list[tuple[NotificationToken, NotificationInstallation, NotificationPreference | None]]:
    rows = (
        db.query(NotificationToken, NotificationInstallation, NotificationPreference)
        .join(NotificationInstallation, NotificationInstallation.id == NotificationToken.installation_db_id)
        .outerjoin(NotificationPreference, NotificationPreference.installation_db_id == NotificationInstallation.id)
        .filter(
            NotificationInstallation.actor_type == actor_type,
            NotificationInstallation.actor_id == actor_id,
            NotificationInstallation.platform == "web",
            NotificationInstallation.notifications_enabled.is_(True),
            NotificationToken.is_active.is_(True),
            NotificationToken.channel == "push",
        )
        .order_by(NotificationToken.id.desc())
        .all()
    )
    return [row for row in rows if preference_allows(row[2], category=category)]


def print_results(results: Sequence[dict]) -> None:
    if not results:
        print("No eligible web push tokens were found. Check installation binding, platform=web, push preferences, and active token registration.")
        return

    for result in results:
        print(json.dumps(result, default=str))


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    validate_target(args)
    data = parse_data(args.data)

    db = SessionLocal()
    try:
        if args.installation_id:
            rows = get_installation_rows(db, installation_id=args.installation_id, category=args.category)
        else:
            rows = get_actor_rows(db, actor_type=args.actor_type, actor_id=args.actor_id, category=args.category)

        provider = FirebasePushProvider()
        messaging = provider._messaging
        app = provider._app

        results: list[dict] = []
        for token_row, installation, _preference in rows:
            message = messaging.Message(
                token=token_row.token,
                notification=messaging.Notification(
                    title=args.title,
                    body=args.body,
                    image=args.image_url,
                ),
                data=data,
                webpush=messaging.WebpushConfig(
                    fcm_options=messaging.WebpushFCMOptions(link=args.link),
                ),
            )
            try:
                provider_message_id = messaging.send(message, app=app)
                results.append(
                    {
                        "installation_id": installation.installation_id,
                        "token_id": token_row.id,
                        "status": "sent",
                        "provider": "firebase",
                        "provider_message_id": provider_message_id,
                        "link": args.link,
                    }
                )
            except Exception as exc:
                results.append(
                    {
                        "installation_id": installation.installation_id,
                        "token_id": token_row.id,
                        "status": "failed",
                        "provider": "firebase",
                        "error_code": exc.__class__.__name__,
                        "error_message": str(exc),
                        "link": args.link,
                    }
                )

        print_results(results)
    finally:
        db.close()


if __name__ == "__main__":
    main()
