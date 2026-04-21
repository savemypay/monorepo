import pytest
from httpx import AsyncClient

from main import app


@pytest.mark.asyncio
async def test_root_returns_hello_world():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        response = await client.get("/api/v1/")
    assert response.status_code == 200
    assert response.json().get("message") == "Hello World, test"
