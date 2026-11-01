"""Real-Data Solid Fuel Matching Engine.

Scores user exploration scenarios directly against usable solid microgravity flight runs
from NASA PSI (BASS-II, Saffire-I, Saffire-II).

Epistemic Rules:
1. Only usable solid runs (explicit outcome + >=2 measured/converted environmental factors).
2. Factors scored: material family, oxygen concentration, flow velocity, and geometry (where measured).
3. Pressure is ASSUMED for all solid runs:
   - Excluded from similarity scoring (weight = 0).
   - Never presented as a matched factor.
   - Mandatory coverage warning emitted: "No solid-fuel flight run measured pressure; scenario pressure untested."
4. Dynamic weight renormalization across active measured factors only.
5. 2D (O2, Flow) envelope calculation:
   - Normalized distance to nearest tested run.
   - Outside tested range flag.
   - Full array of tested flight points for plotting.
6. Gravitational extrapolation caveats for Moon (0.16 g) and Mars (0.38 g).
"""

from __future__ import annotations

import json
import math
import re
from pathlib import Path
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

from ..models.evidence_run import EvidenceRun, OutcomeClass

# Canonical tested flight envelope bounds for usable solid runs (PSI-25, PSI-98, PSI-99)
TESTED_O2_MIN = 13.6
TESTED_O2_MAX = 22.2
TESTED_FLOW_MIN = 0.0
TESTED_FLOW_MAX = 28.18

# Default scoring tolerances
TOLERANCE_O2 = 10.0      # percentage points
TOLERANCE_FLOW = 20.0    # cm/s
TOLERANCE_THICKNESS = 5.0  # mm

# Default base weights (sum to 1.0)
DEFAULT_WEIGHTS_WITH_GEOMETRY = {
    "material": 0.40,
    "oxygen": 0.35,
    "flow": 0.20,
    "geometry": 0.05,
}

DEFAULT_WEIGHTS_WITHOUT_GEOMETRY = {
    "material": 0.45,
    "oxygen": 0.35,
    "flow": 0.20,
}


def extract_material_family(material_str: str | None) -> str:
    """Categorizes raw material strings into standard physical material families."""
    m = (material_str or "").lower()
    if "sibal" in m or "cotton" in m:
        return "SIBAL"
    if any(k in m for k in ("pmma", "acrylic", "plexiglas", "rod", "film", "slab", "spherical", "clear", "black", "micron")):
        return "PMMA"
    if "nomex" in m:
        return "Nomex"
    if "silicone" in m:
        return "Silicone"
    if "wax" in m or "candle" in m:
        return "Wax"
    if "fabric" in m:
        return "Fabric/Polymer"
    return "Other"


def extract_geometry(material_str: str | None, investigation_id: str = "") -> tuple[Optional[str], Optional[float]]:
    """Extracts geometric shape ('rod', 'flat', 'sphere', 'cylinder') and thickness/diameter in mm."""
    mat = (material_str or "").lower()
    shape: Optional[str] = None
    thickness_mm: Optional[float] = None

    if "rod" in mat:
        shape = "rod"
        if '1/4' in mat:
            thickness_mm = 6.35
        elif '3/8' in mat:
            thickness_mm = 9.525
        elif '1/2' in mat or '0.5' in mat:
            thickness_mm = 12.7
    elif "spherical" in mat or "sphere" in mat:
        shape = "sphere"
        thickness_mm = 40.0
    elif "candle" in mat:
        shape = "cylinder"
    elif any(k in mat for k in ("film", "micron", "slab", "sibal", "nomex", "silicone", "fabric", "pmma", "sheet", "flat")):
        shape = "flat"
        m_mic = re.search(r"(\d+)\s*micron", mat)
        m_mm_thick = re.search(r"(\d+)\s*mm\s*thick", mat)
        m_mm = re.search(r"(\d+(?:\.\d+)?)\s*mm", mat)
        if m_mic:
            thickness_mm = float(m_mic.group(1)) / 1000.0
        elif m_mm_thick:
            thickness_mm = float(m_mm_thick.group(1))
        elif "0.1 mm" in mat:
            thickness_mm = 0.1
        elif "0.2 mm" in mat:
            thickness_mm = 0.2
        elif "0.4 mm" in mat:
            thickness_mm = 0.4
        elif m_mm:
            thickness_mm = float(m_mm.group(1))
        elif investigation_id == "PSI-98":
            thickness_mm = 3.7
        elif investigation_id == "PSI-99":
            thickness_mm = 0.4
        elif "sibal" in mat:
            thickness_mm = 0.3

    return shape, thickness_mm


