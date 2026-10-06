"""Generator script to produce validated mock data fixtures for IGNIS v1.1.

Reference: Task A.9 | PRD v1.1 §18, §28 | DECISIONS.md D-008.
Produces JSON fixture files in data/fixtures/ with cross-referenced UUIDs.
"""

import json
from pathlib import Path
from uuid import UUID

FIXTURES_DIR = Path(__file__).resolve().parent

# Stable UUIDs for cross-referencing
DS_OPEN_DATA = "11111111-1111-1111-1111-111111111101"
DS_API = "11111111-1111-1111-1111-111111111102"
DS_EARTHDATA = "11111111-1111-1111-1111-111111111103"
DS_PSI = "11111111-1111-1111-1111-111111111104"
DS_DERIVED = "11111111-1111-1111-1111-111111111105"

EXP_SAFFIRE_1 = "22222222-2222-2222-2222-222222222201"
EXP_SAFFIRE_2 = "22222222-2222-2222-2222-222222222202"
EXP_SAFFIRE_3 = "22222222-2222-2222-2222-222222222203"
EXP_SAFFIRE_4 = "22222222-2222-2222-2222-222222222204"
EXP_BASS_1 = "22222222-2222-2222-2222-222222222205"
EXP_BASS_2 = "22222222-2222-2222-2222-222222222206"
EXP_FLEX_1 = "22222222-2222-2222-2222-222222222207"
EXP_FLEX_2 = "22222222-2222-2222-2222-222222222208"
EXP_CIR_ACME = "22222222-2222-2222-2222-222222222209"
EXP_CIR_SOFIE = "22222222-2222-2222-2222-222222222210"

DOC_SAFFIRE_1 = "33333333-3333-3333-3333-333333333301"
DOC_SAFFIRE_2 = "33333333-3333-3333-3333-333333333302"
DOC_BASS_2 = "33333333-3333-3333-3333-333333333303"
DOC_FLEX_2 = "33333333-3333-3333-3333-333333333304"
DOC_CIR_ACME = "33333333-3333-3333-3333-333333333305"

MEDIA_FLEX_VIDEO = "44444444-4444-4444-4444-444444444401"
MEDIA_SAFFIRE_IMG = "44444444-4444-4444-4444-444444444402"
MEDIA_BASS_IMG = "44444444-4444-4444-4444-444444444403"


def generate_data_sources():
    return [
        {
            "id": DS_OPEN_DATA,
            "registry": "NASA_OPEN_DATA",
            "source_role": "primary_scientific",
            "provider_name": "Physical Sciences Informatics (PSI)",
            "dataset_identifier": "PSI-COMBUSTION-ARCHIVE-V1",
            "api_name": None,
            "sensor_name": None,
            "source_url": "https://psi.nasa.gov",
            "retrieved_at": "2026-09-15T00:00:00Z",
            "license_or_access": "Public Domain (NASA Open Science)",
            "provenance": {"sync_protocol": "open_data_harvest_v1"},
        },
        {
            "id": DS_API,
            "registry": "NASA_API",
            "source_role": "media",
            "provider_name": "NASA Images and Video API",
            "dataset_identifier": "images.nasa.gov",
            "api_name": "NASA Imagery Search API",
            "sensor_name": None,
            "source_url": "https://images-api.nasa.gov",
            "retrieved_at": "2026-09-15T00:00:00Z",
            "license_or_access": "NASA Media Guidelines",
            "provenance": {"sync_protocol": "nasa_api_rest_v1"},
        },
        {
            "id": DS_EARTHDATA,
            "registry": "NASA_EARTHDATA",
            "source_role": "earth_observation_context",
            "provider_name": "NASA LANCE / FIRMS",
            "dataset_identifier": "MODIS_C6_1_THERMAL",
            "api_name": "FIRMS Wildfire Data Stream",
            "sensor_name": "MODIS Terra/Aqua & VIIRS",
            "source_url": "https://firms.modaps.eosdis.nasa.gov",
            "retrieved_at": "2026-09-15T00:00:00Z",
            "license_or_access": "Open Access / Public Domain",
            "provenance": {"sync_protocol": "firms_area_api_v1"},
        },
        {
            "id": DS_PSI,
            "registry": "NASA_PSI",
            "source_role": "normalized_scientific",
            "provider_name": "NASA Glenn Research Center Combustion Archives",
            "dataset_identifier": "GRC-COMBUSTION-DB",
            "api_name": None,
            "sensor_name": "Thermocouple Arrays & Radiometers",
            "source_url": "https://www1.grc.nasa.gov",
            "retrieved_at": "2026-09-15T00:00:00Z",
            "license_or_access": "NASA Technical Reports Access",
            "provenance": {"sync_protocol": "manual_curation_v1"},
        },
        {
            "id": DS_DERIVED,
            "registry": "OTHER_NASA_REPOSITORY",
            "source_role": "derived_by_ignis",
            "provider_name": "IGNIS Computational Science Pipeline",
            "dataset_identifier": "IGNIS-CV-METRICS-2026",
            "api_name": None,
            "sensor_name": "HSV Contour Tracking Pipeline",
            "source_url": "https://github.com/FarhanS7/IGNIS",
            "retrieved_at": "2026-09-20T00:00:00Z",
            "license_or_access": "MIT License",
            "provenance": {"pipeline_version": "1.0.0", "reproducible": True},
        },
    ]


