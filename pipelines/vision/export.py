"""Flame Vision - Export Measurements Module (Task E.5 | PRD v1.1 §20.4).

Exports smoothed flame time-series measurements formatted strictly according
to the CVMeasurement database schema.
"""

import json
import uuid
from pathlib import Path
from typing import Any

from .metrics import FrameMeasurement

MODEL_VERSION = "ignis-cv-hsv-v1.0.0"
PROVENANCE_LABEL = "Derived by IGNIS computer vision - not an official NASA measurement unless explicitly sourced as such."


def format_cv_measurements(
    measurements: list[FrameMeasurement],
    media_asset_id: str = "44444444-4444-4444-4444-444444444401",
) -> list[dict[str, Any]]:
    """Formats frame measurements as canonical CVMeasurement database records."""
    records: list[dict[str, Any]] = []

    for i, m in enumerate(measurements):
        record = {
            "id": f"77777777-7777-7777-7777-77777777{i:04d}",
            "media_asset_id": media_asset_id,
            "timestamp_seconds": m.timestamp_seconds,
            "flame_area_px": m.flame_area_px,
            "flame_area_ratio": m.flame_area_ratio,
            "flame_height_px": m.flame_height_px,
            "centroid_x": m.centroid_x,
            "centroid_y": m.centroid_y,
            "confidence": m.confidence,
            "model_version": MODEL_VERSION,
        }
        records.append(record)

    return records


def save_measurements_json(records: list[dict[str, Any]], output_path: Path) -> None:
    """Writes formatted CVMeasurement records to a JSON file."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)
