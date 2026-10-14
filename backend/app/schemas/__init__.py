"""API Schemas and Data Contracts."""

from app.schemas.common import ErrorDetail, ErrorResponse, HealthResponse
from app.schemas.resume import (
    ContactInfo,
    SkillCategory,
    ExperienceItem,
    ProjectItem,
    EducationItem,
    CertificationItem,
    MissingKeywordSuggestion,
    ResumeData,
    TailoredResumeResponse,
    ResumeExtractionResponse,
)
from app.schemas.tailor import TailorResumeRequest

__all__ = [
    "ErrorDetail",
    "ErrorResponse",
    "HealthResponse",
    "ContactInfo",
    "SkillCategory",
    "ExperienceItem",
    "ProjectItem",
    "EducationItem",
    "CertificationItem",
    "MissingKeywordSuggestion",
    "ResumeData",
    "TailoredResumeResponse",
    "ResumeExtractionResponse",
    "TailorResumeRequest",
]
