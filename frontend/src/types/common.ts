/**
 * Standardized API error detail payload matching backend ErrorDetail schema.
 */
export interface ErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Standardized API error response envelope matching backend ErrorResponse schema.
 */
export interface ErrorResponse {
  error: ErrorDetail;
}

/**
 * Health check response model matching backend HealthResponse schema.
 */
export interface HealthResponse {
  status: "ok" | string;
  app_name: string;
  environment: string;
  version: string;
  gemini_configured?: boolean;
}

