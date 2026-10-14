import asyncio
import json
import logging
import random
from typing import Optional, Tuple
from google import genai
from google.genai import types

from app.core.config import Settings, get_settings
from app.core.exceptions import AppException
from app.schemas.resume import TailoredResumeResponse
from app.services.llm.prompts import SYSTEM_INSTRUCTION, build_tailoring_prompt

logger = logging.getLogger("ai_resume_tailor.llm")


class GeminiService:
    """Service encapsulating interactions with the Google Gen AI (Gemini) API."""

    def __init__(self, settings: Optional[Settings] = None):
        self.settings = settings or get_settings()

    def _get_client(self) -> genai.Client:
        """Create and return a configured Gemini Client.

        Configures client HTTP options with:
        - Per-attempt request timeout.
        - SDK-level retry attempts set to 1 to prevent nested retry storms.

        Raises:
            AppException: If GEMINI_API_KEY is not configured in backend settings.
        """
        api_key = self.settings.gemini_api_key
        if not api_key or not api_key.strip():
            raise AppException(
                status_code=503,
                code="CONFIGURATION_ERROR",
                message="Gemini API key is not configured on the server. Please set GEMINI_API_KEY in the environment.",
            )

        timeout_ms = int(self.settings.gemini_timeout_seconds * 1000)
        http_options = types.HttpOptions(
            timeout=timeout_ms,
            retry_options=types.HttpRetryOptions(attempts=1),
        )
        return genai.Client(api_key=api_key, http_options=http_options)

    def _parse_error_details(self, exc: Exception) -> Tuple[Optional[int], Optional[float], bool]:
        """Analyze exception to determine HTTP status code, Retry-After header delay, and transient status.

        Returns:
            Tuple of (status_code, retry_after_seconds, is_transient)
        """
        status_code = getattr(exc, "code", None)
        if not isinstance(status_code, int):
            status_code = getattr(exc, "status_code", None)

        msg = str(exc)

        # Check for status codes in string if not structured on exception object
        if not isinstance(status_code, int):
            if "503" in msg or "UNAVAILABLE" in msg or "high demand" in msg.lower():
                status_code = 503
            elif "429" in msg or "RESOURCE_EXHAUSTED" in msg or "quota" in msg.lower():
                status_code = 429
            elif "404" in msg or "NOT_FOUND" in msg:
                status_code = 404
            elif "401" in msg or "UNAUTHENTICATED" in msg:
                status_code = 401
            elif "403" in msg or "PERMISSION_DENIED" in msg:
                status_code = 403
            elif "400" in msg or "INVALID_ARGUMENT" in msg:
                status_code = 400
            elif "504" in msg or "GATEWAY_TIMEOUT" in msg:
                status_code = 504
            elif "502" in msg or "BAD_GATEWAY" in msg:
                status_code = 502

        # Extract Retry-After if available in response headers
        retry_after: Optional[float] = None
        response = getattr(exc, "response", None)
        if response is not None:
            headers = getattr(response, "headers", None)
            if headers and hasattr(headers, "get"):
                raw_header = headers.get("retry-after") or headers.get("Retry-After")
                if raw_header:
                    try:
                        val = float(str(raw_header).strip())
                        if 0 < val <= 30:
                            retry_after = val
                    except (ValueError, TypeError):
                        pass

        # Identify transient vs permanent errors
        is_transient = False
        if status_code in {503, 429, 502, 504}:
            is_transient = True
        elif isinstance(exc, (ConnectionError, TimeoutError)):
            is_transient = True
        elif "UNAVAILABLE" in msg or "high demand" in msg.lower() or "RESOURCE_EXHAUSTED" in msg:
            is_transient = True

        return status_code, retry_after, is_transient

    async def tailor_resume(
        self,
        extracted_text: str,
        job_description: str,
    ) -> TailoredResumeResponse:
        """Send resume and job description to Gemini and return a validated TailoredResumeResponse.

        Enforces:
        - Strict JSON structured output matching TailoredResumeResponse.
        - Coordinated timeout per attempt.
        - Bounded exponential backoff with jitter on transient 503 / 429 errors.
        - Fast-failure on permanent errors without retrying.
        - Clean propagation on task cancellation.
        - Sanitized error envelopes without leaking API keys or internal traces.
        """
        client = self._get_client()
        prompt = build_tailoring_prompt(
            extracted_text=extracted_text,
            job_description=job_description,
        )

        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            response_schema=TailoredResumeResponse,
        )

        max_retries = max(0, self.settings.gemini_max_retries)
        base_delay = max(0.01, self.settings.gemini_retry_base_delay)
        response = None

        for attempt in range(max_retries + 1):
            try:
                response = await asyncio.wait_for(
                    client.aio.models.generate_content(
                        model=self.settings.gemini_model,
                        contents=prompt,
                        config=config,
                    ),
                    timeout=self.settings.gemini_timeout_seconds,
                )
                break
            except asyncio.CancelledError:
                logger.info("Resume tailoring request was cancelled.")
                raise
            except asyncio.TimeoutError:
                if attempt < max_retries:
                    backoff = min(6.0, base_delay * (2 ** attempt) + random.uniform(0.1, 0.5))
                    logger.warning(
                        "AI request attempt %d timed out; retrying in %.2fs",
                        attempt + 1,
                        backoff,
                    )
                    await asyncio.sleep(backoff)
                    continue
                raise AppException(
                    status_code=504,
                    code="LLM_TIMEOUT",
                    message="The request to the AI service timed out. Please try again.",
                )
            except AppException:
                raise
            except Exception as exc:
                status_code, retry_after, is_transient = self._parse_error_details(exc)

                # Do not retry permanent errors (e.g. 400, 401, 403, 404)
                if not is_transient or status_code in {400, 401, 403, 404}:
                    if status_code in {401, 403}:
                        raise AppException(
                            status_code=502,
                            code="LLM_PROVIDER_ERROR",
                            message="An error occurred while authenticating with the AI service.",
                        )
                    elif status_code == 404:
                        raise AppException(
                            status_code=502,
                            code="LLM_PROVIDER_ERROR",
                            message="The configured AI model is not available. Please verify model settings.",
                        )
                    elif status_code == 400:
                        raise AppException(
                            status_code=502,
                            code="LLM_PROVIDER_ERROR",
                            message="The AI service rejected the tailoring request payload.",
                        )
                    else:
                        raise AppException(
                            status_code=502,
                            code="LLM_PROVIDER_ERROR",
                            message="An error occurred while communicating with the AI service. Please try again.",
                        )

                # Transient error handling with bounded retries and jitter
                if attempt < max_retries:
                    if retry_after is not None:
                        backoff = retry_after + random.uniform(0.05, 0.3)
                    else:
                        backoff = min(6.0, base_delay * (2 ** attempt) + random.uniform(0.1, 0.5))

                    logger.warning(
                        "Transient AI service error (code=%s, attempt=%d/%d); retrying in %.2fs",
                        status_code,
                        attempt + 1,
                        max_retries,
                        backoff,
                    )
                    await asyncio.sleep(backoff)
                    continue

                # Retries exhausted - distinguish 503 high demand / 429 rate limit vs general failure
                if status_code == 503 or "high demand" in str(exc).lower() or "UNAVAILABLE" in str(exc):
                    raise AppException(
                        status_code=502,
                        code="LLM_PROVIDER_ERROR",
                        message="The AI service is currently experiencing high demand. Please try again in a few moments.",
                    )
                elif status_code == 429 or "RESOURCE_EXHAUSTED" in str(exc):
                    raise AppException(
                        status_code=502,
                        code="LLM_PROVIDER_ERROR",
                        message="The AI service rate limit was exceeded. Please try again shortly.",
                    )
                else:
                    raise AppException(
                        status_code=502,
                        code="LLM_PROVIDER_ERROR",
                        message="An error occurred while communicating with the AI service. Please try again.",
                    )

        if not response or not response.text or not response.text.strip():
            raise AppException(
                status_code=502,
                code="LLM_EMPTY_RESPONSE",
                message="The AI provider returned an empty response.",
            )

        # Sanitize potential markdown fence encapsulation
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()

        # Parse JSON
        try:
            data = json.loads(raw_text)
        except json.JSONDecodeError:
            raise AppException(
                status_code=502,
                code="LLM_MALFORMED_OUTPUT",
                message="The AI provider returned malformed JSON output.",
            )

        # Validate against Pydantic contract
        try:
            validated_response = TailoredResumeResponse.model_validate(data)
        except Exception:
            raise AppException(
                status_code=502,
                code="LLM_SCHEMA_VALIDATION_ERROR",
                message="The AI provider output did not match the expected structured resume schema.",
            )

        return validated_response
