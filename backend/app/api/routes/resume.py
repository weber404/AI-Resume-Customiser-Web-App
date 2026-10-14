from typing import Union
from fastapi import APIRouter, Depends, File, Request, Response, UploadFile

from app.core.config import Settings, get_settings
from app.core.exceptions import AppException
from app.core.rate_limiter import check_tailor_rate_limit
from app.schemas.resume import ResumeData, ResumeExtractionResponse, TailoredResumeResponse
from app.schemas.tailor import TailorResumeRequest
from app.services.exporter import (
    generate_resume_docx,
    generate_resume_pdf,
    generate_safe_filename,
)
from app.services.parser import (
    extract_text_from_docx,
    extract_text_from_pdf,
    validate_and_read_upload,
)
from app.services.tailoring import TailoringService

router = APIRouter(prefix="/resume", tags=["Resume"])


def get_tailoring_service(settings: Settings = Depends(get_settings)) -> TailoringService:
    """Dependency provider returning an instance of TailoringService."""
    return TailoringService(settings=settings)


@router.post(
    "/extract",
    response_model=ResumeExtractionResponse,
    summary="Extract text content from uploaded resume",
    description="Validates and extracts readable text from PDF or DOCX resume documents.",
)
async def extract_resume_endpoint(
    file: UploadFile = File(..., description="Uploaded PDF or DOCX document"),
    settings: Settings = Depends(get_settings),
) -> ResumeExtractionResponse:
    """Ingest a resume file, validate integrity, and extract normalized text content."""
    filename, file_type, file_bytes = await validate_and_read_upload(file, settings)

    if file_type == "pdf":
        extracted_text = extract_text_from_pdf(
            file_bytes=file_bytes,
            min_chars=settings.min_extracted_text_chars,
        )
    elif file_type == "docx":
        extracted_text = extract_text_from_docx(
            file_bytes=file_bytes,
            min_chars=settings.min_extracted_text_chars,
        )
    else:
        raise AppException(
            status_code=415,
            code="UNSUPPORTED_FILE_TYPE",
            message=f"Unsupported file format '{file_type}'. Please upload a PDF or DOCX file.",
        )

    return ResumeExtractionResponse(
        filename=filename,
        file_type=file_type,
        file_size_bytes=len(file_bytes),
        extracted_text=extracted_text,
        character_count=len(extracted_text),
    )


@router.post(
    "/tailor",
    response_model=TailoredResumeResponse,
    summary="Tailor resume against a job description",
    description="Analyzes extracted resume text and target job description using Gemini AI to produce an ATS-aligned, truthful tailored resume.",
)
async def tailor_resume_endpoint(
    request: TailorResumeRequest,
    http_request: Request,
    tailoring_service: TailoringService = Depends(get_tailoring_service),
    settings: Settings = Depends(get_settings),
) -> TailoredResumeResponse:
    """Tailor extracted resume content to highlight relevance for the target job description."""
    check_tailor_rate_limit(http_request, settings)
    return await tailoring_service.tailor(
        extracted_text=request.extracted_text,
        job_description=request.job_description,
    )


@router.post(
    "/export/pdf",
    summary="Export tailored resume as ATS-friendly PDF",
    description="Generates an in-memory downloadable PDF conforming to ATS single-column formatting standards.",
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "Downloadable ATS PDF document",
        }
    },
)
async def export_pdf_endpoint(
    request: TailoredResumeResponse,
) -> Response:
    """Generate and return an in-memory downloadable PDF resume."""
    try:
        resume_data = request.tailored_resume
        pdf_bytes = generate_resume_pdf(resume_data)
        full_name = resume_data.contact.full_name if resume_data.contact else None
        safe_filename = generate_safe_filename(full_name, "pdf")

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_filename}"',
                "Content-Length": str(len(pdf_bytes)),
            },
        )
    except Exception:
        raise AppException(
            status_code=500,
            code="EXPORT_FAILED",
            message="Failed to generate PDF resume export.",
        ) from None


@router.post(
    "/export/docx",
    summary="Export tailored resume as ATS-friendly Word DOCX",
    description="Generates an in-memory downloadable DOCX document conforming to ATS single-column formatting standards.",
    responses={
        200: {
            "content": {
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {}
            },
            "description": "Downloadable ATS Word DOCX document",
        }
    },
)
async def export_docx_endpoint(
    request: TailoredResumeResponse,
) -> Response:
    """Generate and return an in-memory downloadable Word DOCX resume."""
    try:
        resume_data = request.tailored_resume
        docx_bytes = generate_resume_docx(resume_data)
        full_name = resume_data.contact.full_name if resume_data.contact else None
        safe_filename = generate_safe_filename(full_name, "docx")

        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_filename}"',
                "Content-Length": str(len(docx_bytes)),
            },
        )
    except Exception:
        raise AppException(
            status_code=500,
            code="EXPORT_FAILED",
            message="Failed to generate Word DOCX resume export.",
        ) from None

