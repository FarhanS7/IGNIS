"""Canonical enums and taxonomies for IGNIS v1.1.

Reference: PRD v1.1 §18, §14, §12, §10 | DECISIONS.md D-003, D-013, D-016.
All enums inherit from (str, Enum) for seamless Pydantic/JSON serialization.
"""

from enum import Enum


class GravityEnvironment(str, Enum):
    """Gravitational regime for combustion experiments and habitat conditions."""
    MICROGRAVITY = "microgravity"
    PARTIAL_GRAVITY_LUNAR = "partial_gravity_lunar"
    PARTIAL_GRAVITY_MARS = "partial_gravity_mars"
    EARTH_GRAVITY = "earth_gravity"
    VARIABLE = "variable"
    UNKNOWN = "unknown"


class FuelType(str, Enum):
    """Broad physical/chemical phase or category of the fuel sample."""
    SOLID = "solid"
    LIQUID = "liquid"
    GAS = "gas"
    POLYMER = "polymer"
    FABRIC = "fabric"
    COMPOSITE = "composite"
    UNKNOWN = "unknown"


class MaterialFamily(str, Enum):
    """Standardized material classification for combustion testing."""
    PMMA = "pmma"
    CELLULOSE = "cellulose"
    POLYETHYLENE = "polyethylene"
    FABRIC_COTTON = "fabric_cotton"
    FABRIC_SYNTHETIC = "fabric_synthetic"
    THIN_SOLID = "thin_solid"
    THICK_SOLID = "thick_solid"
    DROPLET_FUEL = "droplet_fuel"
    GAS_FUEL = "gas_fuel"
    COMPOSITE = "composite"
    OTHER = "other"
    UNKNOWN = "unknown"


class ScientificObjective(str, Enum):
    """Primary investigation goals of NASA combustion experiments."""
    IGNITION = "ignition"
    FLAME_SPREAD = "flame_spread"
    EXTINCTION = "extinction"
    SUSTAINED_BURNING = "sustained_burning"
    FLAMMABILITY_LIMITS = "flammability_limits"
    SMOKE_DETECTION = "smoke_detection"
    MATERIAL_RESPONSE = "material_response"
    SUPPRESSION = "suppression"
    GENERAL_COMBUSTION = "general_combustion"


class EvidenceLevel(str, Enum):
    """Five-level authority tier for IGNIS data provenance (PRD v1.1 §13)."""
    A_OBSERVED = "A"          # Level A: Directly measured in NASA flight / raw drop-tower telemetry
    B_NORMALIZED = "B"        # Level B: Normalized, unit-converted metadata tables with verified DOI
    C_DERIVED = "C"           # Level C: Computed scientific metrics (CV flame area, growth curve, centroid)
    D_SIMILARITY = "D"        # Level D: Mathematical vector similarity interpretation
    E_AI_SYNTHESIS = "E"      # Level E: Grounded natural-language LLM synthesis strictly constrained to evidence


class SourceRole(str, Enum):
    """Functional role of an ingested data source in the platform."""
    PRIMARY_SCIENTIFIC = "primary_scientific"
    NORMALIZED_SCIENTIFIC = "normalized_scientific"
    CONTEXTUAL = "contextual"
    MEDIA = "media"
    EARTH_OBSERVATION_CONTEXT = "earth_observation_context"
    DERIVED_BY_IGNIS = "derived_by_ignis"


class SourceRegistry(str, Enum):
    """Recognized NASA archives and registry providers."""
    NASA_OPEN_DATA = "NASA_OPEN_DATA"
    NASA_API = "NASA_API"
    NASA_EARTHDATA = "NASA_EARTHDATA"
    NASA_PSI = "NASA_PSI"
    OTHER_NASA_REPOSITORY = "OTHER_NASA_REPOSITORY"


class DestinationType(str, Enum):
    """Exploration mission habitat destinations."""
    ORBITAL = "orbital"
    MOON = "moon"
    MARS = "mars"
    CUSTOM = "custom"


class EligibilityStatus(str, Enum):
    """Comparable-evidence gate state prior to similarity scoring (PRD v1.1 §14)."""
    ELIGIBLE = "eligible"
    ELIGIBLE_WITH_WARNING = "eligible_with_warning"
    INELIGIBLE = "ineligible"


