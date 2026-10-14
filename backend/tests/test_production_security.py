import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from app.main import app
from app.core.rate_limiter import tailor_rate_limiter, InMemoryRateLimiter
from app.core.config import get_settings
from app.schemas.resume import TailoredResumeResponse


@pytest.fixture(autouse=True)
def reset_rate_limiters():
    """Ensure rate limiters are cleared before and after each test."""
    tailor_rate_limiter.reset()
    yield
    tailor_rate_limiter.reset()


def test_production_security_headers_present():
    """Verify that essential security headers are attached to API responses."""
    client = TestClient(app)
    response = client.get("/api/health")
    assert response.status_code == 200

    headers = response.headers
    assert headers.get("x-content-type-options") == "nosniff"
    assert headers.get("x-frame-options") == "DENY"
    assert headers.get("referrer-policy") == "strict-origin-when-cross-origin"
    assert "camera=()" in headers.get("permissions-policy", "")


def test_liveness_and_readiness_probes():
    """Verify that liveness and readiness probes return 200 with proper state indicators."""
    client = TestClient(app)

    live_res = client.get("/api/health/live")
    assert live_res.status_code == 200
    assert live_res.json()["status"] == "alive"

    ready_res = client.get("/api/health/ready")
    assert ready_res.status_code == 200
    assert ready_res.json()["status"] == "ready"
    assert "ai_service_configured" in ready_res.json()


def test_rate_limiter_in_memory_sliding_window():
    """Verify that InMemoryRateLimiter blocks requests exceeding threshold and returns retry delay."""
    limiter = InMemoryRateLimiter(requests_per_window=3, window_seconds=10.0)
    client_ip = "192.168.1.100"

    # 3 allowed requests
    assert limiter.is_allowed(client_ip)[0] is True
    assert limiter.is_allowed(client_ip)[0] is True
    assert limiter.is_allowed(client_ip)[0] is True

    # 4th request must be rejected with retry_after > 0
    allowed, retry_after = limiter.is_allowed(client_ip)
    assert allowed is False
    assert retry_after > 0
    assert retry_after <= 10


def test_tailor_endpoint_enforces_rate_limit_and_returns_429():
    """Verify that repeated hits to /api/resume/tailor trigger HTTP 429 RATE_LIMIT_EXCEEDED."""
    client = TestClient(app)
    settings = get_settings()

    mock_tailored_response = TailoredResumeResponse(
        tailored_resume={
            "contact": None,
            "professional_summary": "Experienced engineer",
            "skills": [],
            "experience": [],
            "projects": [],
            "education": [],
            "certifications": [],
        },
        missing_keywords=[],
        alignment_score=90,
        summary_notes="Tailored",
    )

    payload = {
        "extracted_text": "Sample candidate resume text with sufficient content.",
        "job_description": "Sample target job description with requirements.",
    }

    # Temporarily set limit to 2 requests per minute for this test
    with patch.object(settings, "rate_limit_tailor_requests_per_minute", 2):
        with patch("app.services.tailoring.TailoringService.tailor", new_callable=AsyncMock) as mock_tailor:
            mock_tailor.return_value = mock_tailored_response

            # Hit 1: 200 OK
            res1 = client.post("/api/resume/tailor", json=payload)
            assert res1.status_code == 200

            # Hit 2: 200 OK
            res2 = client.post("/api/resume/tailor", json=payload)
            assert res2.status_code == 200

            # Hit 3: Exceeds limit -> 429 Too Many Requests
            res3 = client.post("/api/resume/tailor", json=payload)
            assert res3.status_code == 429
            data = res3.json()
            assert data["error"]["code"] == "RATE_LIMIT_EXCEEDED"
            assert "Retry-After" in res3.headers
            assert int(res3.headers["Retry-After"]) >= 1


@pytest.mark.asyncio
async def test_global_exception_handler_sanitizes_unhandled_error():
    """Verify that unhandled exceptions are caught, logged, and return safe 500 error envelope."""
    from app.main import global_exception_handler
    from starlette.requests import Request
    import json

    scope = {
        "type": "http",
        "method": "POST",
        "path": "/api/resume/tailor",
        "headers": [],
    }
    req = Request(scope)
    exc = RuntimeError("Secret database crash details")

    response = await global_exception_handler(req, exc)
    assert response.status_code == 500

    data = json.loads(response.body.decode())
    assert data["error"]["code"] == "INTERNAL_SERVER_ERROR"
    # Secret details should not leak in user-facing message
    assert "Secret database crash details" not in data["error"]["message"]


