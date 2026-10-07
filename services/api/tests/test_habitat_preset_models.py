"""Unit tests for HabitatPreset Pydantic models (Task A.6)."""

from uuid import uuid4
import pytest
from pydantic import ValidationError

from services.api.app.models.enums import DestinationType, MaterialFamily
from services.api.app.models.habitat_preset import (
    HabitatPresetBase,
    HabitatPresetCreate,
    HabitatPresetRead,
)


def test_habitat_preset_minimal_instantiation():
    """HabitatPreset requires slug, display_name, and destination."""
    preset = HabitatPresetBase(
        slug="orbital",
        display_name="Orbital Habitat (0g Microgravity)",
        destination=DestinationType.ORBITAL,
    )
    assert preset.slug == "orbital"
    assert preset.destination == DestinationType.ORBITAL
    assert preset.default_oxygen_pct is None
    assert preset.disclaimer is None


def test_habitat_preset_missing_required_fails():
    """HabitatPresetBase must fail if destination or slug is missing."""
    with pytest.raises(ValidationError):
        HabitatPresetBase(slug="orbital", display_name="Orbital")  # missing destination


def test_habitat_preset_full_round_trip():
    """HabitatPresetRead serializes and deserializes cleanly with defaults and disclaimers."""
    preset_id = uuid4()

    preset_read = HabitatPresetRead(
        id=preset_id,
        slug="moon",
        display_name="Lunar Base Habitat (0.16g)",
        destination=DestinationType.MOON,
        gravity_class="partial_lunar",
        gravity_value_g=0.16,
        external_environment_summary="Surface vacuum with lunar regolith surroundings",
        default_oxygen_pct=32.0,
        default_pressure_kpa=56.0,
        default_airflow_cm_s=8.0,
        default_material=MaterialFamily.FABRIC_COTTON,
        disclaimer="Reference scenario defaults, not universal mission values. Gravity transferability caveat applies.",
        provenance={"source": "NASA Exploration Atmosphere Standards"},
    )

    data = preset_read.model_dump()
    assert data["id"] == preset_id
    assert data["destination"] == "moon"
    assert data["gravity_value_g"] == 0.16
    assert data["default_material"] == "fabric_cotton"

    json_str = preset_read.model_dump_json()
    reconstructed = HabitatPresetRead.model_validate_json(json_str)
    assert reconstructed.id == preset_id
    assert reconstructed.default_oxygen_pct == 32.0
    assert "Gravity transferability caveat" in reconstructed.disclaimer