def generate_experiments():
    return [
        {
            "id": EXP_SAFFIRE_1,
            "external_id": "SAFFIRE-I",
            "source_id": DS_OPEN_DATA,
            "experiment_family": "Saffire",
            "title": "Spacecraft Fire Experiment I (Saffire-I)",
            "summary": "Large-scale flame spread across solid cotton-fiberglass blend fabric aboard uncrewed Cygnus OA-6.",
            "mission_platform": "Cygnus OA-6",
            "gravity_environment": "microgravity",
            "objectives": ["flame_spread", "extinction", "flammability_limits"],
            "source_url": "https://psi.nasa.gov/saffire-1",
        },
        {
            "id": EXP_SAFFIRE_2,
            "external_id": "SAFFIRE-II",
            "source_id": DS_PSI,
            "experiment_family": "Saffire",
            "title": "Spacecraft Fire Experiment II (Saffire-II)",
            "summary": "Combustion of thick PMMA acrylic slabs and Nomex fabric under controlled ventilation aboard Cygnus OA-5.",
            "mission_platform": "Cygnus OA-5",
            "gravity_environment": "microgravity",
            "objectives": ["flame_spread", "sustained_burning", "material_response"],
            "source_url": "https://psi.nasa.gov/saffire-2",
        },
        {
            "id": EXP_SAFFIRE_3,
            "external_id": "SAFFIRE-III",
            "source_id": DS_OPEN_DATA,
            "experiment_family": "Saffire",
            "title": "Spacecraft Fire Experiment III (Saffire-III)",
            "summary": "High airflow flame propagation on fabric samples in low-pressure oxygen-enriched environment.",
            "mission_platform": "Cygnus OA-7",
            "gravity_environment": "microgravity",
            "objectives": ["flame_spread", "flammability_limits"],
            "source_url": "https://psi.nasa.gov/saffire-3",
        },
        {
            "id": EXP_SAFFIRE_4,
            "external_id": "SAFFIRE-IV",
            "source_id": DS_PSI,
            "experiment_family": "Saffire",
            "title": "Spacecraft Fire Experiment IV (Saffire-IV)",
            "summary": "Smoke scrubbing, post-fire gas cleanup, and Nomex flammability limits at exploration pressures.",
            "mission_platform": "Cygnus NG-13",
            "gravity_environment": "microgravity",
            "objectives": ["smoke_detection", "suppression", "extinction"],
            "source_url": "https://psi.nasa.gov/saffire-4",
        },
        {
            "id": EXP_BASS_1,
            "external_id": "BASS-I",
            "source_id": DS_OPEN_DATA,
            "experiment_family": "BASS",
            "title": "Burning and Suppression of Solids - I (BASS-I)",
            "summary": "Extinction limits of solid polymer rods burned in microgravity within the ISS Microgravity Science Glovebox.",
            "mission_platform": "ISS Columbus Module",
            "gravity_environment": "microgravity",
            "objectives": ["extinction", "suppression", "flammability_limits"],
            "source_url": "https://psi.nasa.gov/bass-1",
        },
        {
            "id": EXP_BASS_2,
            "external_id": "BASS-II",
            "source_id": DS_OPEN_DATA,
            "experiment_family": "BASS",
            "title": "Burning and Suppression of Solids - II (BASS-II)",
            "summary": "Detailed ignition and flame spread over fabric and acrylic samples across varied forced flow rates.",
            "mission_platform": "ISS Destiny Module",
            "gravity_environment": "microgravity",
            "objectives": ["ignition", "flame_spread", "sustained_burning"],
            "source_url": "https://psi.nasa.gov/bass-2",
        },
        {
            "id": EXP_FLEX_1,
            "external_id": "FLEX-1",
            "source_id": DS_PSI,
            "experiment_family": "FLEX",
            "title": "Flame Extinction Experiment - 1 (FLEX-1)",
            "summary": "Free and tethered isolated droplet combustion in the CIR chamber exploring spherical flame extinction.",
            "mission_platform": "ISS CIR Rack",
            "gravity_environment": "microgravity",
            "objectives": ["extinction", "flammability_limits"],
            "source_url": "https://psi.nasa.gov/flex-1",
        },
        {
            "id": EXP_FLEX_2,
            "external_id": "FLEX-2",
            "source_id": DS_OPEN_DATA,
            "experiment_family": "FLEX",
            "title": "Flame Extinction Experiment - 2 (FLEX-2)",
            "summary": "Observation of low-temperature cool flame regime and spherical diffusion boundary layer dynamics in droplets.",
            "mission_platform": "ISS CIR Rack",
            "gravity_environment": "microgravity",
            "objectives": ["sustained_burning", "extinction", "general_combustion"],
            "source_url": "https://psi.nasa.gov/flex-2",
        },
        {
            "id": EXP_CIR_ACME,
            "external_id": "ACME",
            "source_id": DS_PSI,
            "experiment_family": "ACME",
            "title": "Advanced Combustion via Microgravity Experiments (ACME)",
            "summary": "Gaseous and polymer boundary-layer diffusion flames investigating soot formation and extinction limits.",
            "mission_platform": "ISS CIR Rack",
            "gravity_environment": "microgravity",
            "objectives": ["ignition", "extinction", "general_combustion"],
            "source_url": "https://psi.nasa.gov/acme",
        },
        {
            "id": EXP_CIR_SOFIE,
            "external_id": "SOFIE",
            "source_id": DS_OPEN_DATA,
            "experiment_family": "SOFIE",
            "title": "Solid Fuel Ignition and Extinction (SOFIE)",
            "summary": "Testing flammability of spacecraft interior materials in exploration atmospheres (high O2, low pressure).",
            "mission_platform": "ISS CIR Rack",
            "gravity_environment": "microgravity",
            "objectives": ["flame_spread", "extinction", "flammability_limits"],
            "source_url": "https://psi.nasa.gov/sofie",
        },
    ]


