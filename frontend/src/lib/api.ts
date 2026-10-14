import type {
  ErrorResponse,
  HealthResponse,
  ResumeExtractionResponse,
  TailoredResumeResponse,
  TailorResumeRequest,
} from "../types/index.ts";

/**
 * Retrieve the configured backend API base URL from client environment.
 */
export function getBackendBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

/**
 * Custom application error class preserving structured API error codes.
 */
export class ApiError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;

  constructor(
    message: string,
    code: string = "API_ERROR",
    statusCode: number = 500,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function handleResponse<T>(response: Response, endpointDesc: string): Promise<T> {
  if (!response.ok) {
    let errorBody: ErrorResponse | null = null;
    try {
      errorBody = (await response.json()) as ErrorResponse;
    } catch {
      // Non-JSON response body
    }

    const code = errorBody?.error?.code || `HTTP_${response.status}`;
    const message =
      errorBody?.error?.message ||
      `Request to ${endpointDesc} failed with HTTP ${response.status}: ${response.statusText}`;
    throw new ApiError(message, code, response.status, errorBody?.error?.details);
  }

  return (await response.json()) as T;
}

/**
 * Performs a genuine GET request to the backend health endpoint.
 */
export async function fetchHealth(): Promise<HealthResponse> {
  const baseUrl = getBackendBaseUrl().replace(/\/+$/, "");
  const endpoint = `${baseUrl}/api/health`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return await handleResponse<HealthResponse>(response, "/api/health");
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const message = error instanceof Error ? error.message : "Failed to connect to backend server";
    throw new ApiError(
      `Unable to reach backend service: ${message}`,
      "NETWORK_CONNECTION_ERROR",
      0
    );
  }
}

const DEFAULT_TAILOR_TIMEOUT_MS = 75000;

function createCoordinatedSignal(
  timeoutMs: number,
  userSignal?: AbortSignal
): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new DOMException("The request timed out.", "TimeoutError"));
  }, timeoutMs);

  let onUserAbort: (() => void) | null = null;
  if (userSignal) {
    if (userSignal.aborted) {
      controller.abort(userSignal.reason);
      clearTimeout(timer);
    } else {
      onUserAbort = () => {
        controller.abort(userSignal.reason);
        clearTimeout(timer);
      };
      userSignal.addEventListener("abort", onUserAbort);
    }
  }

  const cleanup = () => {
    clearTimeout(timer);
    if (userSignal && onUserAbort) {
      userSignal.removeEventListener("abort", onUserAbort);
    }
  };

  return { signal: controller.signal, cleanup };
}

/**
 * Uploads a resume document (PDF or DOCX) to the backend for text extraction.
 */
export async function extractResume(
  file: File,
  signal?: AbortSignal
): Promise<ResumeExtractionResponse> {
  const baseUrl = getBackendBaseUrl().replace(/\/+$/, "");
  const endpoint = `${baseUrl}/api/resume/extract`;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      signal,
    });
    return await handleResponse<ResumeExtractionResponse>(response, "/api/resume/extract");
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
      throw new ApiError(
        "Resume extraction was cancelled or timed out. Please try again.",
        "REQUEST_TIMEOUT",
        504
      );
    }
    const message = error instanceof Error ? error.message : "Failed to upload and extract document";
    throw new ApiError(
      `Resume extraction failed: ${message}`,
      "NETWORK_CONNECTION_ERROR",
      0
    );
  }
}

/**
 * Sends extracted resume text and target job description to the backend AI tailoring endpoint.
 * Includes coordinated client-side timeout protection (default 65s).
 */
export async function tailorResume(
  payload: TailorResumeRequest,
  signal?: AbortSignal,
  timeoutMs: number = DEFAULT_TAILOR_TIMEOUT_MS
): Promise<TailoredResumeResponse> {
  const baseUrl = getBackendBaseUrl().replace(/\/+$/, "");
  const endpoint = `${baseUrl}/api/resume/tailor`;

  const { signal: coordinatedSignal, cleanup } = createCoordinatedSignal(timeoutMs, signal);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: coordinatedSignal,
    });
    return await handleResponse<TailoredResumeResponse>(response, "/api/resume/tailor");
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
      if (signal?.aborted) {
        throw new ApiError(
          "The tailoring request was cancelled.",
          "REQUEST_CANCELLED",
          499
        );
      }
      throw new ApiError(
        "The tailoring request took longer than expected and timed out. Please click Retry.",
        "LLM_TIMEOUT",
        504
      );
    }
    const message = error instanceof Error ? error.message : "Failed to tailor resume with AI";
    throw new ApiError(
      `Resume tailoring failed: ${message}`,
      "NETWORK_CONNECTION_ERROR",
      0
    );
  } finally {
    cleanup();
  }
}

/**
 * Helper to parse safe download filename from Content-Disposition header.
 */
export function parseContentDispositionFilename(
  header: string | null,
  fallback: string
): string {
  if (!header) return fallback;
  const match = header.match(/filename\*?=['"]?(?:UTF-8'')?([^'";]+)['"]?/i);
  if (match && match[1]) {
    return decodeURIComponent(match[1].trim());
  }
  return fallback;
}

/**
 * Triggers native browser file download for a Blob and revokes temporary ObjectURL.
 */
export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Exports tailored resume as an ATS-friendly PDF.
 */
export async function exportResumePdf(
  payload: TailoredResumeResponse
): Promise<{ blob: Blob; filename: string }> {
  const baseUrl = getBackendBaseUrl().replace(/\/+$/, "");
  const endpoint = `${baseUrl}/api/resume/export/pdf`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/pdf, application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorBody: ErrorResponse | null = null;
      try {
        errorBody = (await response.json()) as ErrorResponse;
      } catch {
        // Fallback for non-JSON
      }
      const code = errorBody?.error?.code || `HTTP_${response.status}`;
      const message =
        errorBody?.error?.message ||
        `Failed to export PDF with HTTP ${response.status}: ${response.statusText}`;
      throw new ApiError(message, code, response.status, errorBody?.error?.details);
    }

    const disposition = response.headers.get("content-disposition");
    const filename = parseContentDispositionFilename(disposition, "Tailored_Resume.pdf");
    const blob = await response.blob();
    return { blob, filename };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const message = error instanceof Error ? error.message : "Failed to export PDF";
    throw new ApiError(
      `PDF export failed: ${message}`,
      "NETWORK_CONNECTION_ERROR",
      0
    );
  }
}

/**
 * Exports tailored resume as an ATS-friendly Word DOCX.
 */
export async function exportResumeDocx(
  payload: TailoredResumeResponse
): Promise<{ blob: Blob; filename: string }> {
  const baseUrl = getBackendBaseUrl().replace(/\/+$/, "");
  const endpoint = `${baseUrl}/api/resume/export/docx`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorBody: ErrorResponse | null = null;
      try {
        errorBody = (await response.json()) as ErrorResponse;
      } catch {
        // Fallback for non-JSON
      }
      const code = errorBody?.error?.code || `HTTP_${response.status}`;
      const message =
        errorBody?.error?.message ||
        `Failed to export DOCX with HTTP ${response.status}: ${response.statusText}`;
      throw new ApiError(message, code, response.status, errorBody?.error?.details);
    }

    const disposition = response.headers.get("content-disposition");
    const filename = parseContentDispositionFilename(disposition, "Tailored_Resume.docx");
    const blob = await response.blob();
    return { blob, filename };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const message = error instanceof Error ? error.message : "Failed to export Word DOCX";
    throw new ApiError(
      `DOCX export failed: ${message}`,
      "NETWORK_CONNECTION_ERROR",
      0
    );
  }
}

