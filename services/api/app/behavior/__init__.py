"""Fire Behavior Profile Package (Module B2 | PRD v1.1 §10.4, §16.5)."""

from .profile import (
    BehaviorDimension,
    BehaviorProfile,
    build_behavior_profile,
)

__all__ = [
    "BehaviorDimension",
    "BehaviorProfile",
    "build_behavior_profile",
]