def compute_material_similarity(target_family: str, candidate_family: str) -> float:
    """Computes categorical similarity between material families."""
    if target_family == candidate_family:
        return 1.0
    # Cross-material compatibility rules
    pair = {target_family, candidate_family}
    if pair == {"SIBAL", "Fabric/Polymer"}:
        return 0.70
    if pair == {"SIBAL", "Nomex"}:
        return 0.50
    if pair == {"PMMA", "Fabric/Polymer"}:
        return 0.30
    if pair == {"SIBAL", "PMMA"}:
        return 0.10
    return 0.0


# ---------------------------------------------------------------------------
# Pydantic Schemas for Real Solid Matching Engine
# ---------------------------------------------------------------------------

class SolidScenarioInput(BaseModel):
    """Input parameters representing a spacecraft fire safety design or operational scenario."""
    material: str = Field(..., description="Target fuel/material name or family (e.g. 'PMMA', 'SIBAL', 'Nomex', 'Silicone')")
    oxygen_pct: float = Field(..., ge=0.0, le=100.0, description="Ambient oxygen concentration in percentage (e.g. 21.0)")
    flow_cm_s: Optional[float] = Field(default=None, ge=0.0, description="Forced or induced oxidizer flow velocity in cm/s (e.g. 20.0)")
    geometry: Optional[str] = Field(default=None, description="Geometric form factor: 'flat', 'rod', 'slab', 'film', 'sheet', 'sphere', etc.")
    thickness_mm: Optional[float] = Field(default=None, ge=0.0, description="Sample thickness or rod diameter in mm")
    pressure_kpa: Optional[float] = Field(default=None, ge=0.0, description="Ambient cabin pressure in kPa (untested in solid flight runs)")
    gravity_g: Optional[float] = Field(default=0.0, ge=0.0, description="Gravitational acceleration in g (0.0 = microgravity, 0.16 = Moon, 0.38 = Mars)")


class FactorMatchDetail(BaseModel):
    """Provenance and scoring breakdown for a single physical factor."""
    factor: str
    scenario_value: Any
    experiment_value: Any
    basis: Literal["measured", "converted", "assumed", "missing", "derived"]
    similarity: Optional[float] = None
    weight: Optional[float] = None
    note: Optional[str] = None


class TestedEnvelopePoint(BaseModel):
    """A verified flight data point in the microgravity solid combustion envelope."""
    run_uid: str
    oxygen_pct: float
    flow_cm_s: float
    material: str
    material_family: str
    outcome_class: OutcomeClass


class SolidEnvelopeData(BaseModel):
    """Operational envelope analysis for the scenario against flight data."""
    scenario_point: dict[str, Optional[float]]
    tested_range_o2: tuple[float, float] = (TESTED_O2_MIN, TESTED_O2_MAX)
    tested_range_flow: tuple[float, float] = (TESTED_FLOW_MIN, TESTED_FLOW_MAX)
    nearest_distance_norm: float
    outside_tested_range: bool
    tested_points: list[TestedEnvelopePoint]


class RealSolidMatch(BaseModel):
    """Ranked flight evidence match from a usable NASA solid-fuel combustion run."""
    run_uid: str
    source_file: str
    source_row: int
    similarity: float
    outcome_class: OutcomeClass
    factors: dict[str, FactorMatchDetail]
    metadata: dict[str, Any] = Field(default_factory=dict)


class RealSolidMatchResult(BaseModel):
    """Complete ranked response from the Real-Data Solid Fuel Matching Engine."""
    scenario: SolidScenarioInput
    matches: list[RealSolidMatch]
    total_evaluated: int
    envelope: SolidEnvelopeData
    warnings: list[str]


# ---------------------------------------------------------------------------
# Engine Implementation
# ---------------------------------------------------------------------------

