"""Unit tests for canonical enums and taxonomies (Task A.1)."""

import json
import pytest
from services.api.app.models.enums import (
    BehaviorLevel,
    ConfidenceLevel,
    CoverageLevel,
    DataQuality,
    DestinationType,
    EligibilityStatus,
    EvidenceLevel,
    FuelType,
    GravityEnvironment,
    MaterialFamily,
    MediaType,
    ProvenanceSourceType,
    ScientificObjective,
    SourceRegistry,
    SourceRole,
    StoryType,
    MATERIAL_FAMILY_COMPATIBILITY,
    GRAVITY_COMPATIBLE,
)


ALL_ENUM_CLASSES = [
    GravityEnvironment,
    FuelType,
    MaterialFamily,
    ScientificObjective,
    EvidenceLevel,
    SourceRole,
    SourceRegistry,
    DestinationType,
    EligibilityStatus,
    BehaviorLevel,
    CoverageLevel,
    ConfidenceLevel,
    ProvenanceSourceType,
    DataQuality,
    StoryType,
    MediaType,
]


def test_enum_count_is_sixteen():
    """Verify that all 16 canonical enums specified in Task A.1 are defined."""
    assert len(ALL_ENUM_CLASSES) == 16


@pytest.mark.parametrize("enum_cls", ALL_ENUM_CLASSES)
def test_all_enum_members_are_strings(enum_cls):
    """Every enum member must be a string for seamless JSON serialization."""
    for member in enum_cls:
        assert isinstance(member.value, str)
        assert len(member.value) > 0
        # Verify JSON serialization works directly
        serialized = json.dumps({"key": member})
        assert member.value in serialized


def test_evidence_levels_cover_five_tiers():
    """EvidenceLevel must cover the 5 PRD trust tiers: A, B, C, D, E."""
    expected = {"A", "B", "C", "D", "E"}
    actual = {m.value for m in EvidenceLevel}
    assert actual == expected


def test_gravity_environment_regimes():
    """GravityEnvironment must include orbital microgravity and exploration lunar/mars."""
    assert GravityEnvironment.MICROGRAVITY.value == "microgravity"
    assert GravityEnvironment.PARTIAL_GRAVITY_LUNAR.value == "partial_gravity_lunar"
    assert GravityEnvironment.PARTIAL_GRAVITY_MARS.value == "partial_gravity_mars"
    assert GravityEnvironment.EARTH_GRAVITY.value == "earth_gravity"


def test_source_registry_providers():
    """SourceRegistry must include the required NASA data channels."""
    assert SourceRegistry.NASA_OPEN_DATA.value == "NASA_OPEN_DATA"
    assert SourceRegistry.NASA_API.value == "NASA_API"
    assert SourceRegistry.NASA_EARTHDATA.value == "NASA_EARTHDATA"
    assert SourceRegistry.NASA_PSI.value == "NASA_PSI"


def test_material_family_compatibility_self_reflexive():
    """Every defined material family (except UNKNOWN) must be compatible with itself."""
    for fam in MaterialFamily:
        if fam == MaterialFamily.UNKNOWN:
            assert MATERIAL_FAMILY_COMPATIBILITY[fam] == set()
        else:
            assert fam in MATERIAL_FAMILY_COMPATIBILITY[fam]


def test_material_family_compatibility_symmetry():
    """Material family compatibility must be symmetric between matched pairs."""
    for fam_a, compatible_set in MATERIAL_FAMILY_COMPATIBILITY.items():
        for fam_b in compatible_set:
            assert fam_a in MATERIAL_FAMILY_COMPATIBILITY[fam_b], (
                f"Asymmetric compatibility: {fam_a} -> {fam_b} but not {fam_b} -> {fam_a}"
            )


def test_gravity_compatibility_rules():
    """Microgravity is only directly compatible with microgravity (Moon/Mars require caveats)."""
    assert GRAVITY_COMPATIBLE[GravityEnvironment.MICROGRAVITY] == {GravityEnvironment.MICROGRAVITY}
    assert GravityEnvironment.MICROGRAVITY not in GRAVITY_COMPATIBLE[GravityEnvironment.PARTIAL_GRAVITY_LUNAR]
    assert GravityEnvironment.MICROGRAVITY not in GRAVITY_COMPATIBLE[GravityEnvironment.PARTIAL_GRAVITY_MARS]
