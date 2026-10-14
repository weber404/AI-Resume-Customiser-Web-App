from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint_returns_200():
    """Verify that GET /api/health returns HTTP 200 and expected payload structure."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "app_name" in data
    assert "environment" in data
    assert "version" in data


def test_root_endpoint_returns_200():
    """Verify that root endpoint provides operational status."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert data["health_url"] == "/api/health"


def test_cors_headers_allowed_origin():
    """Verify that configured frontend origin is allowed via CORS headers."""
    response = client.get(
        "/api/health",
        headers={"Origin": "http://localhost:3000"},
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
