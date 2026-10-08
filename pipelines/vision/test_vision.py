"""Tests for Flame Vision CV Pipeline (Tasks E.1–E.5 | PRD v1.1 §20)."""

import pytest
import numpy as np
from pathlib import Path

from pipelines.vision.extract import ROI, extract_synthetic_demo_frames
from pipelines.vision.segment import segment_flame_hsv, rgb_to_hsv
from pipelines.vision.metrics import compute_flame_metrics, apply_temporal_smoothing
from pipelines.vision.export import format_cv_measurements, MODEL_VERSION


def test_roi_crop():
    roi = ROI(x=10, y=20, width=50, height=40)
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    cropped = roi.crop(frame)
    assert cropped.shape == (40, 50, 3)


def test_extract_synthetic_demo_frames():
    frames = list(extract_synthetic_demo_frames(duration_seconds=2.0, fps=2))
    assert len(frames) == 4
    t, f = frames[0]
    assert t == 0.0
    assert f.shape == (400, 640, 3)


def test_segment_flame_hsv_empty():
    blank = np.zeros((100, 100, 3), dtype=np.uint8)
    seg = segment_flame_hsv(blank)
    assert seg.flame_area_px == 0.0
    assert seg.flame_height_px == 0.0


def test_segment_flame_hsv_with_flame():
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    # Bright orange flame box: RGB (240, 140, 40)
    frame[30:70, 30:70] = [240, 140, 40]
    seg = segment_flame_hsv(frame)
    assert seg.flame_area_px == 1600.0 # 40 x 40
    assert seg.flame_height_px == 40.0
    assert 49.0 <= seg.centroid_x <= 50.0
    assert 49.0 <= seg.centroid_y <= 50.0


def test_flame_metrics_and_smoothing():
    raw_measurements = []
    for i in range(5):
        t = i * 0.5
        m = compute_flame_metrics(
            timestamp=t,
            flame_area_px=1000.0 * i,
            flame_height_px=10.0 * i,
            centroid_x=320.0,
            centroid_y=200.0,
        )
        raw_measurements.append(m)

    smoothed = apply_temporal_smoothing(raw_measurements, window_size=3)
    assert len(smoothed) == len(raw_measurements)
    assert smoothed[0].timestamp_seconds == 0.0
    # Smoothed middle element is average of index 1, 2, 3
    expected_avg = (raw_measurements[1].flame_area_ratio + raw_measurements[2].flame_area_ratio + raw_measurements[3].flame_area_ratio) / 3.0
    assert abs(smoothed[2].flame_area_ratio - expected_avg) < 0.01


def test_format_cv_measurements():
    m = compute_flame_metrics(
        timestamp=1.0,
        flame_area_px=2500.0,
        flame_height_px=30.0,
        centroid_x=320.0,
        centroid_y=200.0,
    )
    records = format_cv_measurements([m])
    assert len(records) == 1
    assert records[0]["timestamp_seconds"] == 1.0
    assert records[0]["model_version"] == MODEL_VERSION
    assert "media_asset_id" in records[0]
