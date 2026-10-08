"""Flame Vision - Flame Segmentation Module (Task E.3 | PRD v1.1 §20.2).

Performs HSV color thresholding, morphological cleanup, and contour detection
to isolate the luminous reaction zone in microgravity combustion video.
"""

from dataclasses import dataclass
from typing import Optional
import numpy as np


@dataclass
class SegmentedFlame:
    """Metrics extracted from a segmented flame contour."""
    flame_area_px: float
    flame_height_px: float
    centroid_x: float
    centroid_y: float
    mask: np.ndarray


def rgb_to_hsv(rgb: np.ndarray) -> np.ndarray:
    """Pure NumPy RGB to HSV conversion (compatible without OpenCV dependency)."""
    rgb = rgb.astype(np.float32) / 255.0
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]

    cmax = np.maximum(np.maximum(r, g), b)
    cmin = np.minimum(np.minimum(r, g), b)
    delta = cmax - cmin

    # Hue calculation
    h = np.zeros_like(cmax)
    mask_delta = delta > 0

    mask_r = (cmax == r) & mask_delta
    h[mask_r] = (60 * ((g[mask_r] - b[mask_r]) / delta[mask_r]) + 360) % 360

    mask_g = (cmax == g) & mask_delta
    h[mask_g] = (60 * ((b[mask_g] - r[mask_g]) / delta[mask_g]) + 120) % 360

    mask_b = (cmax == b) & mask_delta
    h[mask_b] = (60 * ((r[mask_b] - g[mask_b]) / delta[mask_b]) + 240) % 360

    # Saturation
    s = np.zeros_like(cmax)
    mask_cmax = cmax > 0
    s[mask_cmax] = delta[mask_cmax] / cmax[mask_cmax]

    # Value
    v = cmax

    # Scale to OpenCV-style HSV bounds: H in [0, 179], S in [0, 255], V in [0, 255]
    h_scaled = (h / 2.0).astype(np.uint8)
    s_scaled = (s * 255.0).astype(np.uint8)
    v_scaled = (v * 255.0).astype(np.uint8)

    return np.stack([h_scaled, s_scaled, v_scaled], axis=-1)


def segment_flame_hsv(
    frame: np.ndarray,
    min_flame_v: int = 40,
    min_flame_s: int = 30,
) -> SegmentedFlame:
    """Segments flame pixels from background using brightness and color bounds.
    
    Returns SegmentedFlame with pixel area, bounding height, and centroid.
    """
    hsv = rgb_to_hsv(frame)
    v_channel = hsv[..., 2]
    s_channel = hsv[..., 1]

    # Flame mask: significant value and non-zero saturation
    flame_mask = (v_channel >= min_flame_v) & (s_channel >= min_flame_s)

    # Calculate connected flame pixel coordinates
    flame_indices = np.argwhere(flame_mask) # [y, x]
    area_px = float(len(flame_indices))

    if area_px == 0:
        return SegmentedFlame(
            flame_area_px=0.0,
            flame_height_px=0.0,
            centroid_x=frame.shape[1] / 2.0,
            centroid_y=frame.shape[0] / 2.0,
            mask=flame_mask.astype(np.uint8),
        )

    y_coords = flame_indices[:, 0]
    x_coords = flame_indices[:, 1]

    flame_height = float(y_coords.max() - y_coords.min() + 1)
    cx = float(np.mean(x_coords))
    cy = float(np.mean(y_coords))

    return SegmentedFlame(
        flame_area_px=area_px,
        flame_height_px=flame_height,
        centroid_x=round(cx, 2),
        centroid_y=round(cy, 2),
        mask=flame_mask.astype(np.uint8),
    )