def generate_experiment_runs():
    runs = []
    configs = [
        # Saffire-I runs (Fabric)
        (EXP_SAFFIRE_1, "Run 01 - Fabric Quiescent", "fabric", "fabric_cotton", "flat sheet", 21.0, 101.3, 0.0, True, True, False, "Rapid self-extinction in stagnant air", "high"),
        (EXP_SAFFIRE_1, "Run 02 - Fabric Low Flow", "fabric", "fabric_cotton", "flat sheet", 21.0, 101.3, 5.0, True, False, True, "Steady propagation maintained by forced flow", "high"),
        (EXP_SAFFIRE_1, "Run 03 - Fabric Nominal Flow", "fabric", "fabric_cotton", "flat sheet", 21.0, 101.3, 20.0, True, False, True, "Vigorous flame spread along surface", "high"),
        # Saffire-II runs (PMMA & Nomex)
        (EXP_SAFFIRE_2, "Run 01 - PMMA Slab Nominal", "polymer", "pmma", "thick slab", 21.0, 101.3, 20.0, True, False, True, "Continuous pyrolysis and sustained blue-orange flame", "high"),
        (EXP_SAFFIRE_2, "Run 02 - PMMA Low Flow", "polymer", "pmma", "thick slab", 21.0, 101.3, 4.0, True, True, False, "Flame quenched due to radiative cooling", "high"),
        (EXP_SAFFIRE_2, "Run 03 - Nomex Sample Flight Test", "fabric", "fabric_synthetic", "strip", 21.0, 101.3, 20.0, True, True, False, "Nomex self-extinguishes within 3.2 seconds", "high"),
        (EXP_SAFFIRE_2, "Run 04 - Nomex High O2", "fabric", "fabric_synthetic", "strip", 28.0, 70.0, 15.0, True, True, False, "Limited charring, failed to propagate", "high"),
        # Saffire-III runs
        (EXP_SAFFIRE_3, "Run 01 - Fabric Exploration Atm", "fabric", "fabric_cotton", "flat sheet", 30.0, 70.0, 20.0, True, False, True, "Elevated flame spread rate under 30% O2", "high"),
        (EXP_SAFFIRE_3, "Run 02 - Fabric Max Flow", "fabric", "fabric_cotton", "flat sheet", 24.0, 95.0, 25.0, True, False, True, "Accelerated flame front with smoke release", "high"),
        (EXP_SAFFIRE_3, "Run 03 - Fabric Reduced Pressure", "fabric", "fabric_cotton", "flat sheet", 28.0, 56.0, 10.0, True, False, True, "Sustained combustion with lower heat release", "medium"),
        # Saffire-IV runs
        (EXP_SAFFIRE_4, "Run 01 - Nomex Extended Test", "fabric", "fabric_synthetic", "weave", 32.0, 56.0, 15.0, True, True, False, "Extinguished at quenching boundary", "high"),
        (EXP_SAFFIRE_4, "Run 02 - Polyethylene Wire Insulation", "polymer", "polyethylene", "rod", 21.0, 101.3, 10.0, True, False, True, "Slow steady flame propagation along sample", "high"),
        (EXP_SAFFIRE_4, "Run 03 - Polyethylene Elevated Flow", "polymer", "polyethylene", "rod", 21.0, 101.3, 22.0, True, False, True, "Rapid dripping and flame extension", "high"),
        # BASS-I runs
        (EXP_BASS_1, "Run 01 - PMMA Cylinder Quiescent", "polymer", "pmma", "cylinder", 21.0, 101.3, 0.0, True, True, False, "Self-extinction in 6.4 seconds", "high"),
        (EXP_BASS_1, "Run 02 - PMMA Cylinder 2 cm/s", "polymer", "pmma", "cylinder", 21.0, 101.3, 2.0, True, True, False, "Marginal burning near extinction limit", "high"),
        (EXP_BASS_1, "Run 03 - PMMA Cylinder 5 cm/s", "polymer", "pmma", "cylinder", 21.0, 101.3, 5.0, True, False, True, "Stable flame attached to stagnation point", "high"),
        (EXP_BASS_1, "Run 04 - Polyethylene Rod Extinction", "polymer", "polyethylene", "rod", 18.0, 101.3, 3.0, True, True, False, "Quenched under sub-nominal oxygen", "medium"),
        # BASS-II runs
        (EXP_BASS_2, "Run 01 - Cotton Blend Glovebox Nominal", "fabric", "fabric_cotton", "strip", 21.0, 101.3, 5.0, True, False, True, "Steady uniform flame front propagation", "high"),
        (EXP_BASS_2, "Run 02 - Cotton Blend High Flow", "fabric", "fabric_cotton", "strip", 21.0, 101.3, 12.0, True, False, True, "Elongated flame front along convective drift", "high"),
        (EXP_BASS_2, "Run 03 - Cotton Blend 18% O2", "fabric", "fabric_cotton", "strip", 18.0, 101.3, 5.0, True, True, False, "Quenched near limiting oxygen concentration", "high"),
        (EXP_BASS_2, "Run 04 - PMMA Flat Sample 30% O2", "polymer", "pmma", "slab", 30.0, 70.0, 10.0, True, False, True, "High flame temperature and accelerated spread", "high"),
        # FLEX-1 runs
        (EXP_FLEX_1, "Run 01 - n-Heptane Droplet Standard", "liquid", "droplet_fuel", "droplet", 21.0, 101.3, 0.0, True, True, False, "Spherical flame with radiatively induced extinction", "high"),
        (EXP_FLEX_1, "Run 02 - Methanol Droplet Quiescent", "liquid", "droplet_fuel", "droplet", 21.0, 101.3, 0.0, True, True, False, "Clean non-sooting blue spherical halo", "high"),
        (EXP_FLEX_1, "Run 03 - Heptane Reduced Pressure", "liquid", "droplet_fuel", "droplet", 21.0, 60.0, 0.0, True, True, False, "Larger extinction diameter at low pressure", "high"),
        # FLEX-2 runs
        (EXP_FLEX_2, "Run 01 - Heptane Cool Flame Benchmark", "liquid", "droplet_fuel", "droplet", 21.0, 101.3, 0.0, True, True, False, "Hot flame extinguished at 8.4s followed by invisible cool flame", "high"),
        (EXP_FLEX_2, "Run 02 - Decane Droplet Combustion", "liquid", "droplet_fuel", "droplet", 21.0, 101.3, 0.0, True, True, False, "Second-stage cool flame combustion verified", "high"),
        (EXP_FLEX_2, "Run 03 - Droplet Oxygen Enriched", "liquid", "droplet_fuel", "droplet", 30.0, 101.3, 0.0, True, False, True, "Prolonged hot burning phase before extinction", "medium"),
        # ACME runs
        (EXP_CIR_ACME, "Run 01 - Gaseous Boundary Layer", "gas", "gas_fuel", "burner", 21.0, 101.3, 5.0, True, False, True, "Spherical co-flow diffusion boundary layer", "high"),
        (EXP_CIR_ACME, "Run 02 - Soot Limit Methane", "gas", "gas_fuel", "burner", 21.0, 101.3, 0.0, True, True, False, "Zero-buoyancy soot stagnation regime", "high"),
        # SOFIE runs
        (EXP_CIR_SOFIE, "Run 01 - Spacecraft Acrylic Exploration Atm", "polymer", "pmma", "slab", 34.0, 56.0, 8.0, True, False, True, "High flame spread rate in exploration atmosphere", "high"),
        (EXP_CIR_SOFIE, "Run 02 - Spacecraft Acrylic Earth Sea-Level", "polymer", "pmma", "slab", 21.0, 101.3, 5.0, True, False, True, "Controlled baseline flame spread", "high"),
        (EXP_CIR_SOFIE, "Run 03 - Nomex Exploration Atm LOC Test", "fabric", "fabric_synthetic", "strip", 34.0, 56.0, 5.0, True, True, False, "Nomex self-extinguished at 34% O2 under 56 kPa", "high"),
    ]

    for idx, cfg in enumerate(configs, start=1):
        exp_id, label, fuel, mat, geom, o2, press, flow, ign, ext, spread, summary, quality = cfg
        runs.append({
            "id": f"22222222-2222-2222-2222-22222233{idx:04d}",
            "experiment_id": exp_id,
            "run_label": label,
            "fuel_type": fuel,
            "material": mat,
            "geometry": geom,
            "gravity_environment": "microgravity",
            "oxygen_pct": o2,
            "pressure_kpa": press,
            "airflow_cm_s": flow,
            "ignition_observed": ign,
            "extinction_observed": ext,
            "flame_spread_observed": spread,
            "observation_summary": summary,
            "source_url": "https://psi.nasa.gov",
            "data_quality": quality,
            "provenance": {
                "field": "oxygen_pct",
                "value": o2,
                "source_type": "normalized",
                "source_location": f"telemetry_log_table_{idx}",
                "reviewed": True,
            },
        })
    return runs


