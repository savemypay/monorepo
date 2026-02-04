from http import HTTPStatus


def test_capture_interest_success(client):
    payload = {"email": "alice@example.com", "phone_number": "12345", "country_code": "+1"}
    res = client.post("/api/v1/interest", json=payload)
    assert res.status_code == HTTPStatus.CREATED
    body = res.json()
    assert body["success"] is True
    assert body["data"]["email"] == payload["email"]
    assert body["data"]["id"] > 0


def test_capture_interest_missing_email_validation_error(client):
    payload = {"phone_number": "12345"}
    res = client.post("/api/v1/interest", json=payload)
    assert res.status_code == HTTPStatus.UNPROCESSABLE_ENTITY


def test_onboard_vendor_success(client, test_db):
    category_id = create_category(test_db, "Automobile")
    payload = {
        "name": "Acme Co",
        "email": "vendor@example.com",
        "phone_number": "999999",
        "country_code": "+1",
        "address": "123 Main",
        "category_id": category_id,
        "comments": "Interested in partnership",
    }
    res = client.post("/api/v1/vendors", json=payload)
    assert res.status_code == HTTPStatus.CREATED
    body = res.json()
    assert body["success"] is True
    assert body["data"]["email"] == payload["email"]
    assert body["data"]["id"] > 0


def test_onboard_vendor_conflict_email(client, test_db):
    category_id = create_category(test_db, "Auto")
    payload = {
        "name": "Acme Co",
        "email": "dup@example.com",
        "phone_number": "111",
        "country_code": "+1",
        "address": "123",
        "category_id": category_id,
        "comments": "First vendor",
    }
    client.post("/api/v1/vendors", json=payload)
    res = client.post("/api/v1/vendors", json=payload)
    assert res.status_code == HTTPStatus.CONFLICT
    body = res.json()
    assert body["success"] is False
    assert body["error"]["code"] == "vendor_conflict"


def test_onboard_vendor_conflict_phone(client, test_db):
    category_id = create_category(test_db, "Auto2")
    first = {
        "name": "Vendor A",
        "email": "a@example.com",
        "phone_number": "222",
        "country_code": "+1",
        "address": "123",
        "category_id": category_id,
        "comments": "Vendor A",
    }
    second = {
        "name": "Vendor B",
        "email": "b@example.com",
        "phone_number": "222",
        "country_code": "+1",
        "address": "456",
        "category_id": category_id,
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
        "address": "123",
        "category_id": create_category(test_db, "NoPhoneCat"),
        "comments": "No phone supplied",
    }
    res = client.post("/api/v1/vendors", json=payload)
    assert res.status_code == HTTPStatus.UNPROCESSABLE_ENTITY


def test_onboard_vendor_invalid_category(client):
    payload = {
        "name": "BadCat",
        "email": "badcat@example.com",
        "phone_number": "333",
        "country_code": "+1",
        "address": "123",
        "category_id": 9999,
        "comments": "Invalid category",
    }
    res = client.post("/api/v1/vendors", json=payload)
    assert res.status_code == HTTPStatus.BAD_REQUEST
    body = res.json()
    assert body["success"] is False
    assert body["error"]["code"] == "invalid_category"


def create_category(db_session, name):
    from app.entities.category import Category

    category = Category(name=name)
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)
    return category.id
