import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.api.security import get_current_user, get_current_user_optional
from app.entities.notification_installation import NotificationInstallation
from app.models.notification import (
    InstallationRegisterRequest,
    NotificationInstallationResponse,
    NotificationPreferenceResponse,
    NotificationTokenResponse,
    NotificationPreferenceUpdateRequest,
    PushTokenDeactivateRequest,
    PushTokenRegisterRequest,
)
from app.notifications.service import (
    InstallationRegistration,
    NotificationService,
    PreferenceUpdate,
    PushTokenRegistration,
)
from app.utils.response import error_response, success_response

router = APIRouter(prefix="/notifications", tags=["notifications"])
logger = logging.getLogger(__name__)


def _actor_identity(actor: dict | None) -> tuple[str, int] | None:
    if actor is None:
        return None

    role = actor.get("role")
    if role == "customer":
        actor_id = actor.get("user_id") or actor.get("sub")
    elif role == "vendor":
        actor_id = actor.get("vendor_id") or actor.get("sub")
    elif role == "admin":
        actor_id = actor.get("user_id") or actor.get("sub")
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=error_response(
                message="Notifications are not supported for this actor",
                code="forbidden",
            ),
        )

    return role, int(actor_id)


def _get_installation(db: Session, installation_id: str) -> NotificationInstallation | None:
    return (
        db.query(NotificationInstallation)
        .filter(NotificationInstallation.installation_id == installation_id)
        .first()
    )


def _ensure_installation_access(
    installation: NotificationInstallation,
    actor_identity: tuple[str, int] | None,
) -> None:
    if installation.actor_type is None or installation.actor_id is None:
        return

    if actor_identity is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=error_response(
                message="Authentication required for this installation",
                code="forbidden",
            ),
        )

    actor_type, actor_id = actor_identity
    if installation.actor_type != actor_type or int(installation.actor_id) != int(actor_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=error_response(
                message="Installation does not belong to the current actor",
                code="forbidden",
            ),
        )


def _serialize_installation(installation: NotificationInstallation) -> dict:
    return {
        "id": installation.id,
        "installation_id": installation.installation_id,
        "platform": installation.platform,
        "actor_type": installation.actor_type,
        "actor_id": installation.actor_id,
        "is_anonymous": bool(installation.is_anonymous),
        "notifications_enabled": bool(installation.notifications_enabled),
        "app_version": installation.app_version,
        "device_model": installation.device_model,
        "locale": installation.locale,
        "timezone": installation.timezone,
        "user_agent": installation.user_agent,
        "last_seen_at": installation.last_seen_at,
        "last_authenticated_at": installation.last_authenticated_at,
    }


def _serialize_token(token_row, installation_id: str) -> dict:
    return {
        "id": token_row.id,
        "installation_id": installation_id,
        "channel": token_row.channel,
        "provider": token_row.provider,
        "is_active": bool(token_row.is_active),
        "last_registered_at": token_row.last_registered_at,
        "last_success_at": token_row.last_success_at,
        "last_failure_at": token_row.last_failure_at,
        "invalidated_at": token_row.invalidated_at,
        "failure_reason": token_row.failure_reason,
    }


def _serialize_preferences(preference, installation_id: str) -> dict:
    return {
        "installation_id": installation_id,
        "push_enabled": bool(preference.push_enabled),
        "realtime_enabled": bool(preference.realtime_enabled),
        "transactional_enabled": bool(preference.transactional_enabled),
        "marketing_enabled": bool(preference.marketing_enabled),
        "system_enabled": bool(preference.system_enabled),
        "quiet_hours_start": preference.quiet_hours_start,
        "quiet_hours_end": preference.quiet_hours_end,
    }


@router.post("/installations/register", status_code=status.HTTP_200_OK, response_model=NotificationInstallationResponse)
def register_installation(
    payload: InstallationRegisterRequest,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    actor: Annotated[dict | None, Depends(get_current_user_optional)] = None,
):
    actor_identity = _actor_identity(actor)
    existing = _get_installation(db, payload.installation_id)

    if existing is not None:
        _ensure_installation_access(existing, actor_identity)

    actor_type: str | None = None
    actor_id: int | None = None
    if actor_identity is not None:
        actor_type, actor_id = actor_identity
    elif existing is not None:
        actor_type = existing.actor_type
        actor_id = existing.actor_id

    service = NotificationService(db)
    try:
        installation = service.register_installation(
            InstallationRegistration(
                installation_id=payload.installation_id,
                platform=payload.platform,
                actor_type=actor_type,
                actor_id=actor_id,
                app_version=payload.app_version,
                device_model=payload.device_model,
                locale=payload.locale,
                timezone=payload.timezone,
                user_agent=request.headers.get("user-agent"),
            )
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="Invalid installation payload", code="validation_error", details=str(exc)),
        ) from exc

    logger.info(
        "Notification installation registered installation_id=%s actor_type=%s actor_id=%s",
        installation.installation_id,
        installation.actor_type,
        installation.actor_id,
    )
    return success_response(message="Notification installation registered", data=[_serialize_installation(installation)])


