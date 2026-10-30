"""Rigorous unit tests for NASA PSI evidence runs and epistemic data contracts.
Fails if:
  1. Any run or measurement lacks a source (file, column, row);
  2. Any value lacks an epistemic basis;
  3. Any assumed value is displayed without 'assumed' basis in output;
  4. Row counts differ from manifest/data inventory (1,401 total);
  5. Any converted value is outside its physical calibration range;
  6. Any run fails Pydantic EvidenceRun model validation.
"""

import os
import json
import pytest
from services.api.app.models.evidence_run import EvidenceRun, EvidenceValue

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
EVIDENCE_RUNS_PATH = os.path.join(PROCESSED_DIR, "evidence_runs.json")
EVIDENCE_SOLID_PATH = os.path.join(PROCESSED_DIR, "evidence_solid.json")

VALID_BASES = {"measured", "converted", "assumed", "missing"}
MEASUREMENT_FIELDS = [
    "oxygen_pct",
    "pressure_kpa",
    "flow_cm_s",
    "ignited",
    "extinguished",
    "spread_rate_mm_s",
    "burn_time_s",
]

EXPECTED_COUNTS_PER_INV = {
    "PSI-10": 327,   # 207 Normal + 120 Inverse
    "PSI-20": 18,
    "PSI-21": 32,
    "PSI-22": 32,
    "PSI-23": 18,
    "PSI-25": 129,   # BASS-II
    "PSI-26": 122,   # BASS-I
    "PSI-39": 87,    # CFI
    "PSI-68": 8,     # FLEX-2
    "PSI-69": 274,   # FLEX
    "PSI-98": 4,     # Saffire-I
    "PSI-99": 15,    # Saffire-II
    "PSI-100": 2,    # Saffire-III
    "PSI-159": 333,  # 179 Normal + 154 Inverse
}


