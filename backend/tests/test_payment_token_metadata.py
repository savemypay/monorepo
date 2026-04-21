from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from uuid import uuid4

from jose import jwt

from app.core.config import JWT_ALGORITHM, JWT_SECRET_KEY, PAYMENT_CURRENCY, PAYMENT_PROVIDER
from app.entities.ad import Ad
from app.entities.payment import Payment
from app.entities.token_payment_metadata import TokenPaymentMetadata
from app.payments.base import PaymentStatus


def _auth_headers(user_id: int) -> dict[str, str]:
    payload = {
        "sub": str(user_id),
        "user_id": str(user_id),
        "role": "customer",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
    }
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return {"Authorization": f"Bearer {token}"}


def _create_ad(db_session) -> Ad:
    ad = Ad(
        vendor_id=500,
        title="Token Deal",
        product_name="Product",
        original_price=100.0,
        token_amount=10.0,
        total_qty=10,
        slots_remaining=10,
        status="active",
        category="Auto",
        images=[],
    )
    db_session.add(ad)
    db_session.commit()
    db_session.refresh(ad)
    return ad


def test_token_pay_creates_metadata_record(client, test_db):
    ad = _create_ad(test_db)
    headers = _auth_headers(101)
    headers["Idempotency-Key"] = str(uuid4())
    payload = {"metadata": {"source": "app", "nested": {"campaign": "april"}}}

    res = client.post(f"/api/v1/payments/token-pay/{ad.id}", json=payload, headers=headers)

    assert res.status_code == HTTPStatus.OK
    body = res.json()
    assert body["success"] is True

    row = (
        test_db.query(TokenPaymentMetadata)
        .filter(
            TokenPaymentMetadata.ad_id == ad.id,
            TokenPaymentMetadata.customer_id == 101,
            TokenPaymentMetadata.vendor_id == ad.vendor_id,
        )
        .first()
    )
    assert row is not None
    assert row.metadata_json == payload["metadata"]


def test_token_pay_duplicate_after_success_does_not_replace_metadata(client, test_db):
    ad = _create_ad(test_db)
    headers = _auth_headers(202)
    first_payload = {"metadata": {"attempt": 1, "source": "first"}}
    second_payload = {"metadata": {"attempt": 2, "source": "second"}}

    first_headers = dict(headers)
    first_headers["Idempotency-Key"] = str(uuid4())
    first_res = client.post(f"/api/v1/payments/token-pay/{ad.id}", json=first_payload, headers=first_headers)
    assert first_res.status_code == HTTPStatus.OK

    second_headers = dict(headers)
    second_headers["Idempotency-Key"] = str(uuid4())
    second_res = client.post(f"/api/v1/payments/token-pay/{ad.id}", json=second_payload, headers=second_headers)
    assert second_res.status_code == HTTPStatus.CONFLICT
    assert second_res.json()["error"]["code"] == "payment_already_done"

    row = (
        test_db.query(TokenPaymentMetadata)
        .filter(
            TokenPaymentMetadata.ad_id == ad.id,
            TokenPaymentMetadata.customer_id == 202,
            TokenPaymentMetadata.vendor_id == ad.vendor_id,
        )
        .first()
    )
    assert row is not None
    assert row.metadata_json == first_payload["metadata"]


def test_token_pay_duplicate_after_failure_replaces_metadata(client, test_db):
    ad = _create_ad(test_db)
    customer_id = 303
    customer_ref = str(customer_id)

    existing_meta = TokenPaymentMetadata(
        ad_id=ad.id,
        customer_id=customer_id,
        vendor_id=ad.vendor_id,
        metadata_json={"source": "old"},
    )
    failed_payment = Payment(
        provider=PAYMENT_PROVIDER,
        provider_order_id=f"order_{uuid4().hex}",
        status=PaymentStatus.FAILED,
        amount=1000,
        currency=PAYMENT_CURRENCY,
        idempotency_key=f"old-{uuid4().hex}",
        customer_ref=customer_ref,
        deal_ref=str(ad.id),
        slot_reserved=False,
    )
    test_db.add(existing_meta)
    test_db.add(failed_payment)
    test_db.commit()

    headers = _auth_headers(customer_id)
    headers["Idempotency-Key"] = str(uuid4())
    new_payload = {"metadata": {"source": "new", "retry": True}}

    res = client.post(f"/api/v1/payments/token-pay/{ad.id}", json=new_payload, headers=headers)

    assert res.status_code == HTTPStatus.OK
    row = (
        test_db.query(TokenPaymentMetadata)
        .filter(
            TokenPaymentMetadata.ad_id == ad.id,
            TokenPaymentMetadata.customer_id == customer_id,
            TokenPaymentMetadata.vendor_id == ad.vendor_id,
        )
        .first()
    )
    assert row is not None
    assert row.metadata_json == new_payload["metadata"]
