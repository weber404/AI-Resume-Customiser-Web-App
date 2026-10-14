import os
from unittest.mock import patch
from app.core.config import Settings


def test_settings_load_without_gemini_api_key():
    """Verify that configuration instantiates properly when GEMINI_API_KEY is not set."""
    with patch.dict(os.environ, {}, clear=True):
        settings = Settings(_env_file=None)
        assert settings.gemini_api_key is None
        assert settings.max_upload_size_bytes == 5 * 1024 * 1024
        assert settings.frontend_origin == "http://localhost:3000"
        assert settings.gemini_model == "gemini-3.5-flash-lite"


def test_custom_gemini_model_configuration():
    """Verify that GEMINI_MODEL can be configured via environment variable."""
    with patch.dict(os.environ, {"GEMINI_MODEL": "gemini-3.5-flash"}):
        settings = Settings()
        assert settings.gemini_model == "gemini-3.5-flash"


def test_custom_cors_origins_parsing():
    """Verify that multiple origins specified via comma separation are parsed correctly."""
    settings = Settings(allowed_origins="http://localhost:3000, https://tailor.mydomain.com")
    assert "http://localhost:3000" in settings.allowed_origins
    assert "https://tailor.mydomain.com" in settings.allowed_origins

