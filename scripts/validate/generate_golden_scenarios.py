"""Generates 50 deterministic golden test scenarios for TypeScript RealSolidMatcher parity verification.

Outputs data/fixtures/golden_scenarios_50.json containing:
- scenario input parameters
- custom weights (if tested)
- top_k (if specified)
- expected match rankings (run_uids and similarity scores to float precision)
- expected envelope metrics (nearest_distance_norm, outside_tested_range)
- expected warnings
- factor match details for top match
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from services.api.app.matching.real_solid import RealSolidMatcher, SolidScenarioInput

ROOT = Path(__file__).resolve().parents[2]
OUTPUT_PATH = ROOT / "data" / "fixtures" / "golden_scenarios_50.json"


def generate_scenarios() -> list[dict]:
    materials = [
        "PMMA", "SIBAL", "Nomex", "Silicone", "Cotton", "Fabric/Polymer",
        "Clear Cast PMMA", "Black PMMA rod", "Cast PMMA flat 0.4 mm", "Nomex fabric",
        "UnknownPolymer", "Wax"
    ]
    o2_levels = [12.0, 14.5, 18.0, 21.0, 24.0, 30.0]
    flows = [0.0, 2.5, 8.0, 15.0, 20.0, 35.0]
    geometries = [None, "flat", "rod", "sphere", "cylinder"]
    thicknesses = [None, 0.1, 0.4, 1.0, 6.35, 12.7]
    gravities = [0.0, 0.16, 0.38, 1.0]
    pressures = [None, 70.3, 101.3]

    scenarios = []
    idx = 0

    for i in range(50):
        mat = materials[i % len(materials)]
        o2 = o2_levels[i % len(o2_levels)]
        flow = flows[(i * 2 + 1) % len(flows)]
        geom = geometries[i % len(geometries)]
        thick = thicknesses[(i * 3) % len(thicknesses)]
        grav = gravities[i % len(gravities)]
        press = pressures[i % len(pressures)]

        scenario_dict = {
            "scenario_id": f"scenario_{i+1:03d}",
            "input": {
                "material": mat,
                "oxygen_pct": round(o2, 2),
                "flow_cm_s": round(flow, 2),
                "geometry": geom,
                "thickness_mm": thick,
                "pressure_kpa": press,
                "gravity_g": grav,
            },
            "top_k": 10 if (i % 2 == 0) else None,
            "custom_weights": None if (i % 3 != 0) else {
                "material": 0.50,
                "oxygen": 0.30,
                "flow": 0.20,
            }
        }
        scenarios.append(scenario_dict)

    return scenarios


def main():
    matcher = RealSolidMatcher()
    scenarios_meta = generate_scenarios()

    golden_records = []

    for item in scenarios_meta:
        sc_input = SolidScenarioInput(**item["input"])
        top_k = item["top_k"]
        custom_weights = item["custom_weights"]

        result = matcher.match(
            scenario=sc_input,
            weights=custom_weights,
            top_k=top_k,
        )

        record = {
            "scenario_id": item["scenario_id"],
            "input": item["input"],
            "top_k": top_k,
            "custom_weights": custom_weights,
            "expected": {
                "total_evaluated": result.total_evaluated,
                "outside_tested_range": result.envelope.outside_tested_range,
                "nearest_distance_norm": result.envelope.nearest_distance_norm,
                "warnings": result.warnings,
                "matches": [
                    {
                        "run_uid": m.run_uid,
                        "source_file": m.source_file,
                        "source_row": m.source_row,
                        "similarity": m.similarity,
                        "outcome_class": m.outcome_class,
                        "material_family": m.factors["material"].note,
                        "factors": {
                            k: {
                                "similarity": v.similarity,
                                "weight": v.weight,
                                "basis": v.basis,
                            }
                            for k, v in m.factors.items()
                        }
                    }
                    for m in result.matches
                ]
            }
        }
        golden_records.append(record)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(golden_records, f, indent=2, ensure_ascii=False)

    print(f"Generated {len(golden_records)} golden scenarios at {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
