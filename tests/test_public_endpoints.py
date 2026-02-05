from http import HTTPStatus
from sqlalchemy.orm import Session


def test_capture_interest_success(client):
    payload = {"name": "Alice", "email": "alice@example.com", "phone_number": "12345"}
    res = client.post("/api/v1/interest", json=payload)
    assert res.status_code == HTTPStatus.CREATED
    body = res.json()
    assert body["success"] is True
    assert body["data"]["email"] == payload["email"]
    assert body["data"]["id"] > 0
    assert body["data"]["name"] == payload["name"]


def test_capture_interest_missing_email_validation_error(client):
    payload = {"phone_number": "12345"}
    res = client.post("/api/v1/interest", json=payload)
    assert res.status_code == HTTPStatus.UNPROCESSABLE_ENTITY


def test_list_categories(client, test_db: Session):
    create_category(test_db, "Auto")
    create_category(test_db, "Insurance")
    res = client.get("/api/v1/categories")
    assert res.status_code == HTTPStatus.OK
    body = res.json()
    assert body["success"] is True
    names = [c["name"] for c in body["data"]]
    assert "Auto" in names
    assert "Insurance" in names


def test_onboard_vendor_success(client, test_db):
    create_category(test_db, "Automobile")
    payload = {
        "name": "Acme Co",
        "email": "vendor@example.com",
        "phone_number": "999999",
        "country_code": "+1",
        "category": "Automobile",
        "comments": "Interested in partnership",
    }
    res = client.post("/api/v1/vendors", json=payload)
    assert res.status_code == HTTPStatus.CREATED
    body = res.json()
    assert body["success"] is True
    assert body["data"]["email"] == payload["email"]
    assert body["data"]["id"] > 0


def test_onboard_vendor_conflict_email(client, test_db):
    create_category(test_db, "Auto")
    payload = {
        "name": "Acme Co",
        "email": "dup@example.com",
        "phone_number": "111",
        "country_code": "+1",
        "category": "Auto",
        "comments": "First vendor",
    }
    client.post("/api/v1/vendors", json=payload)
    res = client.post("/api/v1/vendors", json=payload)
    assert res.status_code == HTTPStatus.CONFLICT
    body = res.json()
    assert body["success"] is False
    assert body["error"]["code"] == "vendor_conflict"


def test_onboard_vendor_conflict_phone(client, test_db):
    create_category(test_db, "Auto2")
    first = {
        "name": "Vendor A",
        "email": "a@example.com",
        "phone_number": "222",
        "country_code": "+1",
        "category": "Auto2",
        "comments": "Vendor A",
    }
    second = {
        "name": "Vendor B",
        "email": "b@example.com",
        "phone_number": "222",
        "country_code": "+1",
        "category": "Auto2",
        "comments": "Vendor B",
    }
    client.post("/api/v1/vendors", json=first)
    res = client.post("/api/v1/vendors", json=second)
    assert res.status_code == HTTPStatus.CONFLICT
    body = res.json()
    assert body["success"] is False
    assert body["error"]["code"] == "vendor_conflict"


def test_onboard_vendor_validation_error_missing_phone(client, test_db):
    payload = {
        "name": "NoPhone",
        "email": "nophone@example.com",
        "country_code": "+1",
        "category": "NoPhoneCat",
        "comments": "No phone supplied",
    }
    res = client.post("/api/v1/vendors", json=payload)
    assert res.status_code == HTTPStatus.UNPROCESSABLE_ENTITY


def create_category(db_session, name):
    from app.entities.category import Category

    category = Category(name=name)
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)
    return category.id
