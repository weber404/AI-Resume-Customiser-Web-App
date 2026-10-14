export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_JOB_DESCRIPTION_CHARS = 25000;
export const SUPPORTED_FILE_EXTENSIONS = [".pdf", ".docx"] as const;

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validates a selected resume file client-side before submission.
 */
export function validateResumeFile(file: File | null | undefined): ValidationResult {
  if (!file) {
    return {
      isValid: false,
      error: "Please select a PDF or Word document (.docx) to continue.",
    };
  }

  const name = file.name.toLowerCase();
  const hasValidExt = SUPPORTED_FILE_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!hasValidExt) {
    return {
      isValid: false,
      error: "Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx).",
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: "The selected file is empty (0 bytes). Please upload a valid document.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size (${sizeMb} MB) exceeds the maximum allowed limit of 5 MB.`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates the job description text input client-side.
 */
export function validateJobDescription(text: string): ValidationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: "Please enter or paste the target job description.",
    };
  }

  if (text.length > MAX_JOB_DESCRIPTION_CHARS) {
    return {
      isValid: false,
      error: `Job description exceeds maximum limit of ${MAX_JOB_DESCRIPTION_CHARS.toLocaleString("en-US")} characters.`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Format bytes into user-friendly strings (e.g., "142 KB", "2.1 MB").
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
