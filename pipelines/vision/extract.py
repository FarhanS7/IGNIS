"""Flame Vision - Frame Extraction Module (Task E.2 | PRD v1.1 §20.2).

Extracts frames from NASA microgravity combustion video files and applies
Region-of-Interest (ROI) cropping for flame segmentation.
"""

from dataclasses import dataclass
from typing import Generator, Optional
import numpy as np


@dataclass
class ROI:
    """Region of Interest in video frames."""
    x: int
    y: int
    width: int
    height: int

    def crop(self, frame: np.ndarray) -> np.ndarray:
        """Crops a frame to the specified ROI."""
        return frame[self.y : self.y + self.height, self.x : self.x + self.width]


def extract_synthetic_demo_frames(
    duration_seconds: float = 12.0,
    fps: int = 2,
    width: int = 640,
    height: int = 400,
    roi: Optional[ROI] = None,
) -> Generator[tuple[float, np.ndarray], None, None]:
    """Generates synthetic microgravity diffusion flame frames for testing/offline runs.
    
    Simulates a spherical blue/amber diffusion flame that grows, transitions,
    and undergoes radiative extinction around 8.5s.
    """
    total_frames = int(duration_seconds * fps)
    cx, cy = width // 2, height // 2

    for i in range(total_frames):
        t = i / fps
        frame = np.zeros((height, width, 3), dtype=np.uint8)

        # Flame radius dynamics: expands then contracts to extinction
        if t < 0.5:
            # Ignition spark
            radius = int(8 + t * 20)
            color = (255, 200, 100) # Bright yellow-white
        elif t < 4.0:
            # Growth phase
            radius = int(18 + (t - 0.5) * 12)
            color = (240, 140, 40) # Symmetrical orange-blue halo
        elif t < 7.5:
            # Quasi-steady spherical flame
            radius = int(60 + np.sin(t * 2) * 2)
            color = (220, 100, 20) # Blue chemiluminescent rim with amber core
        elif t < 8.5:
            # Quenching / Radiative cool flame transition
            decay = (8.5 - t)
            radius = max(5, int(50 * decay))
            color = (180, 60, 10)
        else:
            # Extinguished
            radius = 0
            color = (0, 0, 0)

        if radius > 0:
            # Draw synthetic concentric flame profile
            # Outer diffusion halo (blue tint in RGB: [30, 100, 255])
            y_grid, x_grid = np.ogrid[:height, :width]
            dist_sq = (x_grid - cx) ** 2 + (y_grid - cy) ** 2
            mask = dist_sq <= radius ** 2
            frame[mask] = color

        if roi:
            yield t, roi.crop(frame)
        else:
            yield t, frame
