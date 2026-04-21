from datetime import datetime, timedelta, timezone
from http import HTTPStatus

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from app.api.dependencies import get_db
from app.api.security import get_current_user
from app.entities.notification_delivery import NotificationDelivery
from main import app


@pytest.fixture(scope="function")
def notifications_client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
    NotificationDelivery.__table__.create(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as client:
            yield client, TestingSessionLocal
    finally:
        app.dependency_overrides.clear()
        NotificationDelivery.__table__.drop(bind=engine)
        engine.dispose()


def _seed_delivery(
    db,
    *,
    actor_type: str,
    actor_id: int,
    channel: str,
    title: str,
    created_at: datetime,
    data_json: str = "{}",
):
    row = NotificationDelivery(
        actor_type=actor_type,
        actor_id=actor_id,
        channel=channel,
        provider="internal",
        category="system",
        title=title,
        body=f"{title} body",
        data_json=data_json,
        status="sent",
        sent_at=created_at,
        delivered_at=created_at,
        created_at=created_at,
        updated_at=created_at,
        created_by="test",
        updated_by="test",
    )
    db.add(row)
    db.flush()
    return row


def test_notifications_me_lists_only_authenticated_actor_notifications(notifications_client):
    client, SessionLocal = notifications_client
    app.dependency_overrides[get_current_user] = lambda: {"role": "customer", "user_id": "11", "sub": "11"}

    now = datetime.now(timezone.utc)
    older = now - timedelta(minutes=1)
    db = SessionLocal()
    latest = _seed_delivery(
        db,
        actor_type="customer",
        actor_id=11,
        channel="inbox",
        title="latest",
        created_at=now,
        data_json='{"type":"login"}',
    )
    _seed_delivery(
        db,
        actor_type="customer",
        actor_id=11,
        channel="inbox",
        title="older",
        created_at=older,
    )
    _seed_delivery(
        db,
        actor_type="customer",
        actor_id=11,
        channel="push",
        title="push-row",
        created_at=now,
    )
    _seed_delivery(
        db,
        actor_type="customer",
        actor_id=12,
        channel="inbox",
        title="other-user",
        created_at=now,
    )
    db.commit()
    db.close()

    res = client.get("/api/v1/notifications/me")
    assert res.status_code == HTTPStatus.OK

    body = res.json()
    assert body["success"] is True
    assert len(body["data"]) == 2
    assert body["data"][0]["id"] == latest.id
    assert body["data"][0]["title"] == "latest"
    assert body["data"][0]["data"] == {"type": "login"}

def test_notifications_me_rejects_unsupported_actor_role(notifications_client):
    client, _ = notifications_client
    app.dependency_overrides[get_current_user] = lambda: {"role": "game_user", "sub": "1"}
    res = client.get("/api/v1/notifications/me")
    assert res.status_code == HTTPStatus.FORBIDDEN

    body = res.json()
    assert body["success"] is False
    assert body["error"]["code"] == "forbidden"
