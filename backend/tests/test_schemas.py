from app.schemas.common import ErrorDetail, ErrorResponse, HealthResponse
from app.schemas.resume import (
    CertificationItem,
    ContactInfo,
    EducationItem,
    ExperienceItem,
    MissingKeywordSuggestion,
    ProjectItem,
    ResumeData,
    SkillCategory,
    TailoredResumeResponse,
)


def test_resume_data_schema_complete():
    """Verify that ResumeData model serializes and validates complete structured resumes."""
    contact = ContactInfo(
        full_name="Jane Doe",
        email="jane.doe@example.com",
        phone="+1 555-0199",
        location="San Francisco, CA",
        linkedin_url="https://linkedin.com/in/janedoe",
        github_url="https://github.com/janedoe",
    )
    skills = [
        SkillCategory(category="Languages", skills=["Python", "TypeScript"]),
        SkillCategory(category="Cloud", skills=["AWS", "Docker"]),
    ]
    experience = [
        ExperienceItem(
            title="Senior Software Engineer",
            company="Tech Corp",
            location="Remote",
            start_date="Jan 2022",
            end_date="Present",
            is_current=True,
            bullet_points=[
                "Architected distributed data pipelines reducing processing latency by 35%.",
                "Spearheaded adoption of FastAPI and automated CI/CD workflows.",
            ],
            technologies_used=["Python", "FastAPI", "Docker", "PostgreSQL"],
        )
    ]
    projects = [
        ProjectItem(
            title="OpenSource Resume Parser",
            description="High-speed PDF extractor with structured validation.",
            url="https://github.com/janedoe/parser",
            bullet_points=["Extracted 99.8% accurate tabular data from complex resumes."],
            technologies_used=["Python", "PyMuPDF"],
        )
    ]
    education = [
        EducationItem(
            institution="University of California, Berkeley",
            degree="Bachelor of Science",
            field_of_study="Computer Science",
            start_date="2016",
            end_date="2020",
            highlights=["Dean's Honor List"],
        )
    ]
    certifications = [
        CertificationItem(
            name="AWS Certified Solutions Architect - Associate",
            issuer="Amazon Web Services",
            issue_date="2023",
        )
    ]

    resume = ResumeData(
        contact=contact,
        professional_summary="Senior Engineer with 6+ years specializing in Python backend systems.",
        skills=skills,
        experience=experience,
        projects=projects,
        education=education,
        certifications=certifications,
    )

    missing_keywords = [
        MissingKeywordSuggestion(
            keyword="Kubernetes",
            category="Cloud & Infrastructure",
            context_or_reason="Required in job description for production deployments.",
            suggested_action="Add to skills only if you have verified production experience.",
        )
    ]

    response = TailoredResumeResponse(
        tailored_resume=resume,
        missing_keywords=missing_keywords,
        alignment_score=92,
        summary_notes="Refocused experience bullets toward scalable distributed systems.",
    )

    dumped = response.model_dump()
    assert dumped["tailored_resume"]["contact"]["full_name"] == "Jane Doe"
    assert len(dumped["tailored_resume"]["experience"][0]["bullet_points"]) == 2
    assert len(dumped["missing_keywords"]) == 1
    assert dumped["missing_keywords"][0]["keyword"] == "Kubernetes"
    assert dumped["alignment_score"] == 92


def test_error_response_schema():
    """Verify that ErrorResponse schema standardizes error delivery."""
    error = ErrorResponse(
        error=ErrorDetail(
            code="FILE_TOO_LARGE",
            message="Uploaded file exceeds maximum allowed limit of 5 MB.",
            details={"max_bytes": 5242880, "actual_bytes": 6000000},
        )
    )
    dumped = error.model_dump()
    assert dumped["error"]["code"] == "FILE_TOO_LARGE"
    assert dumped["error"]["details"]["actual_bytes"] == 6000000


def test_health_response_schema():
    """Verify HealthResponse structure and defaults."""
    health = HealthResponse(
        app_name="AI Resume Tailor API",
        environment="development",
        version="0.1.0",
    )
    assert health.status == "ok"
    assert health.app_name == "AI Resume Tailor API"