def generate_habitat_presets():
    return [
        {
            "id": "55555555-5555-5555-5555-555555555501",
            "slug": "orbital",
            "display_name": "Orbital Spacecraft (0g Microgravity)",
            "destination": "orbital",
            "gravity_class": "microgravity",
            "gravity_value_g": 0.0,
            "external_environment_summary": "Low Earth orbit vacuum, solar radiation, thermal extremes",
            "default_oxygen_pct": 21.0,
            "default_pressure_kpa": 101.3,
            "default_airflow_cm_s": 5.0,
            "default_material": "pmma",
            "disclaimer": "Reference scenario defaults based on ISS nominal environment, not universal mission values.",
            "provenance": {"standard": "NASA-STD-3001 Volume 2"},
        },
        {
            "id": "55555555-5555-5555-5555-555555555502",
            "slug": "moon",
            "display_name": "Lunar Base Surface Habitat (0.16g)",
            "destination": "moon",
            "gravity_class": "partial_gravity_lunar",
            "gravity_value_g": 0.16,
            "external_environment_summary": "Lunar surface vacuum, 1/6th gravity, abrasive regolith",
            "default_oxygen_pct": 32.0,
            "default_pressure_kpa": 56.0,
            "default_airflow_cm_s": 8.0,
            "default_material": "fabric_cotton",
            "disclaimer": "Reference scenario defaults. GRAVITY TRANSFERABILITY WARNING: Microgravity flight evidence requires correction for partial buoyant convection.",
            "provenance": {"standard": "NASA Exploration Atmosphere Standards (SP-2013-4402)"},
        },
        {
            "id": "55555555-5555-5555-5555-555555555503",
            "slug": "mars",
            "display_name": "Mars Base Surface Habitat (0.38g)",
            "destination": "mars",
            "gravity_class": "partial_gravity_mars",
            "gravity_value_g": 0.38,
            "external_environment_summary": "Thin CO2 atmosphere (~0.6 kPa), 0.38g gravity, dust storms",
            "default_oxygen_pct": 28.0,
            "default_pressure_kpa": 70.0,
            "default_airflow_cm_s": 10.0,
            "default_material": "fabric_synthetic",
            "disclaimer": "Reference scenario defaults. GRAVITY TRANSFERABILITY WARNING: Partial buoyant convection re-emerges in 0.38g.",
            "provenance": {"standard": "NASA Human Integration Design Handbook (HIDH)"},
        },
    ]


