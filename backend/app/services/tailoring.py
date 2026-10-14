from typing import Optional

from app.core.config import Settings, get_settings
from app.schemas.resume import TailoredResumeResponse
from app.services.llm.client import GeminiService


class TailoringService:
    """Business orchestration service for resume tailoring workflow."""

    def __init__(
        self,
        gemini_service: Optional[GeminiService] = None,
        settings: Optional[Settings] = None,
    ):
        self.settings = settings or get_settings()
        self.gemini_service = gemini_service or GeminiService(settings=self.settings)

    async def tailor(
        self,
        extracted_text: str,
        job_description: str,
    ) -> TailoredResumeResponse:
        """Coordinate AI-powered tailoring between extracted resume and job description.

        Data is processed strictly in memory and never logged or persisted.
        """
        return await self.gemini_service.tailor_resume(
            extracted_text=extracted_text,
            job_description=job_description,
        )