@pytest.fixture(scope="module")
def evidence_runs():
    assert os.path.exists(EVIDENCE_RUNS_PATH), f"Missing {EVIDENCE_RUNS_PATH}"
    with open(EVIDENCE_RUNS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def solid_runs():
    assert os.path.exists(EVIDENCE_SOLID_PATH), f"Missing {EVIDENCE_SOLID_PATH}"
    with open(EVIDENCE_SOLID_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def test_no_run_or_value_lacks_source(evidence_runs):
    """FAIL if any run or measurement lacks source_file, source_column, or source_row."""
    for idx, run in enumerate(evidence_runs):
        uid = run.get("run_uid", f"Run-{idx}")
        assert run.get("doi"), f"Run {uid} missing DOI"
        assert run.get("investigation_id"), f"Run {uid} missing investigation_id"
        assert run.get("platform"), f"Run {uid} missing platform"
        assert run.get("gravity_regime"), f"Run {uid} missing gravity_regime"

        for field in MEASUREMENT_FIELDS:
            ev = run.get(field)
            assert ev is not None, f"Run {uid} missing field {field}"
            assert isinstance(ev, dict), f"Run {uid} field {field} is not a dict"
            assert "source_file" in ev and ev["source_file"], f"Run {uid} field {field} missing source_file"
            assert "source_column" in ev and ev["source_column"], f"Run {uid} field {field} missing source_column"
            assert "source_row" in ev and isinstance(ev["source_row"], int), f"Run {uid} field {field} missing source_row"
            assert ev["source_row"] >= 2, f"Run {uid} field {field} source_row must be >= 2 (line 1 is header)"


def test_no_value_lacks_basis(evidence_runs):
    """FAIL if any measurement value lacks an epistemological basis or has an invalid basis."""
    for idx, run in enumerate(evidence_runs):
        uid = run.get("run_uid", f"Run-{idx}")
        for field in MEASUREMENT_FIELDS:
            ev = run.get(field)
            assert "basis" in ev, f"Run {uid} field {field} lacks basis"
            basis = ev["basis"]
            assert basis in VALID_BASES, f"Run {uid} field {field} has invalid basis '{basis}'. Must be one of {VALID_BASES}"
            
            # If basis is missing, value must be None
            if basis == "missing":
                assert ev["value"] is None, f"Run {uid} field {field} has basis='missing' but value={ev['value']} is not None"
            # If basis is measured, value must be present unless boolean indeterminate
            elif basis in ["measured", "converted", "assumed"]:
                assert ev["value"] is not None or field in ["spread_rate_mm_s", "burn_time_s", "co_ppm", "co2_pct"], (
                    f"Run {uid} field {field} has basis='{basis}' but value is None"
                )


def test_no_assumed_value_without_basis(evidence_runs):
    """FAIL if any assumed value is represented as measured or converted."""
    for run in evidence_runs:
        uid = run["run_uid"]
        inv = run["investigation_id"]
        
        # Solid-fuel pressure is ASSUMED in BASS and Saffire
        if inv in ["PSI-25", "PSI-26", "PSI-98", "PSI-99", "PSI-100"]:
            p = run["pressure_kpa"]
            assert p["basis"] == "assumed", (
                f"Solid flight run {uid} in {inv} must have pressure basis='assumed', got '{p['basis']}'"
            )
            assert p["value"] == 101.325, f"Solid flight run {uid} in {inv} assumed pressure must be 101.325 kPa"
            assert "spec" in p["source_column"].lower() or "nominal" in p["source_column"].lower(), (
                f"Solid flight run {uid} assumed pressure source_column must cite nominal spec"
            )

        # BASS-I oxygen is ASSUMED
        if inv == "PSI-26":
            o2 = run["oxygen_pct"]
            assert o2["basis"] == "assumed", (
                f"BASS-I run {uid} must have oxygen basis='assumed', got '{o2['basis']}'"
            )
            assert o2["value"] == 20.9, f"BASS-I run {uid} assumed O2 must be 20.9%"


def test_row_counts_match_manifest_and_inventory(evidence_runs, solid_runs):
    """FAIL if row counts differ from the 1,401 total or per-investigation manifest counts."""
    assert len(evidence_runs) == 1401, f"Expected exactly 1,401 runs, got {len(evidence_runs)}"
    assert len(solid_runs) == 272, f"Expected exactly 272 solid runs, got {len(solid_runs)}"

    actual_counts = {}
    tier_counts = {"solid": 0, "droplet": 0, "gas": 0}

    for r in evidence_runs:
        inv = r["investigation_id"]
        actual_counts[inv] = actual_counts.get(inv, 0) + 1
        tier_counts[r["fuel_class"]] += 1

    assert tier_counts["solid"] == 272, f"Solid tier count mismatch: {tier_counts['solid']} != 272"
    assert tier_counts["droplet"] == 282, f"Droplet tier count mismatch: {tier_counts['droplet']} != 282"
    assert tier_counts["gas"] == 847, f"Gas tier count mismatch: {tier_counts['gas']} != 847"

    for inv, expected_count in EXPECTED_COUNTS_PER_INV.items():
        actual = actual_counts.get(inv, 0)
        assert actual == expected_count, f"Investigation {inv} count mismatch: got {actual}, expected {expected_count}"


def test_converted_values_within_calibration_range(evidence_runs):
    """FAIL if any converted airflow or pressure value falls outside its physical calibration range."""
    for run in evidence_runs:
        uid = run["run_uid"]
        inv = run["investigation_id"]

        # 1. BASS-II flow conversion bounds check
        if inv == "PSI-25" and run["flow_cm_s"]["basis"] == "converted":
            flow = run["flow_cm_s"]["value"]
            assert flow is not None, f"Run {uid} has converted flow but value is None"
            assert flow >= 0.0, f"Run {uid} converted flow {flow} cm/s cannot be negative"
            # Calibration max for restrictor 0 is 29.2 cm/s; maximum observed air display transient <= 45 cm/s
            assert flow <= 45.0, f"Run {uid} converted flow {flow} cm/s exceeds maximum calibration bounds (45 cm/s)"

        # 2. FLEX pressure conversion bounds check (mmHg -> kPa)
        if inv == "PSI-69" and run["pressure_kpa"]["basis"] == "converted":
            p = run["pressure_kpa"]["value"]
            assert p is not None, f"Run {uid} has converted pressure but value is None"
            # FLEX non-zero pressures span 70.17 kPa to 309.29 kPa
            assert 65.0 <= p <= 320.0, f"Run {uid} converted pressure {p} kPa is outside physical chamber bounds [65, 320] kPa"


def test_pydantic_schema_validation(evidence_runs):
    """FAIL if any run in evidence_runs violates the Pydantic EvidenceRun model specification."""
    for idx, run_dict in enumerate(evidence_runs):
        try:
            model = EvidenceRun.model_validate(run_dict)
            assert model.run_uid == run_dict["run_uid"]
        except Exception as e:
            pytest.fail(f"Pydantic validation failed on run {idx} ({run_dict.get('run_uid')}): {e}")
