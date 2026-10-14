from pydantic import BaseModel, Field, field_validator


class TailorResumeRequest(BaseModel):
    """Request payload for tailoring a resume against a target job description."""

    extracted_text: str = Field(
        ...,
        description="Readable text content extracted from the candidate's resume",
        max_length=50000,
    )
    job_description: str = Field(
        ...,
        description="Complete text of the target job posting / description",
        max_length=25000,
    )

    @field_validator("extracted_text")
    @classmethod
    def validate_extracted_text(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Extracted resume text cannot be empty or contain only whitespace.")
        return trimmed

    @field_validator("job_description")
    @classmethod
    def validate_job_description(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Job description cannot be empty or contain only whitespace.")
        return trimmed