def generate_source_documents():
    return [
        {
            "id": DOC_SAFFIRE_1,
            "source_id": DS_OPEN_DATA,
            "experiment_id": EXP_SAFFIRE_1,
            "title": "Saffire-I Flight Investigation Final Report",
            "document_type": "NASA Technical Memorandum",
            "source_url": "https://ntrs.nasa.gov/citations/20170002195",
            "citation_label": "NASA/TM-2017-219500",
            "raw_text_location": "s3://ignis-archive/sources/saffire1_tm.pdf",
            "checksum": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        },
        {
            "id": DOC_SAFFIRE_2,
            "source_id": DS_PSI,
            "experiment_id": EXP_SAFFIRE_2,
            "title": "Saffire-II Flammability Assessment of Solid Spacecraft Materials",
            "document_type": "Conference Paper",
            "source_url": "https://ntrs.nasa.gov/citations/20180004120",
            "citation_label": "AIAA 2018-0912",
            "raw_text_location": "s3://ignis-archive/sources/saffire2_aiaa.pdf",
            "checksum": "sha256:ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
        },
        {
            "id": DOC_BASS_2,
            "source_id": DS_OPEN_DATA,
            "experiment_id": EXP_BASS_2,
            "title": "BASS-II Flame Spread and Extinction in Enclosed Spacecraft Environments",
            "document_type": "Peer-Reviewed Article",
            "source_url": "https://doi.org/10.1016/j.combustflame.2016.08.012",
            "citation_label": "Combustion and Flame 174 (2016)",
            "raw_text_location": "s3://ignis-archive/sources/bass2_cnf.pdf",
            "checksum": "sha256:4e1243bd22c66e76c2ba9eddc1f91394e57f9f835f8a0029b38ec2c949c5e55e",
        },
        {
            "id": DOC_FLEX_2,
            "source_id": DS_OPEN_DATA,
            "experiment_id": EXP_FLEX_2,
            "title": "Droplet Combustion and Cool Flame Extinction in the CIR Rack",
            "document_type": "NASA Technical Memorandum",
            "source_url": "https://ntrs.nasa.gov/citations/20150018220",
            "citation_label": "NASA TM-2015-218820",
            "raw_text_location": "s3://ignis-archive/sources/flex2_tm.pdf",
            "checksum": "sha256:88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589",
        },
        {
            "id": DOC_CIR_ACME,
            "source_id": DS_PSI,
            "experiment_id": EXP_CIR_ACME,
            "title": "ACME Diffusion Flame Dynamics and Sooting Extinction Limits",
            "document_type": "NASA Technical Report",
            "source_url": "https://ntrs.nasa.gov/citations/20200001140",
            "citation_label": "NASA/CR-2020-220114",
            "raw_text_location": "s3://ignis-archive/sources/acme_cr.pdf",
            "checksum": "sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
        },
    ]


