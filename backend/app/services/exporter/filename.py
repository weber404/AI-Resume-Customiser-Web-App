import re
from typing import Optional


def generate_safe_filename(full_name: Optional[str], extension: str) -> str:
    """Generate a clean, sanitized ASCII filename for download headers.

    Prevents directory traversal, command injection, and invalid HTTP header tokens.
    Guarantees a safe, predictable filename ending in the specified extension.
    """
    ext = extension.lstrip(".").lower()
    fallback = f"Tailored_Resume.{ext}"

    if not full_name:
        return fallback

    # Strip whitespace
    name = full_name.strip()
    if not name:
        return fallback

    # Replace any non-alphanumeric, non-hyphen character with underscore
    sanitized = re.sub(r"[^a-zA-Z0-9-]+", "_", name)

    # Collapse repeated underscores/dashes to a single underscore
    sanitized = re.sub(r"[_-]+", "_", sanitized).strip("_")

    if not sanitized:
        return fallback

    # Limit length to 40 characters for header predictability
    sanitized = sanitized[:40].rstrip("_")

    return f"{sanitized}_Tailored_Resume.{ext}"
