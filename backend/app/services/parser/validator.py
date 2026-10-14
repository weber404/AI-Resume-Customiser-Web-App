import os
from typing import Tuple
from fastapi import UploadFile

from app.core.config import Settings
from app.core.exceptions import AppException

SUPPORTED_EXTENSIONS = {"pdf", "docx"}
CHUNK_SIZE_BYTES = 64 * 1024  # 64 KB per read chunk


async def validate_and_read_upload(
    file: UploadFile,
    settings: Settings,
) -> Tuple[str, str, bytes]:
    """Validate uploaded file metadata, safely stream contents enforcing size limit,

    and verify magic bytes against claimed file extension.

    Returns:
        Tuple of (filename, file_type, file_bytes)
    """
    filename = file.filename or ""
    if not filename.strip():
        raise AppException(
            status_code=400,
            code="EMPTY_FILE",
            message="No file uploaded or filename is missing. Please provide a valid file.",
        )

    # Validate file extension
    _, ext = os.path.splitext(filename)
    clean_ext = ext.lstrip(".").lower()
    if clean_ext not in SUPPORTED_EXTENSIONS:
        raise AppException(
            status_code=415,
            code="UNSUPPORTED_FILE_TYPE",
            message=f"Unsupported file format '.{clean_ext or 'unknown'}'. Please upload a PDF (.pdf) or Word document (.docx).",
            details={"supported_formats": sorted(list(SUPPORTED_EXTENSIONS))},
        )

    # Stream content safely to prevent unbounded memory allocation
    chunks = []
    total_bytes = 0
    max_bytes = settings.max_upload_size_bytes

    try:
        while True:
            chunk = await file.read(CHUNK_SIZE_BYTES)
            if not chunk:
                break
            total_bytes += len(chunk)
            if total_bytes > max_bytes:
                max_mb = max_bytes // (1024 * 1024)
                raise AppException(
                    status_code=413,
                    code="FILE_TOO_LARGE",
                    message=f"Uploaded file exceeds maximum allowed limit of {max_mb} MB.",
                    details={"max_size_bytes": max_bytes, "received_bytes": total_bytes},
                )
            chunks.append(chunk)
    finally:
        await file.close()

    if total_bytes == 0:
        raise AppException(
            status_code=400,
            code="EMPTY_FILE",
            message="The uploaded file is empty. Please upload a document with content.",
        )

    file_bytes = b"".join(chunks)

    # Validate magic bytes / file signatures to prevent extension spoofing
    if clean_ext == "pdf":
        # Standard PDF files begin with %PDF
        if not file_bytes.startswith(b"%PDF"):
            raise AppException(
                status_code=400,
                code="FILE_TYPE_MISMATCH",
                message="The uploaded file content does not match its .pdf extension.",
            )
    elif clean_ext == "docx":
        # OpenXML DOCX files are ZIP packages beginning with PK\x03\x04
        if not file_bytes.startswith(b"PK\x03\x04"):
            raise AppException(
                status_code=400,
                code="FILE_TYPE_MISMATCH",
                message="The uploaded file content does not match its .docx extension.",
            )

    return filename, clean_ext, file_bytes