def generate_source_chunks():
    chunks = []
    text_samples = [
        (DOC_SAFFIRE_1, EXP_SAFFIRE_1, 0, "Saffire-I established that large-scale fabric samples ignite and maintain flame propagation in low forced airflow regimes (0.05 to 0.20 m/s), while complete absence of airflow causes rapid oxygen depletion and extinction."),
        (DOC_SAFFIRE_1, EXP_SAFFIRE_1, 1, "Thermocouple arrays indicated peak gas temperatures exceeding 1100 K in the active reaction zone, with flame propagation speeds varying linearly with forced flow velocity."),
        (DOC_SAFFIRE_2, EXP_SAFFIRE_2, 0, "Saffire-II confirmed PMMA acrylic flammability limits. Solid acrylic burned with a continuous bubbling melt layer and sustained spherical flame wrapper in microgravity."),
        (DOC_SAFFIRE_2, EXP_SAFFIRE_2, 1, "Nomex flight-suit fabric exhibited remarkable flame resistance, self-extinguishing rapidly after pilot igniter deactivation in standard 21% oxygen air."),
        (DOC_BASS_2, EXP_BASS_2, 0, "In the BASS-II glovebox experiments, cotton-fiberglass fabrics showed distinct extinction boundaries dependent on both concurrent air velocity and oxygen percentage."),
        (DOC_BASS_2, EXP_BASS_2, 1, "The limiting oxygen concentration (LOC) for thin fabrics in microgravity is slightly higher than on Earth due to the lack of buoyant convection aiding mass transport."),
        (DOC_FLEX_2, EXP_FLEX_2, 0, "In microgravity droplet combustion (FLEX-2), absence of buoyancy causes combustion products to disperse symmetrically via molecular diffusion, resulting in a serene blue spherical flame halo."),
        (DOC_FLEX_2, EXP_FLEX_2, 1, "After visible flame extinction at t=8.42s, the FLEX droplet entered a low-temperature cool flame regime with ongoing alkane consumption at 500-800 K."),
        (DOC_CIR_ACME, EXP_CIR_ACME, 0, "ACME gas burner investigations verified that soot formation is significantly altered in microgravity due to increased residence time in the reaction zone."),
        (DOC_CIR_ACME, EXP_CIR_ACME, 1, "Radiation quenching represents the dominant extinction mechanism for microgravity diffusion flames under low strain rates."),
    ]

    for idx, (doc_id, exp_id, c_idx, content) in enumerate(text_samples):
        # Generate placeholder 768-dim float array
        embedding = [round(0.005 * ((idx + i) % 17), 5) for i in range(768)]
        chunks.append({
            "id": f"66666666-6666-6666-6666-66666666{idx:04d}",
            "document_id": doc_id,
            "experiment_id": exp_id,
            "chunk_index": c_idx,
            "content": content,
            "embedding": embedding,
            "metadata": {"tokens": len(content.split()), "source": "NASA technical archive"},
        })
    return chunks


