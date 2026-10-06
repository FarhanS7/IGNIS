"""Standard error types and codes (ARCHITECTURE.md §4)."""

from enum import Enum
from typing import Any


class ErrorCode(str, Enum):
    EXPERIMENT_NOT_FOUND = "EXPERIMENT_NOT_FOUND"
    PRESET_NOT_FOUND = "PRESET_NOT_FOUND"
    SOURCE_NOT_FOUND = "SOURCE_NOT_FOUND"
    STORY_NOT_FOUND = "STORY_NOT_FOUND"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"


class IgnisException(Exception):
    """Base application exception returning structured API error JSON."""

    def __init__(
        self,
        code: ErrorCode,
        message: str,
        status_code: int = 400,
        details: dict[str, Any] | None = None,
    ):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}

    def to_dict(self) -> dict[str, Any]:
        return {
            "error": {
                "code": self.code.value,
                "message": self.message,
                "details": self.details,
            }
        }
