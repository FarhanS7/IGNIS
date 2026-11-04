# STEP 03: ML Data Acquisition, Licenses, Schema Inspection (NO TRAINING)

Branch: `feature/fire-response-ml` | Depends on: Step 02 | Est: 3 h | Approval gate: yes

## Objective
Get the real datasets, prove their licenses and hashes, and describe their schemas so later models are designed on facts.

## Datasets
| Id | Dataset | Where | Needed for |
|---|---|---|---|
| D1 | Indoor Fire Dataset, EN54 test room (v2) | Mendeley Data DOI 10.17632/npk2zcm85h.2 (page: data.mendeley.com/datasets/npk2zcm85h) | M2 |
| D2 | Indoor Fire Dataset, industrial hall | DOI 10.17632/yghykzm4km.1 (data.mendeley.com/datasets/yghykzm4km) | M2 (cross-site test) |
| D3 | Indoor Fire Dataset, small test chamber | DOI 10.17632/m85f9h6g9j.1 (data.mendeley.com/datasets/m85f9h6g9j) | optional extra |
| D4 | NASA SAME (PSI-102) | DOI 10.60555/gd4k-8h62, CC0-1.0 | M1 |
| D5 | NASA SAME-R (PSI-101) | DOI 10.60555/2np7-jv14 | M1 |
| D6 | FLEX droplet runs | ALREADY in repo: `data/processed/evidence_runs.json` (droplet tier) | M4 |

Licenses for D1-D3 were NOT confirmed (blank in search results). Read the license on each Mendeley page. If CC BY, attribution
is mandatory (cite authors/DOI in README and About). If unclear, STOP.

## Tasks
1. `git branch --show-current` -> `feature/fire-response-ml`. `npm test` baseline recorded.
2. Create folders: `scripts/ml/{data,m2_fusion,m1_same,m4_flex,m5_abstain,export,common,tests}`, `docs/models/`, `data/raw_ml/` (gitignored already).
   Add `scripts/ml/__init__.py` files.
3. Create `requirements-ml.txt` with exact pinned versions of: numpy, pandas, scipy, scikit-learn, pytest, pyarrow only if needed. Use
   `pip show <pkg>` for the installed versions. Add a comment with the Python version. Do not add other packages.
4. Write `scripts/ml/data/download.py`:
   - Mendeley files usually need a browser download. The script must NOT scrape. It takes a `--check` mode that verifies the
     expected files exist in `data/raw_ml/<id>/` and computes SHA-256, row counts (for CSV/XLSX), and writes/updates
     `data/provenance/ml_manifest.json`.
   - HUMAN downloads D1-D3 manually from the Mendeley pages into `data/raw_ml/d1_en54/`, `d2_hall/`, `d3_chamber/`.
     The agent lists the exact URLs for the human and WAITS (STOP) if the files are missing.
   - PSI (D4, D5): try the same endpoint pattern the repo already used for other investigations
     (`https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-101` and `.../PSI-102`; see `scripts/ingest/ingest_all.py` for the
     exact working pattern). Save to `data/raw_ml/d4_same/`, `d5_samer/`. If the endpoint fails, STOP and ask the human for a manual download.
5. `data/provenance/ml_manifest.json` entries: {id, name, source_url, doi, license, license_url, access_date, files:[{name, bytes, sha256}], notes}.
6. Write `scripts/ml/data/inspect.py` that, for each dataset, prints: files, row/column counts, column names + dtypes + units if
   stated, label columns and their value counts, experiment/scenario/repetition identifiers, sampling interval, sensor node ids,
   and whether SOURCE POSITION is recoverable. Save the output to `docs/models/data_inspection.md`.
7. In `data_inspection.md` add a CHANNEL MAPPING table: which dataset columns correspond to the console's three channels
   (smoke proxy, CO, temperature [+ optional H2, CO2]) and which columns are unusable in a spacecraft context (e.g., UV, VOC). 
8. For D4/D5 (SAME/SAME-R): list every column, units, what the detector output columns are (photoelectric / ionization / moments),
   material, aging time, flow, particle-size metrics. State clearly whether "detector response vs particle size per material" is derivable.
9. Add `scripts/ml/tests/test_manifest.py`: manifest is valid JSON, every entry has license + sha256 for each file; hashes match files
   when data is present (skip with a clear message when raw data is absent so CI passes without data).
10. CI: add a job `ml` to `.github/workflows/ci.yml`: install requirements-ml.txt, run `python -m pytest scripts/ml/tests -q`.
    Real-data tests must auto-skip in CI.

## Verification block
```powershell
python -m pytest scripts/ml/tests -q
python scripts/ml/data/download.py --check
git status    # no raw data staged
npm test
```

## Acceptance criteria
- [ ] ml_manifest.json complete with licenses + hashes (or STOP raised for unclear licenses)
- [ ] data_inspection.md written with real numbers (rows, columns, labels, groups, source-position answer, SAME columns)
- [ ] Channel mapping table present
- [ ] CI ml job added; tests pass locally
- [ ] Nothing from data/raw_ml committed

## STOP conditions
License unclear; a dataset missing and not downloadable; PSI endpoint fails; schema makes the planned model impossible (report and propose alternative, do not change the plan silently).
