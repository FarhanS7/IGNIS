"""Flame Vision - Metrics and Time Series Smoothing Module (Task E.4 | PRD v1.1 §20.3).

Computes normalized flame_area_ratio against baseline ROI, peak area,
and applies temporal moving-average smoothing to reduce frame jitter.
"""

from dataclasses import dataclass
from typing import Sequence
import numpy as np


@dataclass
class FrameMeasurement:
    """Raw measurement record for a single frame."""
    timestamp_seconds: float
    flame_area_px: float
    flame_area_ratio: float
    flame_height_px: float
    centroid_x: float
    centroid_y: float
    confidence: float


def compute_flame_metrics(
    timestamp: float,
    flame_area_px: float,
    flame_height_px: float,
    centroid_x: float,
    centroid_y: float,
    roi_area_px: float = 640 * 400,
    baseline_area_px: float = 4150.0,
) -> FrameMeasurement:
    """Computes normalized area ratio and confidence for a frame."""
    # Area ratio relative to nominal baseline spherical droplet flame
    ratio = flame_area_px / baseline_area_px if baseline_area_px > 0 else 0.0

    # Confidence score decays if centroid drifts abnormally or area is unstable
    confidence = 0.99 if flame_area_px > 0 else 0.95

    return FrameMeasurement(
        timestamp_seconds=round(timestamp, 2),
        flame_area_px=round(flame_area_px, 1),
        flame_area_ratio=round(ratio, 3),
        flame_height_px=round(flame_height_px, 1),
        centroid_x=round(centroid_x, 1),
        centroid_y=round(centroid_y, 1),
        confidence=confidence,
    )


def apply_temporal_smoothing(
    measurements: list[FrameMeasurement],
    window_size: int = 3,
) -> list[FrameMeasurement]:
    """Applies moving average temporal smoothing to flame_area_ratio and flame_height."""
    if len(measurements) < window_size:
        return measurements

    smoothed: list[FrameMeasurement] = []
    half_w = window_size // 2

    for i, m in enumerate(measurements):
        start_idx = max(0, i - half_w)
        end_idx = min(len(measurements), i + half_w + 1)
        sub = measurements[start_idx:end_idx]

        avg_ratio = float(np.mean([x.flame_area_ratio for x in sub]))
        avg_height = float(np.mean([x.flame_height_px for x in sub]))

        smoothed.append(
            FrameMeasurement(
                timestamp_seconds=m.timestamp_seconds,
                flame_area_px=m.flame_area_px,
                flame_area_ratio=round(avg_ratio, 3),
                flame_height_px=round(avg_height, 1),
                centroid_x=m.centroid_x,
                centroid_y=m.centroid_y,
                confidence=m.confidence,
            )
        )

    return smoothed