def load_material_map(path: Optional[str | Path] = None) -> dict[str, Any]:
    """Loads standardized material mapping from data/processed/material_map.json."""
    candidates = [
        Path("data/processed/material_map.json"),
        Path(__file__).resolve().parents[4] / "data" / "processed" / "material_map.json",
        Path(__file__).resolve().parents[3] / "data" / "processed" / "material_map.json",
    ]
    if path:
        candidates.insert(0, Path(path))
    for c in candidates:
        if c.exists():
            with open(c, "r", encoding="utf-8") as f:
                return json.load(f)
    return {}


class RealSolidMatcher:
    """Matches operational scenarios against verified NASA microgravity solid combustion flight runs."""

    def __init__(
        self,
        runs_path: Optional[str | Path] = None,
        runs: Optional[list[dict[str, Any]]] = None,
        material_map_path: Optional[str | Path] = None,
    ) -> None:
        """Initializes matcher by loading and caching usable solid flight runs and material map."""
        self.material_map = load_material_map(material_map_path)

        if runs is not None:
            raw_runs = runs
        else:
            p = Path(runs_path) if runs_path else self._default_runs_path()
            if not p.exists():
                raise FileNotFoundError(f"Solid evidence runs file not found at {p}")
            with open(p, "r", encoding="utf-8") as f:
                raw_runs = json.load(f)

        # Filter to usable solid runs strictly
        self.usable_runs: list[dict[str, Any]] = [
            r for r in raw_runs if r.get("usable_for_matching") is True
        ]
        if not self.usable_runs:
            raise ValueError("No usable solid runs found in evidence dataset.")

        # Pre-process physical attributes and envelope points
        self.processed_runs: list[dict[str, Any]] = []
        self.tested_points: list[TestedEnvelopePoint] = []

        for r in self.usable_runs:
            o2_val = r["oxygen_pct"]["value"]
            flow_val = r["flow_cm_s"]["value"] if r.get("flow_cm_s") else None
            raw_mat = r.get("material") or ""
            
            # Use material_map if available, otherwise fallback
            if raw_mat in self.material_map:
                mat_entry = self.material_map[raw_mat]
                mat_fam = mat_entry["family"]
                shape = mat_entry["geometry"]
                thick = mat_entry["thickness_mm"]
            else:
                mat_fam = extract_material_family(raw_mat)
                shape, thick = extract_geometry(raw_mat, r.get("investigation_id", ""))

            # Normalized coordinates in [0, 1] space
            u = (o2_val - TESTED_O2_MIN) / (TESTED_O2_MAX - TESTED_O2_MIN)
            v = (flow_val - TESTED_FLOW_MIN) / (TESTED_FLOW_MAX - TESTED_FLOW_MIN) if flow_val is not None else None

            processed = {
                "raw": r,
                "run_uid": r["run_uid"],
                "investigation_id": r["investigation_id"],
                "source_file": r["oxygen_pct"]["source_file"],
                "source_row": r["oxygen_pct"]["source_row"],
                "material": r.get("material") or "",
                "material_family": mat_fam,
                "o2": o2_val,
                "o2_basis": r["oxygen_pct"]["basis"],
                "flow": flow_val,
                "flow_basis": r["flow_cm_s"]["basis"] if r.get("flow_cm_s") else "missing",
                "outcome_class": r.get("outcome_class", "unknown"),
                "shape": shape,
                "thickness_mm": thick,
                "u": u,
                "v": v,
            }
            self.processed_runs.append(processed)
            self.tested_points.append(
                TestedEnvelopePoint(
                    run_uid=r["run_uid"],
                    oxygen_pct=round(o2_val, 2),
                    flow_cm_s=round(flow_val, 2) if flow_val is not None else 0.0,
                    material=r.get("material") or "",
                    material_family=mat_fam,
                    outcome_class=r.get("outcome_class", "unknown"),
                )
            )

    @staticmethod
    def _default_runs_path() -> Path:
        """Finds evidence_solid.json relative to repo layout or working directory."""
        candidates = [
            Path("data/processed/evidence_solid.json"),
            Path(__file__).resolve().parents[4] / "data" / "processed" / "evidence_solid.json",
            Path(__file__).resolve().parents[3] / "data" / "processed" / "evidence_solid.json",
        ]
        for c in candidates:
            if c.exists():
                return c
        return candidates[0]

    def match(
        self,
        scenario: SolidScenarioInput,
        weights: Optional[dict[str, float]] = None,
        top_k: Optional[int] = None,
    ) -> RealSolidMatchResult:
        """Scores all usable solid runs against the scenario and returns ranked evidence matches."""
        if scenario.material in self.material_map:
            target_family = self.material_map[scenario.material]["family"]
        else:
            target_family = extract_material_family(scenario.material)
        has_geometry = scenario.geometry is not None or scenario.thickness_mm is not None

        # Determine raw weights based on active factors
        if weights is not None:
            raw_weights = dict(weights)
        elif has_geometry:
            raw_weights = dict(DEFAULT_WEIGHTS_WITH_GEOMETRY)
        else:
            raw_weights = dict(DEFAULT_WEIGHTS_WITHOUT_GEOMETRY)

        # PRESSURE EPITHEMIC RULE:
        # Pressure is ASSUMED for all solid flight runs. Exclude from scoring and never match.
        raw_weights.pop("pressure", None)

        # Normalize scenario point into envelope space
        u_s = (scenario.oxygen_pct - TESTED_O2_MIN) / (TESTED_O2_MAX - TESTED_O2_MIN)
        v_s = (scenario.flow_cm_s - TESTED_FLOW_MIN) / (TESTED_FLOW_MAX - TESTED_FLOW_MIN) if scenario.flow_cm_s is not None else None

        outside_tested_range = bool(
            scenario.oxygen_pct < TESTED_O2_MIN
            or scenario.oxygen_pct > TESTED_O2_MAX
            or (scenario.flow_cm_s is not None and (scenario.flow_cm_s < TESTED_FLOW_MIN or scenario.flow_cm_s > TESTED_FLOW_MAX))
        )

        nearest_dist_sq = float("inf")
        scored_matches: list[RealSolidMatch] = []

        for pr in self.processed_runs:
            # 1. 2D Euclidean envelope distance in normalized space
            if pr["v"] is not None and v_s is not None:
                dist_sq = (u_s - pr["u"]) ** 2 + (v_s - pr["v"]) ** 2
            else:
                dist_sq = (u_s - pr["u"]) ** 2

            if dist_sq < nearest_dist_sq:
                nearest_dist_sq = dist_sq

            # 2. Factor-level similarities
            # Material
            mat_sim = compute_material_similarity(target_family, pr["material_family"])

            # Oxygen (linear bounded in tolerance)
            diff_o2 = abs(scenario.oxygen_pct - pr["o2"])
            o2_sim = max(0.0, 1.0 - (diff_o2 / TOLERANCE_O2))

            # Flow
            flow_sim: Optional[float] = None
            diff_flow = 0.0
            if pr["flow"] is not None and scenario.flow_cm_s is not None:
                diff_flow = abs(scenario.flow_cm_s - pr["flow"])
                flow_sim = max(0.0, 1.0 - (diff_flow / TOLERANCE_FLOW))

            # Geometry (only where scenario specifies and run provides)
            geom_sim: Optional[float] = None
            if has_geometry and pr["shape"] is not None:
                shape_sim = 1.0 if (scenario.geometry and scenario.geometry.lower() == pr["shape"]) else 0.4
                if scenario.thickness_mm is not None and pr["thickness_mm"] is not None:
                    diff_t = abs(scenario.thickness_mm - pr["thickness_mm"])
                    t_sim = max(0.0, 1.0 - (diff_t / TOLERANCE_THICKNESS))
                    geom_sim = (shape_sim + t_sim) / 2.0
                else:
                    geom_sim = shape_sim

            # 3. Dynamic weight renormalization over active measured factors
            factor_scores: dict[str, float] = {
                "material": mat_sim,
                "oxygen": o2_sim,
            }
            if flow_sim is not None:
                factor_scores["flow"] = flow_sim
            if geom_sim is not None and "geometry" in raw_weights:
                factor_scores["geometry"] = geom_sim

            total_active_weight = sum(raw_weights[f] for f in factor_scores if f in raw_weights)
            if total_active_weight > 0:
                norm_weights = {f: raw_weights[f] / total_active_weight for f in factor_scores}
            else:
                norm_weights = {f: 1.0 / len(factor_scores) for f in factor_scores}

            overall_sim = sum(factor_scores[f] * norm_weights[f] for f in factor_scores)

            # 4. Factor breakdowns with provenance basis
            factors_detail: dict[str, FactorMatchDetail] = {
                "material": FactorMatchDetail(
                    factor="material",
                    scenario_value=scenario.material,
                    experiment_value=pr["material"],
                    basis="measured" if pr["raw"]["fuel_class"] == "solid" else "transcribed",
                    similarity=round(mat_sim, 4),
                    weight=round(norm_weights["material"], 4),
                    note=f"Family match: {target_family} vs {pr['material_family']}",
                ),
                "oxygen": FactorMatchDetail(
                    factor="oxygen",
                    scenario_value=scenario.oxygen_pct,
                    experiment_value=pr["o2"],
                    basis=pr["o2_basis"],
                    similarity=round(o2_sim, 4),
                    weight=round(norm_weights["oxygen"], 4),
                    note=f"Delta O2: {round(diff_o2, 2)}%",
                ),
            }
            if flow_sim is not None and "flow" in norm_weights:
                factors_detail["flow"] = FactorMatchDetail(
                    factor="flow",
                    scenario_value=scenario.flow_cm_s,
                    experiment_value=pr["flow"],
                    basis=pr["flow_basis"],
                    similarity=round(flow_sim, 4),
                    weight=round(norm_weights["flow"], 4),
                    note=f"Delta flow: {round(diff_flow, 2)} cm/s",
                )

            if geom_sim is not None and "geometry" in norm_weights:
                factors_detail["geometry"] = FactorMatchDetail(
                    factor="geometry",
                    scenario_value=f"{scenario.geometry or 'any'} ({scenario.thickness_mm or 'any'} mm)",
                    experiment_value=f"{pr['shape']} ({pr['thickness_mm']} mm)",
                    basis="measured" if pr["thickness_mm"] is not None else "derived",
                    similarity=round(geom_sim, 4),
                    weight=round(norm_weights["geometry"], 4),
                    note="Shape and dimension comparison",
                )

            scored_matches.append(
                RealSolidMatch(
                    run_uid=pr["run_uid"],
                    source_file=pr["source_file"],
                    source_row=pr["source_row"],
                    similarity=round(overall_sim, 4),
                    outcome_class=pr["outcome_class"],
                    factors=factors_detail,
                    metadata={
                        "investigation_id": pr["investigation_id"],
                        "platform": pr["raw"]["platform"],
                        "frames_shot": pr["raw"].get("frames_shot"),
                        "outcome_source_column": pr["raw"].get("outcome_source_column", "none"),
                        "material_family": pr["material_family"],
                    },
                )
            )

        # Sort matches by similarity descending (deterministic secondary sort by run_uid)
        scored_matches.sort(key=lambda m: (m.similarity, m.run_uid), reverse=True)
        if top_k is not None:
            scored_matches = scored_matches[:top_k]

        # 5. Envelope data and distance
        nearest_distance_norm = round(math.sqrt(nearest_dist_sq), 4)
        envelope = SolidEnvelopeData(
            scenario_point={"oxygen_pct": scenario.oxygen_pct, "flow_cm_s": scenario.flow_cm_s},
            tested_range_o2=(TESTED_O2_MIN, TESTED_O2_MAX),
            tested_range_flow=(TESTED_FLOW_MIN, TESTED_FLOW_MAX),
            nearest_distance_norm=nearest_distance_norm,
            outside_tested_range=outside_tested_range,
            tested_points=self.tested_points,
        )

        # 6. Epistemic warnings
        warnings: list[str] = [
            "No solid-fuel flight run measured pressure; scenario pressure untested."
        ]
        if scenario.gravity_g is not None and scenario.gravity_g > 0.01:
            warnings.append(
                f"All solid flight runs are microgravity (~0 g); lunar ({0.16} g) and martian ({0.38} g) predictions are extrapolations."
            )
        if outside_tested_range:
            warnings.append(
                f"Scenario conditions (O2={scenario.oxygen_pct}%, flow={scenario.flow_cm_s} cm/s) fall outside tested microgravity solid flight envelope (O2: {TESTED_O2_MIN}-{TESTED_O2_MAX}%, flow: {TESTED_FLOW_MIN}-{TESTED_FLOW_MAX} cm/s)."
            )

        return RealSolidMatchResult(
            scenario=scenario,
            matches=scored_matches,
            total_evaluated=len(self.processed_runs),
            envelope=envelope,
            warnings=warnings,
        )
