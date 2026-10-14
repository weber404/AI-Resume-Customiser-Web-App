from typing import Any, Optional
from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    """Detailed error object containing a machine-readable code and human-readable message."""

    code: str = Field(..., description="Machine-readable error identifier (e.g. INVALID_FILE_TYPE, OVERSIZED_PAYLOAD)")
    message: str = Field(..., description="Human-friendly explanation of the error suitable for user display")
    details: Optional[Any] = Field(None, description="Optional diagnostic details or validation errors")


class ErrorResponse(BaseModel):
    """Standardized API error envelope returned by all endpoints on failure."""

    error: ErrorDetail


class HealthResponse(BaseModel):
    """Response returned by the health check endpoint."""

    status: str = Field(default="ok", description="Current service health status")
    app_name: str = Field(..., description="Application name")
    environment: str = Field(..., description="Running environment")
    version: str = Field(..., description="Application version")
    gemini_configured: bool = Field(
        default=False,
        description="Whether the Gemini AI service has an API key configured",
    )
