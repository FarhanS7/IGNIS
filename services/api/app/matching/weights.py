"""Weight Renormalization and Overall Similarity Scoring (Task B2.4 | PRD v1.1 §15.3, §15.4).

Dynamically redistributes factor weights when experimental runs have missing dimensions,
ensuring available factors sum to exactly 1.0 without penalizing unrecorded telemetry.
"""

# Canonical factor weights from PRD v1.1 §15.3
DEFAULT_WEIGHTS: dict[str, float] = {
    "material_or_fuel": 0.30,
    "oxygen": 0.20,
    "airflow": 0.20,
    "pressure": 0.15,
    "objective": 0.10,
    "geometry": 0.05,
}


def compute_weighted_similarity(
    scores: dict[str, float | None],
    base_weights: dict[str, float] | None = None,
) -> tuple[float | None, dict[str, float]]:
    """Calculates renormalized weighted similarity score over available factors.

    Args:
        scores: Dictionary mapping factor name to its individual similarity in [0.0, 1.0] (or None if missing).
        base_weights: Optional custom base weights dictionary (defaults to DEFAULT_WEIGHTS).

    Returns:
        tuple (overall_score, active_weights):
            overall_score: float in [0.0, 1.0], or None if no factors are available.
            active_weights: dictionary mapping active factors to their renormalized weights summing to 1.0.
    """
    weights = base_weights or DEFAULT_WEIGHTS

    # Filter to factors that have a valid non-None score and a defined weight
    available = {
        factor: score
        for factor, score in scores.items()
        if score is not None and factor in weights
    }

    if not available:
        return None, {}

    total_weight = sum(weights[factor] for factor in available)
    if total_weight <= 0:
        return None, {}

    # Renormalize weights
    renormalized_weights: dict[str, float] = {
        factor: weights[factor] / total_weight for factor in available
    }

    overall_score = sum(
        renormalized_weights[factor] * available[factor] for factor in available
    )

    return overall_score, renormalized_weights
