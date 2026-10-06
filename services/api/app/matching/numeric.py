"""Numeric Similarity Function (Task B2.1 | PRD v1.1 §15.2).

Computes linear normalized similarity between continuous environmental parameters:
similarity(x, y, tolerance) = max(0, 1 - abs(x - y) / tolerance)
"""

DEFAULT_TOLERANCES: dict[str, float] = {
    "oxygen_pct": 10.0,    # percentage points
    "pressure_kpa": 30.0,  # kPa
    "airflow_cm_s": 15.0,  # cm/s
}


def numeric_similarity(
    x: float | None,
    y: float | None,
    tolerance: float,
) -> float | None:
    """Computes bounded linear similarity in [0.0, 1.0] between two numeric values.

    Returns:
        float in [0.0, 1.0] if both values are valid numbers.
        None if either value is None (indicating missing factor to be handled by weight renormalization).
    """
    if x is None or y is None:
        return None

    if tolerance <= 0:
        raise ValueError("Tolerance must be strictly positive.")

    diff = abs(x - y)
    score = 1.0 - (diff / tolerance)
    return max(0.0, min(1.0, score))
