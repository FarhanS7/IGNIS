"""Coverage and Confidence Calculation with Gravity Caps (Task B2.5 | PRD v1.1 §15.5).

Evaluates the breadth of comparable evidence (Coverage) and the reliability of projections (Confidence),
enforcing mandatory confidence caps whenever gravity environment or regime mismatches occur.
"""

from typing import Iterable
from ..models.enums import ConfidenceLevel, CoverageLevel
from .weights import DEFAULT_WEIGHTS


def compute_coverage(
    active_factors: Iterable[str],
    base_weights: dict[str, float] | None = None,
) -> tuple[float, CoverageLevel]:
    """Calculates coverage score based on sum of base weights of available factors.

    Args:
        active_factors: Collection of factor keys present in the comparison.
        base_weights: Baseline weights mapping (defaults to DEFAULT_WEIGHTS).

    Returns:
        tuple (coverage_score, coverage_level):
            coverage_score: float in [0.0, 1.0]
            coverage_level: CoverageLevel.HIGH (>= 0.80), MEDIUM (>= 0.55), or LOW (< 0.55)
    """
    weights = base_weights or DEFAULT_WEIGHTS
    coverage_score = sum(weights[f] for f in set(active_factors) if f in weights)
    coverage_score = min(1.0, max(0.0, coverage_score))

    if coverage_score >= 0.80:
        level = CoverageLevel.HIGH
    elif coverage_score >= 0.55:
        level = CoverageLevel.MEDIUM
    else:
        level = CoverageLevel.LOW

    return coverage_score, level


def compute_confidence(
    coverage_score: float,
    has_gravity_mismatch: bool = False,
    has_major_warning: bool = False,
) -> ConfidenceLevel:
    """Computes confidence rating in the behavioral projection, applying gravity mismatch caps.

    Args:
        coverage_score: Fraction in [0.0, 1.0] representing factor breadth.
        has_gravity_mismatch: If True, caps confidence to at most MEDIUM (PRD v1.1 §15.5).
        has_major_warning: If True, prevents HIGH confidence.

    Returns:
        ConfidenceLevel: HIGH, MEDIUM, or LOW
    """
    if coverage_score >= 0.80 and not has_major_warning:
        confidence = ConfidenceLevel.HIGH
    elif coverage_score >= 0.55:
        confidence = ConfidenceLevel.MEDIUM
    else:
        confidence = ConfidenceLevel.LOW

    # Enforce gravity cap: Moon/Mars scenario matching microgravity or variable flight data
    # can NEVER exceed MEDIUM confidence, even with 100% factor coverage.
    if has_gravity_mismatch and confidence == ConfidenceLevel.HIGH:
        confidence = ConfidenceLevel.MEDIUM

    return confidence
