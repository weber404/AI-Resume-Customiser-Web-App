import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.api.routes import health, resume
from app.core.config import get_settings
from app.core.exceptions import AppException
from app.schemas.common import ErrorDetail, ErrorResponse

# Configure structured, secret-safe logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ai_resume_tailor")

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown lifecycle safely."""
    logger.info(
        "Starting %s v%s [Environment: %s, Debug: %s, AI Configured: %s]",
        settings.app_name,
        settings.app_version,
        settings.environment,
        settings.debug,
        bool(settings.gemini_api_key and settings.gemini_api_key.strip()),
    )
    yield
    logger.info("Gracefully shutting down %s", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for AI Resume Tailor - Intelligent resume alignment engine.",
    debug=settings.debug,
    lifespan=lifespan,
)

# Pure ASGI Production Security Headers Middleware
from starlette.types import ASGIApp, Receive, Scope, Send


class SecurityHeadersMiddleware:
    """Pure ASGI middleware enforcing defense-in-depth HTTP security headers."""

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_with_security_headers(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.append((b"x-content-type-options", b"nosniff"))
                headers.append((b"x-frame-options", b"DENY"))
                headers.append((b"referrer-policy", b"strict-origin-when-cross-origin"))
                headers.append((b"permissions-policy", b"camera=(), microphone=(), geolocation=()"))
                if not settings.debug:
                    headers.append((b"strict-transport-security", b"max-age=31536000; includeSubDomains"))
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_with_security_headers)


app.add_middleware(SecurityHeadersMiddleware)

# CORS configuration
origins = list(set([settings.frontend_origin] + settings.allowed_origins))
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Mount API routers under configured prefix (e.g. /api)
app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(resume.router, prefix=settings.api_prefix)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handle custom application exceptions and return standard error envelope."""
    headers = {}
    if (
        exc.status_code == 429
        and isinstance(exc.details, dict)
        and "retry_after_seconds" in exc.details
    ):
        headers["Retry-After"] = str(exc.details["retry_after_seconds"])

    return JSONResponse(
        status_code=exc.status_code,
        headers=headers,
        content=ErrorResponse(
            error=ErrorDetail(
                code=exc.code,
                message=exc.message,
                details=exc.details,
            )
        ).model_dump(),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle FastAPI validation errors in standard error envelope."""
    first_error = exc.errors()[0] if exc.errors() else {}
    msg = first_error.get("msg", "Invalid request parameters.")
    if msg.startswith("Value error, "):
        msg = msg[len("Value error, "):]
    loc = " -> ".join([str(x) for x in first_error.get("loc", [])])

    # Build clean serializable diagnostic details without raw exception objects
    sanitized_errors = [
        {
            "loc": [str(part) for part in err.get("loc", [])],
            "msg": err.get("msg", "").replace("Value error, ", ""),
            "type": err.get("type", "validation_error"),
        }
        for err in exc.errors()
    ]

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=ErrorResponse(
            error=ErrorDetail(
                code="VALIDATION_ERROR",
                message=f"Validation error at {loc}: {msg}" if loc else msg,
                details=sanitized_errors if settings.debug else None,
            )
        ).model_dump(),
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Safely catch unhandled server errors, log diagnostics safely, and return sanitized envelope."""
    logger.error("Unhandled server exception processing %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error=ErrorDetail(
                code="INTERNAL_SERVER_ERROR",
                message="An unexpected server error occurred. Please try again later.",
                details=str(exc) if settings.debug else None,
            )
        ).model_dump(),
    )


@app.get("/", tags=["Root"])
async def root():
    """Root health check redirecting to API status."""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "operational",
        "docs_url": "/docs",
        "health_url": f"{settings.api_prefix}/health",
    }