class BehaviorLevel(str, Enum):
    """Observed flame behavior intensity / evidence classification."""
    ELEVATED = "elevated"
    MIXED = "mixed"
    LIMITED = "limited"
    INSUFFICIENT = "insufficient"


class CoverageLevel(str, Enum):
    """Breadth of relevant NASA flight evidence backing a scenario."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ConfidenceLevel(str, Enum):
    """Confidence in behavioral projection considering caveats and gaps."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ProvenanceSourceType(str, Enum):
    """Origin channel of an individual field in a provenance record."""
    DIRECT = "direct"
    NORMALIZED = "normalized"
    MANUAL_EXTRACTION = "manual_extraction"
    AI_EXTRACTION_REVIEWED = "ai_extraction_reviewed"
    DERIVED_BY_IGNIS = "derived_by_ignis"


class DataQuality(str, Enum):
    """Quality rating of ingested experimental datasets."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    UNREVIEWED = "unreviewed"


class StoryType(str, Enum):
    """Narrative typology for Explore Fire science stories."""
    SCIENCE_EXPLAINER = "science_explainer"
    EXPERIMENT_STORY = "experiment_story"
    COMPARISON = "comparison"
    EARTHDATA_BRIDGE = "earthdata_bridge"


class MediaType(str, Enum):
    """Media asset format."""
    VIDEO = "video"
    IMAGE = "image"
    DIAGRAM = "diagram"
    DATA_VISUALIZATION = "data_visualization"


# =============================================================================
# TAXONOMY COMPATIBILITY MAPS
# Used by Module B1 (Eligibility Filter) to prevent scientifically invalid matches.
# =============================================================================

MATERIAL_FAMILY_COMPATIBILITY: dict[MaterialFamily, set[MaterialFamily]] = {
    MaterialFamily.PMMA: {
        MaterialFamily.PMMA,
        MaterialFamily.THICK_SOLID,
    },
    MaterialFamily.CELLULOSE: {
        MaterialFamily.CELLULOSE,
        MaterialFamily.THIN_SOLID,
        MaterialFamily.FABRIC_COTTON,
    },
    MaterialFamily.POLYETHYLENE: {
        MaterialFamily.POLYETHYLENE,
        MaterialFamily.THICK_SOLID,
    },
    MaterialFamily.FABRIC_COTTON: {
        MaterialFamily.FABRIC_COTTON,
        MaterialFamily.CELLULOSE,
        MaterialFamily.THIN_SOLID,
    },
    MaterialFamily.FABRIC_SYNTHETIC: {
        MaterialFamily.FABRIC_SYNTHETIC,
        MaterialFamily.THIN_SOLID,
    },
    MaterialFamily.THIN_SOLID: {
        MaterialFamily.THIN_SOLID,
        MaterialFamily.CELLULOSE,
        MaterialFamily.FABRIC_COTTON,
        MaterialFamily.FABRIC_SYNTHETIC,
    },
    MaterialFamily.THICK_SOLID: {
        MaterialFamily.THICK_SOLID,
        MaterialFamily.PMMA,
        MaterialFamily.POLYETHYLENE,
    },
    MaterialFamily.DROPLET_FUEL: {
        MaterialFamily.DROPLET_FUEL,
    },
    MaterialFamily.GAS_FUEL: {
        MaterialFamily.GAS_FUEL,
    },
    MaterialFamily.COMPOSITE: {
        MaterialFamily.COMPOSITE,
    },
    MaterialFamily.OTHER: {
        MaterialFamily.OTHER,
    },
    MaterialFamily.UNKNOWN: set(),
}

GRAVITY_COMPATIBLE: dict[GravityEnvironment, set[GravityEnvironment]] = {
    GravityEnvironment.MICROGRAVITY: {
        GravityEnvironment.MICROGRAVITY,
    },
    GravityEnvironment.PARTIAL_GRAVITY_LUNAR: {
        GravityEnvironment.PARTIAL_GRAVITY_LUNAR,
    },
    GravityEnvironment.PARTIAL_GRAVITY_MARS: {
        GravityEnvironment.PARTIAL_GRAVITY_MARS,
    },
    GravityEnvironment.EARTH_GRAVITY: {
        GravityEnvironment.EARTH_GRAVITY,
    },
    GravityEnvironment.VARIABLE: {
        GravityEnvironment.VARIABLE,
    },
    GravityEnvironment.UNKNOWN: set(),
}
