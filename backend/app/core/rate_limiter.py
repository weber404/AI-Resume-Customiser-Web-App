import time
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import Request

from app.core.config import Settings
from app.core.exceptions import AppException


class InMemoryRateLimiter:
    """Sliding-window in-memory rate limiter.

    Maintains request timestamps per client IP. Cleans expired entries automatically
    to avoid unbounded memory growth. Zero persistent storage or external cache needed.
    """

    def __init__(self, requests_per_window: int = 10, window_seconds: float = 60.0):
        self.requests_per_window = requests_per_window
        self.window_seconds = window_seconds
        self._records: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, client_id: str, max_requests: int = None) -> Tuple[bool, int]:
        """Check if request is allowed for client_id.

        Returns:
            Tuple of (allowed: bool, retry_after_seconds: int)
        """
        now = time.time()
        limit = max_requests if max_requests is not None else self.requests_per_window
        window_start = now - self.window_seconds

        # Clean timestamps older than current sliding window
        valid_timestamps = [ts for ts in self._records.get(client_id, []) if ts > window_start]

        if not valid_timestamps:
            self._records.pop(client_id, None)
        else:
            self._records[client_id] = valid_timestamps

        if len(valid_timestamps) >= limit:
            oldest = valid_timestamps[0]
            retry_after = max(1, int(oldest + self.window_seconds - now) + 1)
            return False, retry_after

        # Record this request timestamp
        self._records[client_id].append(now)
        return True, 0

    def reset(self) -> None:
        """Reset all rate limiter state. Primarily used in test suites."""
        self._records.clear()


# Global singleton instance for the tailoring endpoint
tailor_rate_limiter = InMemoryRateLimiter(requests_per_window=10, window_seconds=60.0)


def get_client_ip(request: Request) -> str:
    """Extract client IP address safely, checking X-Forwarded-For when behind a proxy."""
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


def check_tailor_rate_limit(request: Request, settings: Settings) -> None:
    """FastAPI guard checking whether the client IP has exceeded the tailoring rate limit."""
    if not settings.rate_limit_enabled:
        return

    client_ip = get_client_ip(request)
    allowed, retry_after = tailor_rate_limiter.is_allowed(
        client_id=client_ip,
        max_requests=settings.rate_limit_tailor_requests_per_minute,
    )

    if not allowed:
        raise AppException(
            status_code=429,
            code="RATE_LIMIT_EXCEEDED",
            message=f"Too many resume tailoring requests. Please wait {retry_after} second(s) before trying again.",
            details={"retry_after_seconds": retry_after},
        )
