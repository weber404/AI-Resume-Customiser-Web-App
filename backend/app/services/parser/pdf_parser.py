import pymupdf
from app.core.exceptions import AppException


def extract_text_from_pdf(file_bytes: bytes, min_chars: int = 30) -> str:
    """Extract readable text from PDF bytes across all pages.

    Detects empty documents, corrupt files, and scanned/image-only PDFs.
    Ensures document resources are closed and released safely.
    """
    try:
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
    except Exception:
        raise AppException(
            status_code=400,
            code="CORRUPT_DOCUMENT",
            message="The uploaded PDF document is corrupt or could not be read.",
        )

    try:
        if doc.page_count == 0:
            raise AppException(
                status_code=400,
                code="NO_EXTRACTABLE_TEXT",
                message="The PDF document does not contain any pages.",
            )

        page_texts = []
        total_images = 0

        for page in doc:
            # Extract formatted text preserving lines and paragraphs
            text = page.get_text("text")
            if text and text.strip():
                page_texts.append(text.strip())

            # Count embedded images for scanned document detection
            total_images += len(page.get_images())

        extracted_text = "\n\n".join(page_texts).strip()
        non_whitespace_count = len("".join(extracted_text.split()))

        # Check for insufficient extractable text
        if non_whitespace_count < min_chars:
            # Genuinely scanned / image-only PDFs have negligible or zero selectable text (< 10 chars) alongside images
            if total_images > 0 and non_whitespace_count < 10:
                raise AppException(
                    status_code=400,
                    code="SCANNED_PDF_DETECTED",
                    message=(
                        "No selectable text found in the PDF. This application requires a "
                        "text-selectable PDF. Scanned documents or image-only PDFs are not "
                        "supported as OCR is not enabled."
                    ),
                    details={
                        "images_detected": total_images,
                        "selectable_chars": non_whitespace_count,
                        "min_required_chars": min_chars,
                    },
                )
            else:
                raise AppException(
                    status_code=400,
                    code="NO_EXTRACTABLE_TEXT",
                    message="The uploaded PDF document does not contain sufficient readable text.",
                    details={
                        "selectable_chars": non_whitespace_count,
                        "min_required_chars": min_chars,
                    },
                )

        return extracted_text

    finally:
        doc.close()
