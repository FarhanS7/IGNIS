"""Matching Engine Package (Module B2 | PRD v1.1 §15)."""

from .numeric import DEFAULT_TOLERANCES, numeric_similarity
from .categorical import categorical_similarity

__all__ = [
    "DEFAULT_TOLERANCES",
    "numeric_similarity",
    "categorical_similarity",
]
