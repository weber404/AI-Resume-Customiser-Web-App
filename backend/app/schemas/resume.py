from typing import List, Optional
from pydantic import BaseModel, Field


class ContactInfo(BaseModel):
    """Personal and professional contact details."""

    full_name: str = Field(..., description="Candidate's full name")
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    location: Optional[str] = Field(None, description="City, State/Country or Remote status")
    linkedin_url: Optional[str] = Field(None, description="LinkedIn profile URL")
    portfolio_url: Optional[str] = Field(None, description="Portfolio or personal website URL")
    github_url: Optional[str] = Field(None, description="GitHub or code repository URL")


class SkillCategory(BaseModel):
    """Grouped skill set (e.g., Languages, Frameworks, Cloud, Methodologies)."""

    category: str = Field(..., description="Skill category name (e.g. 'Languages & Frameworks')")
    skills: List[str] = Field(default_factory=list, description="List of specific skills in this category")


class ExperienceItem(BaseModel):
    """Work experience or employment position."""

    title: str = Field(..., description="Job title / role")
    company: str = Field(..., description="Organization or employer name")
    location: Optional[str] = Field(None, description="Geographic location or Remote")
    start_date: str = Field(..., description="Start date (e.g. 'Jan 2021')")
    end_date: Optional[str] = Field(None, description="End date (e.g. 'Present' or 'Dec 2023')")
    is_current: bool = Field(default=False, description="Whether this is the current active role")
    bullet_points: List[str] = Field(default_factory=list, description="Achievements and responsibilities")
    technologies_used: List[str] = Field(default_factory=list, description="Primary technologies/tools leveraged")


class ProjectItem(BaseModel):
    """Key technical or professional project."""

    title: str = Field(..., description="Project name")
    description: Optional[str] = Field(None, description="Short high-level synopsis of the project")
    url: Optional[str] = Field(None, description="Live link, demo, or repository URL")
    bullet_points: List[str] = Field(default_factory=list, description="Key accomplishments, architecture, or results")
    technologies_used: List[str] = Field(default_factory=list, description="Technologies and libraries used")


class EducationItem(BaseModel):
    """Academic degree or qualification."""

    institution: str = Field(..., description="College, university, or academy name")
    degree: str = Field(..., description="Degree type (e.g. 'Bachelor of Science')")
    field_of_study: Optional[str] = Field(None, description="Major or specialization")
    start_date: Optional[str] = Field(None, description="Start date")
    end_date: Optional[str] = Field(None, description="Graduation date or expected completion")
    gpa: Optional[str] = Field(None, description="GPA or honors, if applicable")
    highlights: List[str] = Field(default_factory=list, description="Relevant coursework, awards, or activities")


class CertificationItem(BaseModel):
    """Professional credential or license."""

    name: str = Field(..., description="Certification name (e.g. 'AWS Certified Solutions Architect')")
    issuer: str = Field(..., description="Issuing organization (e.g. 'Amazon Web Services')")
    issue_date: Optional[str] = Field(None, description="Date issued")
    expiration_date: Optional[str] = Field(None, description="Date of expiration, if any")
    credential_id: Optional[str] = Field(None, description="Credential verification ID")
    url: Optional[str] = Field(None, description="Public verification URL")


class MissingKeywordSuggestion(BaseModel):
    """Keyword or skill from the job description not present in the candidate's original resume."""

    keyword: str = Field(..., description="Keyword or skill detected in the job description")
    category: str = Field(..., description="Category (e.g. 'Cloud & Infrastructure', 'Database')")
    context_or_reason: str = Field(..., description="Why this keyword is relevant to the target role")
    suggested_action: Optional[str] = Field(
        None,
        description="Guidance on whether candidate should add this only if verified by real experience",
    )


class ResumeData(BaseModel):
    """Complete structured representation of a resume."""

    contact: Optional[ContactInfo] = Field(None, description="Candidate contact details")
    professional_summary: Optional[str] = Field(None, description="Targeted executive or professional summary")
    skills: List[SkillCategory] = Field(default_factory=list, description="Categorized skill matrix")
    experience: List[ExperienceItem] = Field(default_factory=list, description="Work experience history")
    projects: List[ProjectItem] = Field(default_factory=list, description="Highlighted projects")
    education: List[EducationItem] = Field(default_factory=list, description="Educational background")
    certifications: List[CertificationItem] = Field(default_factory=list, description="Certifications and licenses")


class TailoredResumeResponse(BaseModel):
    """Response payload containing the tailored resume along with advisory feedback."""

    tailored_resume: ResumeData = Field(..., description="Tailored structured resume content")
    missing_keywords: List[MissingKeywordSuggestion] = Field(
        default_factory=list,
        description="Keywords from the job description not found in original resume",
    )
    alignment_score: Optional[int] = Field(
        None,
        description="Optional estimated match percentage (0-100) against the job description",
    )
    summary_notes: Optional[str] = Field(
        None,
        description="Summary of adjustments and emphasis changes applied",
    )


class ResumeExtractionResponse(BaseModel):
    """Response returned upon successful resume file ingestion and text extraction."""

    filename: str = Field(..., description="Original name of the uploaded document")
    file_type: str = Field(..., description="Document format ('pdf' or 'docx')")
    file_size_bytes: int = Field(..., ge=1, description="Size of the uploaded file in bytes")
    extracted_text: str = Field(..., description="Clean, readable extracted resume text content")
    character_count: int = Field(..., ge=0, description="Total characters extracted from the document")