@router.post("/installations/{installation_id}/bind", status_code=status.HTTP_200_OK, response_model=NotificationInstallationResponse)
def bind_installation(
    installation_id: str,
    db: Annotated[Session, Depends(get_db)],
    actor: Annotated[dict, Depends(get_current_user)],
):
    actor_type, actor_id = _actor_identity(actor) or (None, None)
    existing = _get_installation(db, installation_id)
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="Installation not found", code="installation_not_found"),
        )

    if existing.actor_type is not None and existing.actor_id is not None:
        _ensure_installation_access(existing, (actor_type, actor_id))

    service = NotificationService(db)
    installation = service.bind_installation_actor(installation_id, actor_type=actor_type, actor_id=actor_id)
    return success_response(message="Installation bound", data=[_serialize_installation(installation)])


@router.post("/installations/{installation_id}/unbind", status_code=status.HTTP_200_OK, response_model=NotificationInstallationResponse)
def unbind_installation(
    installation_id: str,
    db: Annotated[Session, Depends(get_db)],
    actor: Annotated[dict, Depends(get_current_user)],
):
    actor_identity = _actor_identity(actor)
    existing = _get_installation(db, installation_id)
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="Installation not found", code="installation_not_found"),
        )

    _ensure_installation_access(existing, actor_identity)

    service = NotificationService(db)
    installation = service.unbind_installation_actor(installation_id)
    return success_response(message="Installation unbound", data=[_serialize_installation(installation)])


@router.post("/push-tokens/register", status_code=status.HTTP_200_OK, response_model=NotificationTokenResponse)
def register_push_token(
    payload: PushTokenRegisterRequest,
    db: Annotated[Session, Depends(get_db)],
    actor: Annotated[dict | None, Depends(get_current_user_optional)] = None,
):
    actor_identity = _actor_identity(actor)
    installation = _get_installation(db, payload.installation_id)
    if installation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="Installation not found", code="installation_not_found"),
        )

    _ensure_installation_access(installation, actor_identity)

    service = NotificationService(db)
    try:
        token_row = service.register_push_token(
            PushTokenRegistration(
                installation_id=payload.installation_id,
                token=payload.token,
                provider=payload.provider,
                channel=payload.channel,
            )
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="Invalid push token payload", code="validation_error", details=str(exc)),
        ) from exc

    logger.info(
        "Notification token registered installation_id=%s provider=%s token_id=%s",
        payload.installation_id,
        token_row.provider,
        token_row.id,
    )
    return success_response(message="Push token registered", data=[_serialize_token(token_row, payload.installation_id)])


@router.post("/push-tokens/unregister", status_code=status.HTTP_200_OK)
def unregister_push_token(
    payload: PushTokenDeactivateRequest,
    db: Annotated[Session, Depends(get_db)],
    actor: Annotated[dict | None, Depends(get_current_user_optional)] = None,
):
    actor_identity = _actor_identity(actor)
    installation = _get_installation(db, payload.installation_id)
    if installation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="Installation not found", code="installation_not_found"),
        )

    _ensure_installation_access(installation, actor_identity)

    service = NotificationService(db)
    deactivated = service.deactivate_push_token(
        installation_id=payload.installation_id,
        token=payload.token,
        reason=payload.reason or "client_unregistered",
    )
    if not deactivated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="Push token not found", code="push_token_not_found"),
        )

    logger.info("Notification token unregistered installation_id=%s", payload.installation_id)
    return success_response(message="Push token unregistered", data=[])


@router.put("/preferences", status_code=status.HTTP_200_OK, response_model=NotificationPreferenceResponse)
def update_preferences(
    payload: NotificationPreferenceUpdateRequest,
    db: Annotated[Session, Depends(get_db)],
    actor: Annotated[dict | None, Depends(get_current_user_optional)] = None,
):
    actor_identity = _actor_identity(actor)
    installation = _get_installation(db, payload.installation_id)
    if installation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="Installation not found", code="installation_not_found"),
        )

    _ensure_installation_access(installation, actor_identity)

    service = NotificationService(db)
    try:
        preference = service.upsert_preferences(
            PreferenceUpdate(
                installation_id=payload.installation_id,
                push_enabled=payload.push_enabled,
                realtime_enabled=payload.realtime_enabled,
                transactional_enabled=payload.transactional_enabled,
                marketing_enabled=payload.marketing_enabled,
                system_enabled=payload.system_enabled,
                quiet_hours_start=payload.quiet_hours_start,
                quiet_hours_end=payload.quiet_hours_end,
            )
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="Invalid preference payload", code="validation_error", details=str(exc)),
        ) from exc

    return success_response(message="Notification preferences updated", data=[_serialize_preferences(preference, payload.installation_id)])
