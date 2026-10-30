# NASA Physical Sciences Informatics (PSI) Ingestion Pipeline

This directory contains the production data ingestion pipeline for downloading and processing genuine NASA microgravity combustion research data from the [NASA Physical Sciences Informatics (PSI)](https://psi.nasa.gov) repository.

All data is distributed by NASA under the **Creative Commons Zero v1.0 Universal (CC0-1.0)** public domain license.

---

## 1. How the NASA PSI API Works

NASA PSI is built on an Angular single-page frontend (`/physci/repo/`) backed by a REST API gateway termed **Geode** (`/geode-py/ws/`). 

### Core Endpoints

1. **Investigation Catalog / Search**:
   - `GET https://psi.nasa.gov/geode-py/ws/repo/search?size={N}`
   - Backed by Elasticsearch. Returns array of study/investigation records including Accession IDs (`PSI-1` through `PSI-159`), Titles, DOIs, Disciplines, Flight Platforms, and Science Goals.

2. **Investigation Metadata & File Tree**:
   - `GET https://psi.nasa.gov/geode-py/ws/repo/investigations/{Accession}`
   - Example: `https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-25`
   - Returns structured JSON containing:
     - `experimentalTable`: Array of primary experimental CSV tables with file sizes, S3 paths, and versions.
     - `added`: Array of all associated data files (readmes, calibration curves, test matrices, telemetry, imagery).
     - `doi`: DataCite persistent digital object identifier (e.g., `10.60555/4qc4-de67`).
     - `publications`: Complete list of published journal articles and NASA Technical Reports with DOIs and author lists.

3. **Presigned AWS S3 Download URL Resolution**:
   - `GET https://psi.nasa.gov/geode-py/ws/studies/{Accession}/download?file={FileName}&version={Version}&redirect=false`
   - The PSI backend verifies the file is public and generates a temporary pre-authenticated AWS S3 URL (`https://psi-repo-prod.s3.amazonaws.com/...`).
   - The client then downloads the file directly from S3 via standard HTTPS.

### Quirks & Operational Notes
- **Strict TLS**: The server uses standard DoD/NASA SSL certificates. The ingestion script uses default Python `ssl.create_default_context()` without any certificate validation bypass.
- **URL Encoding**: File names containing spaces and plus signs must be query-encoded (`urllib.parse.urlencode`).
- **Missing S3 Keys**: Occasional files registered in the metadata index have been moved or removed on S3 (e.g., `PSI-98_Raw Data_Saffire-I Telemetry Data Good Process Version.xlsx` returns HTTP 404). All errors are systematically logged to `data/raw/_errors.log`.

---

## 2. Ingestion & Analysis Workflow

1. **`ingest_all.py`**: Queries the Geode API for 14 target microgravity combustion investigations (BASS, BASS-II, FLEX, FLEX-2, SAFFIRE-I, II, III, CFI, and ACME sub-campaigns). Downloads all experimental CSV tables, metadata JSONs, test matrices, and calibration sheets into `data/raw/`. Computes SHA-256 hashes and records them in `data/provenance/manifest.json`.
2. **`verify_manifest.py`**: Verifies that every file on disk in `data/raw/` matches the size and SHA-256 recorded in `data/provenance/manifest.json`.
3. **`parse_tables.py`**: Reads every raw CSV, computes statistical profiles (row counts, columns, null rates, value bounds), converts raw files into standardized clean CSVs in `data/processed/`, and generates `docs/DATA_INVENTORY.md`.

---

## 3. Reproduction Instructions

To reproduce the full ingestion and data processing pipeline from scratch:

```bash
# 1. Run full ingestion from repository root
python scripts/ingest/ingest_all.py

# 2. Verify SHA-256 checksums and manifest integrity
python scripts/ingest/verify_manifest.py

# 3. Parse tables, generate cleaned CSVs, and update documentation
python scripts/ingest/parse_tables.py
```
