from fastapi import APIRouter, Depends
from app.core.config import Settings, get_settings
from app.schemas.common import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def get_health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Return backend operational status, version, running environment, and AI readiness."""
    return HealthResponse(
        status="ok",
        app_name=settings.app_name,
        environment=settings.environment,
        version=settings.app_version,
        gemini_configured=bool(settings.gemini_api_key and settings.gemini_api_key.strip()),
    )


@router.get("/health/live", summary="Liveness probe", description="Checks if the process is responsive.")
async def liveness_probe() -> dict:
    """Return 200 OK if the application server is alive and receiving requests."""
    return {"status": "alive"}


@router.get("/health/ready", summary="Readiness probe", description="Checks if the service is ready for traffic.")
async def readiness_probe(settings: Settings = Depends(get_settings)) -> dict:
    """Return 200 OK when core application components are ready."""
    return {
        "status": "ready",
        "environment": settings.environment,
        "ai_service_configured": bool(settings.gemini_api_key and settings.gemini_api_key.strip()),
        "model": settings.gemini_model,
    }

