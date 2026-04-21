import argparse
import json
import sys
from typing import Sequence
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.db.session import SessionLocal
from app.notifications.base import NotificationMessage
from app.notifications.service import NotificationService


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Send a test Firebase push notification")
    parser.add_argument("--title", required=True, help="Notification title")
    parser.add_argument("--body", required=True, help="Notification body")
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


def parse_message(args: argparse.Namespace) -> NotificationMessage:
    try:
        data = json.loads(args.data)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid --data JSON: {exc}") from exc

    if not isinstance(data, dict):
        raise SystemExit("--data must decode to a JSON object")

    normalized_data = {str(key): str(value) for key, value in data.items()}
    return NotificationMessage(
        title=args.title,
        body=args.body,
        data=normalized_data,
        image_url=args.image_url,
    )


def validate_target(args: argparse.Namespace) -> None:
    by_installation = bool(args.installation_id)
    by_actor = bool(args.actor_type) or args.actor_id is not None

    if by_installation and by_actor:
        raise SystemExit("Use either --installation-id or --actor-type/--actor-id, not both")
    if not by_installation and not by_actor:
        raise SystemExit("Provide --installation-id or both --actor-type and --actor-id")
    if by_actor and (not args.actor_type or args.actor_id is None):
        raise SystemExit("Both --actor-type and --actor-id are required when targeting an actor")


def print_results(deliveries: Sequence) -> None:
    if not deliveries:
        print("No deliveries were created. Check that notifications are enabled and a push token is registered.")
        return

    for delivery in deliveries:
        print(
            json.dumps(
                {
                    "delivery_id": delivery.id,
                    "status": delivery.status,
                    "provider": delivery.provider,
                    "channel": delivery.channel,
                    "provider_message_id": delivery.provider_message_id,
                    "error_code": delivery.error_code,
                    "error_message": delivery.error_message,
                    "sent_at": delivery.sent_at.isoformat() if delivery.sent_at else None,
                    "failed_at": delivery.failed_at.isoformat() if delivery.failed_at else None,
                },
                default=str,
            )
        )


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    validate_target(args)
    message = parse_message(args)

    db = SessionLocal()
    try:
        service = NotificationService(db)
        if args.installation_id:
            deliveries = service.send_push_to_installation(
                installation_id=args.installation_id,
                message=message,
                category=args.category,
            )
        else:
            deliveries = service.send_push_to_actor(
                actor_type=args.actor_type,
                actor_id=args.actor_id,
                message=message,
                category=args.category,
            )
        print_results(deliveries)
    finally:
        db.close()


if __name__ == "__main__":
    main()
