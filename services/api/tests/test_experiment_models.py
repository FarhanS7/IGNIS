"""Unit tests for Experiment & ExperimentRun Pydantic models (Task A.2)."""

from datetime import datetime, timezone
import json
from uuid import uuid4
import pytest
from pydantic import ValidationError

from services.api.app.models.enums import (
    DataQuality,
    FuelType,
    GravityEnvironment,
    MaterialFamily,
    ScientificObjective,
)
from services.api.app.models.experiment import (
    ExperimentBase,
    ExperimentCreate,
    ExperimentRead,
    ExperimentRunBase,
    ExperimentRunCreate,
    ExperimentRunRead,
)


def test_experiment_minimal_instantiation():
    """Experiment requires family and title; others default to None or empty."""
    exp = ExperimentBase(
        experiment_family="Saffire",
        title="Spacecraft Fire Experiment II",
    )
    assert exp.experiment_family == "Saffire"
    assert exp.title == "Spacecraft Fire Experiment II"
    assert exp.external_id is None
    assert exp.source_id is None
    assert exp.summary is None
    assert exp.mission_platform is None
    assert exp.gravity_environment is None
    assert exp.objectives == []
    assert exp.source_url is None


def test_experiment_full_validation_and_serialization():
    """Experiment validates enums, UUIDs, and serializes round-trip."""
    exp_id = uuid4()
    source_id = uuid4()
    now = datetime.now(timezone.utc)

    exp_read = ExperimentRead(
        id=exp_id,
        source_id=source_id,
        external_id="SAFFIRE-II-01",
        experiment_family="Saffire",
        title="Saffire-II Fabric and Acrylic Studies",
        summary="Large scale flame spread aboard Cygnus",
        mission_platform="Cygnus OA-5",
        gravity_environment=GravityEnvironment.MICROGRAVITY,
        objectives=[ScientificObjective.FLAME_SPREAD, ScientificObjective.EXTINCTION],
        source_url="https://psi.nasa.gov/saffire",
        created_at=now,
        updated_at=now,
    )

    data = exp_read.model_dump()
    assert data["id"] == exp_id
    assert data["gravity_environment"] == "microgravity"
    assert data["objectives"] == ["flame_spread", "extinction"]

    json_str = exp_read.model_dump_json()
    reconstructed = ExperimentRead.model_validate_json(json_str)
    assert reconstructed.id == exp_id
    assert reconstructed.title == exp_read.title
    assert reconstructed.gravity_environment == GravityEnvironment.MICROGRAVITY


def test_experiment_missing_required_fields_fails():
    """ExperimentBase must fail if title or family is missing."""
    with pytest.raises(ValidationError):
        ExperimentBase(experiment_family="Saffire")  # missing title

    with pytest.raises(ValidationError):
        ExperimentBase(title="Some title")  # missing experiment_family


def test_experiment_run_instantiation_with_provenance():
    """ExperimentRunBase requires experiment_id; supports PRD §18.10 provenance dict."""
    exp_id = uuid4()
    run_id = uuid4()

    provenance_doc = {
        "field": "oxygen_pct",
        "value": 21.0,
        "source_type": "normalized",
        "source_location": "table 2 / row 14",
        "reviewed": True,
    }

    run_read = ExperimentRunRead(
        id=run_id,
        experiment_id=exp_id,
        run_label="Run 14 - PMMA Benchmark",
        fuel_type=FuelType.POLYMER,
        material=MaterialFamily.PMMA,
        geometry="5cm x 30cm slab",
        gravity_environment=GravityEnvironment.MICROGRAVITY,
        oxygen_pct=21.0,
        pressure_kpa=101.3,
        airflow_cm_s=20.0,
        ignition_observed=True,
        extinction_observed=False,
        flame_spread_observed=True,
        observation_summary="Steady flame spread at 0.5 mm/s",
        data_quality=DataQuality.HIGH,
        provenance=provenance_doc,
        created_at=datetime.now(timezone.utc),
    )

    assert run_read.material == MaterialFamily.PMMA
    assert run_read.oxygen_pct == 21.0
    assert run_read.provenance["source_type"] == "normalized"

    # JSON round trip
    json_str = run_read.model_dump_json()
    reconstructed = ExperimentRunRead.model_validate_json(json_str)
    assert reconstructed.id == run_id
    assert reconstructed.material == MaterialFamily.PMMA
    assert reconstructed.provenance["value"] == 21.0


def test_experiment_run_missing_experiment_id_fails():
    """ExperimentRunBase must fail if experiment_id is not provided."""
    with pytest.raises(ValidationError):
        ExperimentRunBase(run_label="No parent experiment")
