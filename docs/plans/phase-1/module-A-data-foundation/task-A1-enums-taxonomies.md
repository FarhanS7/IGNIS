# Task A.1 — Define Canonical Enums and Taxonomies

> **Module:** A — Data Foundation
> **Branch:** `feat/a1-enums-taxonomies`
> **Blocked by:** Nothing (first task)
> **References:** PRD v1.1 §18, §14, §12, §10 | DECISIONS.md D-003, D-013, D-016

---

## Objective

Create all shared enums, string-literal types, and taxonomy constants used across the entire IGNIS backend. Every other module imports from this file.

---

## File to Create

`services/api/app/models/enums.py`

---

## Enums to Define

### 1. GravityEnvironment
```python
class GravityEnvironment(str, Enum):
    MICROGRAVITY = "microgravity"
    PARTIAL_GRAVITY_LUNAR = "partial_gravity_lunar"
    PARTIAL_GRAVITY_MARS = "partial_gravity_mars"
    EARTH_GRAVITY = "earth_gravity"
    VARIABLE = "variable"
    UNKNOWN = "unknown"
```

### 2. FuelType
```python
class FuelType(str, Enum):
    SOLID = "solid"
    LIQUID = "liquid"
    GAS = "gas"
    POLYMER = "polymer"
    FABRIC = "fabric"
    COMPOSITE = "composite"
    UNKNOWN = "unknown"
```

### 3. MaterialFamily
```python
class MaterialFamily(str, Enum):
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
```

### 4. ScientificObjective
```python
class ScientificObjective(str, Enum):
    IGNITION = "ignition"
    FLAME_SPREAD = "flame_spread"
    EXTINCTION = "extinction"
    SUSTAINED_BURNING = "sustained_burning"
    FLAMMABILITY_LIMITS = "flammability_limits"
    SMOKE_DETECTION = "smoke_detection"
    MATERIAL_RESPONSE = "material_response"
    SUPPRESSION = "suppression"
    GENERAL_COMBUSTION = "general_combustion"
```

### 5. EvidenceLevel (NEW v1.1)
```python
class EvidenceLevel(str, Enum):
    A_OBSERVED = "A"           # Observed / NASA Source
    B_NORMALIZED = "B"         # Normalized Source Data
    C_DERIVED = "C"            # Derived by IGNIS
    D_SIMILARITY = "D"         # Similarity-Based Interpretation
    E_AI_SYNTHESIS = "E"       # AI Synthesis
```

### 6. SourceRole (NEW v1.1)
```python
class SourceRole(str, Enum):
    PRIMARY_SCIENTIFIC = "primary_scientific"
    NORMALIZED_SCIENTIFIC = "normalized_scientific"
    CONTEXTUAL = "contextual"
    MEDIA = "media"
    EARTH_OBSERVATION_CONTEXT = "earth_observation_context"
    DERIVED_BY_IGNIS = "derived_by_ignis"
```

### 7. SourceRegistry (NEW v1.1)
```python
class SourceRegistry(str, Enum):
    NASA_OPEN_DATA = "NASA_OPEN_DATA"
    NASA_API = "NASA_API"
    NASA_EARTHDATA = "NASA_EARTHDATA"
    NASA_PSI = "NASA_PSI"
    OTHER_NASA_REPOSITORY = "OTHER_NASA_REPOSITORY"
```

### 8. DestinationType (NEW v1.1)
```python
class DestinationType(str, Enum):
    ORBITAL = "orbital"
    MOON = "moon"
    MARS = "mars"
    CUSTOM = "custom"
```

### 9. EligibilityStatus (NEW v1.1)
```python
class EligibilityStatus(str, Enum):
    ELIGIBLE = "eligible"
    ELIGIBLE_WITH_WARNING = "eligible_with_warning"
    INELIGIBLE = "ineligible"
```

### 10. BehaviorLevel (NEW v1.1)
```python
class BehaviorLevel(str, Enum):
    ELEVATED = "elevated"
    MIXED = "mixed"
    LIMITED = "limited"
    INSUFFICIENT = "insufficient"
```

### 11. CoverageLevel (NEW v1.1)
```python
class CoverageLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
```

### 12. ConfidenceLevel (NEW v1.1)
```python
class ConfidenceLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
```

### 13. ProvenanceSourceType
```python
class ProvenanceSourceType(str, Enum):
    DIRECT = "direct"
    NORMALIZED = "normalized"
    MANUAL_EXTRACTION = "manual_extraction"
    AI_EXTRACTION_REVIEWED = "ai_extraction_reviewed"
    DERIVED_BY_IGNIS = "derived_by_ignis"
```

### 14. DataQuality
```python
class DataQuality(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    UNREVIEWED = "unreviewed"
```

### 15. StoryType (NEW v1.1)
```python
class StoryType(str, Enum):
    SCIENCE_EXPLAINER = "science_explainer"
    EXPERIMENT_STORY = "experiment_story"
    COMPARISON = "comparison"
    EARTHDATA_BRIDGE = "earthdata_bridge"
```

### 16. MediaType
```python
class MediaType(str, Enum):
    VIDEO = "video"
    IMAGE = "image"
    DIAGRAM = "diagram"
    DATA_VISUALIZATION = "data_visualization"
```

---

## Taxonomy Constants

Also export helper structures:

```python
MATERIAL_FAMILY_COMPATIBILITY: dict[MaterialFamily, set[MaterialFamily]] = {
    MaterialFamily.PMMA: {MaterialFamily.PMMA, MaterialFamily.THICK_SOLID},
    MaterialFamily.CELLULOSE: {MaterialFamily.CELLULOSE, MaterialFamily.THIN_SOLID, MaterialFamily.FABRIC_COTTON},
    # ... define which families are considered "compatible" for eligibility
}

GRAVITY_COMPATIBLE: dict[GravityEnvironment, set[GravityEnvironment]] = {
    GravityEnvironment.MICROGRAVITY: {GravityEnvironment.MICROGRAVITY},
    # Moon/Mars are NOT compatible with microgravity — they get warnings
}
```

---

## Subtasks

1. Create `services/api/app/models/` directory with `__init__.py`
2. Create `enums.py` with all 16 enums above
3. Add taxonomy compatibility constants
4. Write unit tests in `services/api/tests/test_enums.py` (verify all enums are valid, compatibility maps are symmetric)
5. Commit: `feat(data): define canonical enums and taxonomies for v1.1 schema`

---

## Acceptance Criteria

- [ ] All 16 enums importable from `services.api.app.models.enums`
- [ ] Every enum member has a string value (for JSON serialization)
- [ ] Compatibility maps exist for material family and gravity environment
- [ ] Tests pass
