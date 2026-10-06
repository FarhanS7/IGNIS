"""Matching Engine Package (Module B2 | PRD v1.1 §15)."""

from .numeric import DEFAULT_TOLERANCES, numeric_similarity
from .categorical import categorical_similarity
from .objective import objective_overlap
from .weights import DEFAULT_WEIGHTS, compute_weighted_similarity
from .coverage import compute_coverage, compute_confidence
from .models import AnalysisResult, EvidenceMatch, FactorExplanation
from .orchestrator import run_scenario_analysis

__all__ = [
    "DEFAULT_TOLERANCES",
    "numeric_similarity",
    "categorical_similarity",
    "objective_overlap",
    "DEFAULT_WEIGHTS",
    "compute_weighted_similarity",
    "compute_coverage",
    "compute_confidence",
    "AnalysisResult",
    "EvidenceMatch",
    "FactorExplanation",
    "run_scenario_analysis",
]