def generate_media_assets():
    return [
        {
            "id": MEDIA_FLEX_VIDEO,
            "source_id": DS_API,
            "experiment_id": EXP_FLEX_2,
            "run_id": "22222222-2222-2222-2222-222222330025",
            "media_type": "video",
            "source_url": "https://images.nasa.gov/details-iss040e089222.html",
            "local_or_cached_url": "/media/cached/flex2_droplet_combustion.mp4",
            "duration_seconds": 12.0,
            "metadata": {"resolution": "1920x1080", "fps": 30, "sample": "n-heptane droplet"},
        },
        {
            "id": MEDIA_SAFFIRE_IMG,
            "source_id": DS_OPEN_DATA,
            "experiment_id": EXP_SAFFIRE_1,
            "run_id": "22222222-2222-2222-2222-222222330002",
            "media_type": "image",
            "source_url": "https://www.nasa.gov/sites/default/files/thumbnails/image/saffire_flame.jpg",
            "local_or_cached_url": "/media/cached/saffire_flame_front.jpg",
            "duration_seconds": None,
            "metadata": {"instrument": "High-Definition Still Camera Array"},
        },
        {
            "id": MEDIA_BASS_IMG,
            "source_id": DS_OPEN_DATA,
            "experiment_id": EXP_BASS_2,
            "run_id": "22222222-2222-2222-2222-222222330018",
            "media_type": "image",
            "source_url": "https://psi.nasa.gov/bass2_flame_glovebox.png",
            "local_or_cached_url": "/media/cached/bass2_glovebox.png",
            "duration_seconds": None,
            "metadata": {"instrument": "MSG Internal Camera"},
        },
    ]


def generate_cv_measurements():
    measurements = []
    # 20 time-series points representing FLEX droplet combustion from t=0.0s to t=9.5s
    timestamps = [
        (0.0, 0.0, 0.0, 0.0, 320.0, 200.0, 0.99),
        (0.5, 450.0, 0.12, 12.0, 320.0, 200.0, 0.98),
        (1.0, 1850.0, 0.45, 24.0, 320.0, 200.0, 0.98),
        (1.5, 3400.0, 0.82, 38.0, 320.0, 200.0, 0.99),
        (2.0, 4800.0, 1.15, 52.0, 320.0, 200.0, 0.99),
        (2.5, 5400.0, 1.30, 58.0, 320.0, 200.0, 0.99),
        (3.0, 5750.0, 1.38, 60.0, 320.0, 200.0, 0.99),
        (3.5, 5920.0, 1.42, 61.5, 320.0, 200.0, 0.99),
        (4.0, 5900.0, 1.41, 61.0, 320.0, 200.0, 0.99),
        (4.5, 5850.0, 1.40, 60.8, 320.0, 200.0, 0.99),
        (5.0, 5700.0, 1.36, 59.5, 320.0, 200.0, 0.99),
        (5.5, 5500.0, 1.32, 57.2, 320.0, 200.0, 0.98),
        (6.0, 5200.0, 1.25, 54.0, 320.0, 200.0, 0.98),
        (6.5, 4800.0, 1.15, 50.0, 320.0, 200.0, 0.98),
        (7.0, 4100.0, 0.98, 44.0, 320.0, 200.0, 0.97),
        (7.5, 3100.0, 0.74, 35.0, 320.0, 200.0, 0.96),
        (8.0, 1800.0, 0.43, 22.0, 320.0, 200.0, 0.95),
        (8.4, 300.0, 0.07, 6.0, 320.0, 200.0, 0.92),
        (8.5, 0.0, 0.0, 0.0, 320.0, 200.0, 0.90),
        (9.0, 0.0, 0.0, 0.0, 320.0, 200.0, 0.90),
    ]

    for idx, (t, area, ratio, height, cx, cy, conf) in enumerate(timestamps):
        measurements.append({
            "id": f"77777777-7777-7777-7777-77777777{idx:04d}",
            "media_asset_id": MEDIA_FLEX_VIDEO,
            "timestamp_seconds": t,
            "flame_area_px": area,
            "flame_area_ratio": ratio,
            "flame_height_px": height,
            "centroid_x": cx,
            "centroid_y": cy,
            "confidence": conf,
            "model_version": "ignis-cv-hsv-v1.0.0",
        })
    return measurements


