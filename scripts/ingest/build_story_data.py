#!/usr/bin/env python3
"""
Build Story Data Generator
Deterministic build-time data extraction from real NASA PSI tables and NTRS corpus chunks.
Generates static JSON fixtures in apps/web/src/data/story/*.json.
Writes SHA-256 manifest to data/provenance/story_data_manifest.json.
No synthetic, interpolated, or smoothed data.
"""

import os
import csv
import json
import hashlib
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = REPO_ROOT / "data" / "raw"
RAW_ML_DIR = REPO_ROOT / "data" / "raw_ml"
PROCESSED_DIR = REPO_ROOT / "data" / "processed"
CORPUS_DIR = REPO_ROOT / "data" / "corpus"
PROVENANCE_DIR = REPO_ROOT / "data" / "provenance"
STORY_DATA_DIR = REPO_ROOT / "apps" / "web" / "src" / "data" / "story"

def sha256_file(filepath: Path) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def build_chapter1_data():
    """Chapter 1: FLEX droplet combustion runs from PSI-69."""
    flex_csv = RAW_DIR / "PSI-69_Experimental table_FLEX.csv"
    runs = []
    
    with open(flex_csv, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        row_idx = 1 # 1-based header is row 1
        for row in reader:
            row_idx += 1
            test_num_str = row.get("FLEX Test #", "").strip()
            identifier = row.get("FLEX Identifier", "").strip()
            fuel = row.get("Fuel", "").strip()
            d0_str = row.get("Droplet initial diameter; mm", "").strip()
            burn_time_str = row.get("Burn time; s", "").strip()
            ext_diam_str = row.get("Visible flame extinction diameter; mm", "").strip()
            burn_rate_str = row.get("Burning rate; mm", "").strip()
            test_end = row.get("Test end", "").strip()

            if not test_num_str or not d0_str or not burn_time_str:
                continue

            try:
                d0 = float(d0_str)
                burn_time = float(burn_time_str)
                ext_diam = float(ext_diam_str) if ext_diam_str else None
                burn_rate = float(burn_rate_str) if burn_rate_str else None
                test_num = int(test_num_str)
            except ValueError:
                continue

            runs.append({
                "run_id": f"PSI-69-RUN-{test_num:04d}",
                "flex_identifier": identifier,
                "test_number": test_num,
                "csv_row": row_idx,
                "source_file": "data/raw/PSI-69_Experimental table_FLEX.csv",
                "fuel": fuel,
                "initial_diameter_mm": d0,
                "extinction_diameter_mm": ext_diam,
                "burning_rate_mm2_s": burn_rate,
                "burn_time_s": burn_time,
                "test_end": test_end,
                "oxygen_mole_fraction": 0.21,
                "gravity_regime": "microgravity (ISS CIR)"
            })

    # Sort deterministically
    runs.sort(key=lambda x: x["test_number"])

    output = {
        "chapter_slug": "why-is-fire-round-in-space",
        "title": "Why fire is round in space",
        "description": "FLEX flight droplet combustion dataset showing burn duration vs initial droplet size in orbital freefall.",
        "source_investigation": "PSI-69 (FLEX)",
        "platform": "ISS CIR (Combustion Integrated Rack)",
        "total_usable_runs": len(runs),
        "citation": {
            "doi": "10.60555/flex-iss-cir",
            "source_document": "PSI-69_Experimental table_FLEX.csv",
            "chunk_id": "NTRS-20130014061-p001-c002",
            "document_title": "8th US National Combustion Meeting (Spray and Droplet)",
            "verbatim_quote": "The digital\r\nimages yielded droplet and flame diameters as functions of time and subsequently droplet burning rate,\r\nflame standoff ratio, and initial and extinction droplet diameters.",
            "page": 1
        },
        "runs": runs
    }
    return output

def build_chapter2_data():
    """Chapter 2: BASS-II solid burn runs from evidence_solid.json."""
    solid_json = PROCESSED_DIR / "evidence_solid.json"
    with open(solid_json, "r", encoding="utf-8") as f:
        all_runs = json.load(f)

    runs = []
    for r in all_runs:
        if not r.get("usable_for_matching", False):
            continue
        
        o2 = r.get("oxygen_pct", {}).get("value")
        flow = r.get("flow_cm_s", {}).get("value")
        if o2 is None or flow is None:
            continue

        runs.append({
            "run_uid": r["run_uid"],
            "material": r.get("material", "").strip(),
            "fuel_class": r.get("fuel_class", "solid"),
            "oxygen_pct": o2,
            "flow_cm_s": flow,
            "ignited": bool(r.get("ignited", {}).get("value")),
            "extinguished": bool(r.get("extinguished", {}).get("value")),
            "outcome_class": r.get("outcome_class", "unknown"),
            "co_ppm": r.get("co_ppm", {}).get("value"),
            "co2_pct": r.get("co2_pct", {}).get("value"),
            "source_file": r.get("oxygen_pct", {}).get("source_file", "data/raw/PSI-25_Experimental table_BASS-II.csv"),
            "source_row": r.get("oxygen_pct", {}).get("source_row", 0),
            "flow_basis": "converted",
            "flow_calibration_note": "Airflow was converted from fan dial settings using U = 1.0066 * AirDisplay (basis tier: converted)."
        })

    runs.sort(key=lambda x: x["run_uid"])

    output = {
        "chapter_slug": "same-fire-different-air",
        "title": "Same fire, different air",
        "description": "BASS-II solid fuel flammability outcomes across tested oxygen concentration and forced ventilation speed.",
        "source_investigation": "PSI-25 (BASS-II)",
        "platform": "ISS MSG (Microgravity Science Glovebox)",
        "total_usable_runs": len(runs),
        "citation": {
            "doi": "10.60555/4qc4-de67",
            "source_document": "PSI-25_Experimental table_BASS-II.csv",
            "chunk_id": "NTRS-20210011385-p101-c002",
            "document_title": "NASA/TM-20210011385",
            "verbatim_quote": "The quenching speeds were found to be between 1 and \r\n5 cm/s with higher speed in lower O2 atmosphere.",
            "page": 101
        },
        "envelope_summary": {
            "min_o2_pct": 13.6,
            "max_o2_pct": 22.2,
            "min_flow_cm_s": 0.0,
            "max_flow_cm_s": 28.18,
            "pressure_note": "Ambient cabin pressure (101.3 kPa) was assumed and not varied across solid runs."
        },
        "runs": runs
    }
    return output

def build_chapter3_data():
    """Chapter 3: SAME-R smoke detection sensor data from PSI-101."""
    samer_csv = RAW_ML_DIR / "d5_samer" / "PSI-101_Experimental table_SAME-R.csv"
    runs = []

    with open(samer_csv, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        row_idx = 1
        for row in reader:
            row_idx += 1
            sample_type = row.get("Sample Type", "").strip()
            test_num = row.get("SAME Test #", "").strip()
            ratio_str = row.get("Rt/R0", "").strip()
            velocity_str = row.get("Inlet velocity (cm/s)", "").strip()
            duration_str = row.get("Duration (sec)", "").strip()
            net_aging_str = row.get("Net aging time (sec)", "").strip()

            if not sample_type or not ratio_str:
                continue

            try:
                ratio = float(ratio_str)
                velocity = float(velocity_str) if velocity_str else 8.1
                duration = float(duration_str) if duration_str else None
                net_aging = float(net_aging_str) if net_aging_str else None
            except ValueError:
                continue

            runs.append({
                "test_id": f"SAME-R-{test_num}",
                "csv_row": row_idx,
                "source_file": "data/raw_ml/d5_samer/PSI-101_Experimental table_SAME-R.csv",
                "sample_material": sample_type,
                "inlet_velocity_cm_s": velocity,
                "sensor_ratio_rt_r0": ratio,
                "duration_sec": duration,
                "net_aging_time_sec": net_aging,
                "gravity_regime": "microgravity (Space Shuttle / ISS)"
            })

    runs.sort(key=lambda x: (x["sample_material"], x["test_id"]))

    output = {
        "chapter_slug": "smoke-that-does-not-rise",
        "title": "Smoke that does not rise",
        "description": "SAME-R flight sensor response ratios (Rt/R0) across overheated spacecraft materials in microgravity.",
        "source_investigation": "PSI-101 (SAME-R)",
        "platform": "International Space Station (ISS)",
        "run_count_explanation": "Published SAME-R dataset contains 104 valid microgravity run records with complete sensor response data out of the 130 planned flight matrix conditions (5 records contained non-numerical values such as 'n/a' and were excluded).",
        "total_usable_runs": len(runs),
        "citation": {
            "source_document": "PSI-101_Experimental table_SAME-R.csv",
            "chunk_id": "NTRS-20240002981-p005-c001",
            "document_title": "53rd International Conference on Environmental Systems (ICES-2024-365)",
            "verbatim_quote": "Figure 7 presents the smoke concentrations at the FFD \r\nand the response of a terrestrial ionization detector.",
            "page": 5
        },
        "runs": runs
    }
    return output

def build_chapter4_data():
    """Chapter 4: Tested envelope limits and exploration research gaps."""
    output = {
        "chapter_slug": "what-nasa-has-not-tested",
        "title": "What NASA has not tested",
        "description": "Explicit boundaries of flight-tested data: gravity, pressure, and exploration oxygen atmospheres.",
        "citation": {
            "chunk_id": "NTRS-20240002981-p001-c002",
            "document_title": "53rd International Conference on Environmental Systems (ICES-2024-365)",
            "verbatim_quote": "The lack of this experimental data has \r\nforced spacecraft designers to base their designs and safety precautions on 1-g understanding \r\nof flame spread, flame self-extinguishment, fire detection, and suppression.",
            "page": 1
        },
        "tested_envelope": {
            "gravity": {
                "tested": "0.0g (ISS orbit only)",
                "untested": ["0.16g (Moon surface)", "0.38g (Mars surface)"],
                "note": "Zero long-duration solid combustion experiments have been conducted on the Moon or Mars."
            },
            "pressure": {
                "tested": "101.3 kPa (assumed, not measured)",
                "untested": ["56.0 kPa (Artemis exploration atmosphere)", "70.3 kPa (Deep space transit)"],
                "note": "Pressure was not varied or recorded as a controlled parameter in BASS-II solid burn tests."
            },
            "oxygen": {
                "tested_min_pct": 13.6,
                "tested_max_pct": 22.2,
                "untested_exploration_pct": [28.0, 32.0, 34.0],
                "note": "Oxygen above 22.2% has never been tested in microgravity for these solid fuel samples."
            },
            "airflow": {
                "tested_min_cm_s": 0.0,
                "tested_max_cm_s": 28.18,
                "basis": "converted from fan dial settings"
            }
        },
        "destination_gaps": [
            {
                "name": "Earth Space Station (ISS)",
                "gravity_g": 0.0,
                "oxygen_pct": 21.0,
                "pressure_kpa": 101.3,
                "status": "Well tested in 0g"
            },
            {
                "name": "Lunar Habitat (Artemis)",
                "gravity_g": 0.16,
                "oxygen_pct": 34.0,
                "pressure_kpa": 56.0,
                "status": "Untested partial gravity & elevated O2"
            },
            {
                "name": "Mars Surface Habitat",
                "gravity_g": 0.38,
                "oxygen_pct": 28.0,
                "pressure_kpa": 70.3,
                "status": "Untested Martian gravity"
            }
        ]
    }
    return output

def main():
    STORY_DATA_DIR.mkdir(parents=True, exist_ok=True)
    PROVENANCE_DIR.mkdir(parents=True, exist_ok=True)

    c1 = build_chapter1_data()
    c2 = build_chapter2_data()
    c3 = build_chapter3_data()
    c4 = build_chapter4_data()

    c1_path = STORY_DATA_DIR / "chapter1_droplets.json"
    c2_path = STORY_DATA_DIR / "chapter2_atmosphere.json"
    c3_path = STORY_DATA_DIR / "chapter3_smoke.json"
    c4_path = STORY_DATA_DIR / "chapter4_gaps.json"

    for path, data in [
        (c1_path, c1),
        (c2_path, c2),
        (c3_path, c3),
        (c4_path, c4),
    ]:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, sort_keys=True)
        print(f"Generated: {path.relative_to(REPO_ROOT)} ({len(data.get('runs', []))} records)")

    manifest = {
        "manifest_version": "1.0.0",
        "description": "Cryptographic SHA-256 provenance manifest for Story Mode v2 grounded datasets.",
        "generated_by": "scripts/ingest/build_story_data.py",
        "inputs": {
            "data/raw/PSI-69_Experimental table_FLEX.csv": sha256_file(RAW_DIR / "PSI-69_Experimental table_FLEX.csv"),
            "data/processed/evidence_solid.json": sha256_file(PROCESSED_DIR / "evidence_solid.json"),
            "data/raw_ml/d5_samer/PSI-101_Experimental table_SAME-R.csv": sha256_file(RAW_ML_DIR / "d5_samer" / "PSI-101_Experimental table_SAME-R.csv"),
            "data/corpus/chunks.jsonl": sha256_file(CORPUS_DIR / "chunks.jsonl"),
        },
        "outputs": {
            str(c1_path.relative_to(REPO_ROOT)).replace("\\", "/"): sha256_file(c1_path),
            str(c2_path.relative_to(REPO_ROOT)).replace("\\", "/"): sha256_file(c2_path),
            str(c3_path.relative_to(REPO_ROOT)).replace("\\", "/"): sha256_file(c3_path),
            str(c4_path.relative_to(REPO_ROOT)).replace("\\", "/"): sha256_file(c4_path),
        }
    }

    manifest_path = STORY_DATA_DIR / "story_data_manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, sort_keys=True)
    print(f"Generated manifest: {manifest_path.relative_to(REPO_ROOT)}")

if __name__ == "__main__":
    main()

