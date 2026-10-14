from functools import lru_cache
from typing import List, Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application runtime settings loaded from environment variables and .env file."""

    app_name: str = "AI Resume Tailor API"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = True
    port: int = 8000
    api_prefix: str = "/api"

    # Frontend CORS configuration
    frontend_origin: str = "http://localhost:3000"
    allowed_origins: List[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    # Document upload limits (default: 5 MB)
    max_upload_size_bytes: int = 5 * 1024 * 1024
    min_extracted_text_chars: int = 30

    # AI Service settings
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-3.5-flash-lite"
    gemini_temperature: float = 0.1
    gemini_timeout_seconds: float = 50.0
    gemini_max_retries: int = 2
    gemini_retry_base_delay: float = 1.0
    max_resume_text_length: int = 50000
    max_job_description_length: int = 25000

    # Rate Limiting & Abuse Protection
    rate_limit_enabled: bool = True
    rate_limit_tailor_requests_per_minute: int = 20

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @field_validator("gemini_api_key", mode="before")
    @classmethod
    def sanitize_api_key(cls, v):
        if v is None or (isinstance(v, str) and not v.strip()):
            return None
        return v

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        if isinstance(v, list):
            return v
        return ["http://localhost:3000"]


@lru_cache()
def get_settings() -> Settings:
    """Return a cached singleton instance of Settings."""
    return Settings()