def generate_stories():
    return [
        {
            "id": "88888888-8888-8888-8888-888888888801",
            "slug": "microgravity-fire",
            "title": "Why Does Fire Burn as a Sphere in Space?",
            "summary": "Discover why zero-gravity combustion eliminates natural buoyancy convection, creating serene spherical flames where molecular diffusion dictates life and death.",
            "story_type": "science_explainer",
            "source_ids": [DS_OPEN_DATA, DS_PSI],
            "experiment_ids": [EXP_FLEX_2, EXP_SAFFIRE_1],
            "earthdata_context": None,
            "sections": [
                {
                    "order": 0,
                    "heading": "The Force That Shapes Candle Flames",
                    "content": "On Earth, when you light a candle, hot air expands and becomes less dense than the surrounding cold air. Gravity pulls the denser cold air downward, forcing the hot air to rise. This buoyant natural convection pulls fresh oxygen into the base and stretches the flame into a teardrop shape.",
                    "media_url": "https://images.nasa.gov/details-iss040e089222.html",
                    "media_type": "image",
                    "animation_key": "earth-teardrop-flame",
                    "evidence_card": {"principle": "Buoyant Convection", "earth_gravity": "1.0g"},
                    "suggested_question": "Why do microgravity flames form a sphere?",
                    "source_links": ["NASA Glenn Research Center Drop Tower Archives"],
                },
                {
                    "order": 1,
                    "heading": "The Freefall Revolution",
                    "content": "In microgravity aboard the ISS, gravity is cancelled by orbital freefall. Hot combustion gases no longer rise. Without buoyancy, oxygen cannot be pulled into the flame base by convection. Instead, oxygen must slowly migrate into the reaction zone purely via molecular diffusion.",
                    "media_url": "/media/cached/flex2_droplet_combustion.mp4",
                    "media_type": "video",
                    "animation_key": "spherical-diffusion-halo",
                    "evidence_card": {"experiment": "FLEX-2", "observation": "Spherical blue diffusion shell"},
                    "suggested_question": "How does molecular diffusion replace convection in orbit?",
                    "source_links": ["NASA TM-2015-218820 (FLEX-2)"],
                },
                {
                    "order": 2,
                    "heading": "Suffocation and the Life-Support Paradox",
                    "content": "Because oxygen moves so slowly without convection, a zero-gravity flame in completely stagnant air quickly suffocates in its own carbon dioxide shell. However, the gentle breeze from spacecraft life-support ventilation (0.05 to 0.20 m/s) sweeps the CO2 away and feeds the flame fresh oxidizer.",
                    "media_url": None,
                    "media_type": None,
                    "animation_key": "stagnant-suffocation-graph",
                    "evidence_card": {"experiment": "Saffire-I", "finding": "Quenching under 0 m/s airflow"},
                    "suggested_question": "What did Saffire discover about spacecraft ventilation?",
                    "source_links": ["Saffire-I Flight Report (NASA/TM-2017-219500)"],
                },
            ],
            "published": True,
        },
        {
            "id": "88888888-8888-8888-8888-888888888802",
            "slug": "fire-from-space",
            "title": "Fire from Space vs Fire in Space",
            "summary": "Bridging NASA Earthdata satellite thermal anomaly detection of terrestrial wildfires with microgravity combustion inside the Cygnus spacecraft.",
            "story_type": "earthdata_bridge",
            "source_ids": [DS_EARTHDATA, DS_OPEN_DATA],
            "experiment_ids": [EXP_SAFFIRE_2],
            "earthdata_context": {
                "sensor_platform": "Terra/Aqua MODIS & Suomi NPP VIIRS",
                "bands": "Thermal Infrared 3.9µm and 11µm",
                "application": "Active Fire Detection & Burned Area Mapping",
                "satellite_provider": "NASA LANCE FIRMS",
            },
            "sections": [
                {
                    "order": 0,
                    "heading": "Planetary Heat Signatures",
                    "content": "From 700 kilometers above Earth, NASA satellites monitor our planet's fiery metabolism. Sensors on MODIS and VIIRS detect middle-infrared emissions, pinpointing active wildfire fronts in near real-time through the FIRMS system.",
                    "media_url": "https://firms.modaps.eosdis.nasa.gov",
                    "media_type": "data_visualization",
                    "animation_key": "satellite-earth-orbit",
                    "evidence_card": {"source": "NASA FIRMS", "resolution": "375-meter active fire pixel"},
                    "suggested_question": "How does NASA detect wildfires from orbit?",
                    "source_links": ["NASA Earthdata FIRMS Data User Guide"],
                },
                {
                    "order": 1,
                    "heading": "The Enclosed Cygnus Chamber",
                    "content": "While satellites gaze downward at continent-scale fires, engineers inside the Cygnus vehicle after ISS unberthing ignited the largest deliberate fires ever conducted in space. Here, the challenge is microscopic containment rather than planetary observation.",
                    "media_url": None,
                    "media_type": None,
                    "animation_key": "cygnus-burn-chamber",
                    "evidence_card": {"experiment": "Saffire-II", "sample_size": "Large-scale PMMA and fabric"},
                    "suggested_question": "Why did NASA burn Cygnus spacecraft after departing ISS?",
                    "source_links": ["AIAA 2018-0912 (Saffire-II)"],
                },
            ],
            "published": True,
        },
    ]


def main():
    generators = {
        "data_sources.json": generate_data_sources(),
        "experiments.json": generate_experiments(),
        "experiment_runs.json": generate_experiment_runs(),
        "habitat_presets.json": generate_habitat_presets(),
        "source_documents.json": generate_source_documents(),
        "source_chunks.json": generate_source_chunks(),
        "media_assets.json": generate_media_assets(),
        "cv_measurements.json": generate_cv_measurements(),
        "stories.json": generate_stories(),
    }

    for filename, data in generators.items():
        file_path = FIXTURES_DIR / filename
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"Generated {file_path.name}: {len(data)} records")


if __name__ == "__main__":
    main()
