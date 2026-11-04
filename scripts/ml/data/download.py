"""ML Data Acquisition and Verification Script for IGNIS Fire Response Models.

Downloads open-access NASA microgravity telemetry (D4: SAME / PSI-102, D5: SAME-R / PSI-101)
via official NASA PSI presigned S3 URLs (CC0-1.0).
Downloads Mendeley benchmark datasets (D1: EN54, D2: Industrial Hall, D3: Test Chamber)
via official Mendeley Data public endpoints under CC BY 4.0 license, and records D6 (FLEX droplet runs).
Maintains data/provenance/ml_manifest.json.
"""

import os
import sys
import ssl
import json
import hashlib
import argparse
import urllib.request
import urllib.parse
from datetime import datetime, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..'))
RAW_ML_DIR = os.path.join(BASE_DIR, 'data', 'raw_ml')
PROVENANCE_DIR = os.path.join(BASE_DIR, 'data', 'provenance')
MANIFEST_PATH = os.path.join(PROVENANCE_DIR, 'ml_manifest.json')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/csv, */*'
}

DATASET_CONFIGS = {
    'D1': {
        'id': 'D1',
        'name': 'Indoor Fire Dataset with Distributed Multi-Sensor Nodes (EN54 Test Room)',
        'source_url': 'https://data.mendeley.com/datasets/npk2zcm85h/2',
        'doi': '10.17632/npk2zcm85h.2',
        'license': 'CC BY 4.0',
        'license_url': 'https://creativecommons.org/licenses/by/4.0/',
        'dir_name': 'd1_en54',
        'mendeley_id': 'npk2zcm85h',
        'version': 2,
        'files_to_download': [
            {
                'name': 'Indoor Fire Dataset with Distributed Multi-Sensor Nodes.csv',
                'file_id': '0c5ed6b5-d59a-4e09-ada2-6f58e34b7666',
                'url': 'https://data.mendeley.com/public-files/datasets/npk2zcm85h/files/0c5ed6b5-d59a-4e09-ada2-6f58e34b7666/file_downloaded'
            }
        ],
        'notes': 'Multi-sensor EN54 fire and nuisance experiments by Pascal Vorwerk et al. (MDPI Fire 2023, 6, 323). Used for M2 sensor fusion detector training/validation.'
    },
    'D2': {
        'id': 'D2',
        'name': 'Indoor Fire Dataset with Distributed Multi-Sensor Nodes (Industrial Hall)',
        'source_url': 'https://data.mendeley.com/datasets/yghykzm4km/1',
        'doi': '10.17632/yghykzm4km.1',
        'license': 'CC BY 4.0',
        'license_url': 'https://creativecommons.org/licenses/by/4.0/',
        'dir_name': 'd2_hall',
        'mendeley_id': 'yghykzm4km',
        'version': 1,
        'files_to_download': [
            {
                'name': 'Indoor Fire Dataset with Distributed Multi-Sensor Nodes_Industrial Hall.csv',
                'file_id': 'ac22049a-6c73-4276-8583-05b2cf735601',
                'url': 'https://data.mendeley.com/public-files/datasets/yghykzm4km/files/ac22049a-6c73-4276-8583-05b2cf735601/file_downloaded'
            }
        ],
        'notes': 'Distributed multi-sensor nodes in 10x22x8 m3 industrial hall by Otto von Guericke University Magdeburg. Used for M2 cross-site generalization testing.'
    },
    'D3': {
        'id': 'D3',
        'name': 'Indoor Fire Dataset of Multi Sensor Data (Small Scale Test Chamber)',
        'source_url': 'https://data.mendeley.com/datasets/m85f9h6g9j/1',
        'doi': '10.17632/m85f9h6g9j.1',
        'license': 'CC BY 4.0',
        'license_url': 'https://creativecommons.org/licenses/by/4.0/',
        'dir_name': 'd3_chamber',
        'mendeley_id': 'm85f9h6g9j',
        'version': 1,
        'files_to_download': [
            {
                'name': 'Laboratory Fire Dataset containing Multi Sensor Data.csv',
                'file_id': '29a2fde9-469a-4ed6-add7-006f8edd8c2c',
                'url': 'https://data.mendeley.com/public-files/datasets/m85f9h6g9j/files/29a2fde9-469a-4ed6-add7-006f8edd8c2c/file_downloaded'
            }
        ],
        'notes': 'Multi-sensor chamber fire test dataset. Optional benchmark evaluation.'
    },
    'D4': {
        'id': 'D4',
        'name': 'Smoke and Aerosol Measurement Experiment (SAME / PSI-102)',
        'source_url': 'https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-102',
        'doi': '10.60555/gd4k-8h62',
        'license': 'CC0-1.0',
        'license_url': 'https://creativecommons.org/publicdomain/zero/1.0/',
        'dir_name': 'd4_same',
        'files_to_download': [
            'PSI-102_Experimental table_SAME.csv'
        ],
        'notes': 'NASA flight microgravity smoke particle size distribution and detector response investigation. Used for M1 detector response modeling.'
    },
    'D5': {
        'id': 'D5',
        'name': 'Smoke Aerosol Measurement Experiment-Reflight (SAME-R / PSI-101)',
        'source_url': 'https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-101',
        'doi': '10.60555/2np7-jv14',
        'license': 'CC0-1.0',
        'license_url': 'https://creativecommons.org/publicdomain/zero/1.0/',
        'dir_name': 'd5_samer',
        'files_to_download': [
            'PSI-101_Experimental table_SAME-R.csv',
            'PSI-101_Analyzed Data_SAME, SAME-R_Results.xlsx'
        ],
        'notes': 'NASA flight reflight microgravity smoke particle moments and detector responses across spacecraft materials (Teflon, Kapton, Silicone, Lampwick, Pyrell). Used for M1 detector response calibration.'
    },
    'D6': {
        'id': 'D6',
        'name': 'Flame Extinguishment Experiment (FLEX / PSI-69 & FLEX-2 / PSI-68 Droplet Runs)',
        'source_url': 'https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-69',
        'doi': '10.60555/psi-69-flex',
        'license': 'CC0-1.0',
        'license_url': 'https://creativecommons.org/publicdomain/zero/1.0/',
        'dir_name': None,  # already in repo at data/processed/evidence_runs.json
        'existing_file': os.path.join(BASE_DIR, 'data', 'processed', 'evidence_runs.json'),
        'notes': 'Pre-processed NASA flight droplet microgravity extinction and burning experiments. Already integrated into repo evidence tier. Used for M4 extinction model.'
    }
}


def compute_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def count_rows(filepath: str) -> int:
    """Count data rows in CSV or XLSX file."""
    ext = os.path.splitext(filepath)[1].lower()
    if ext == '.csv':
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                lines = sum(1 for _ in f)
                return max(0, lines - 1)
        except Exception:
            return 0
    elif ext == '.xlsx':
        try:
            import pandas as pd
            xl = pd.ExcelFile(filepath)
            total = 0
            for sheet in xl.sheet_names:
                df = xl.parse(sheet)
                total += len(df)
            return total
        except Exception:
            return 0
    elif ext == '.json':
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    return len(data)
                elif isinstance(data, dict):
                    return len(data)
        except Exception:
            return 0
    return 0


def download_mendeley_file(download_url: str, filename: str, target_dir: str) -> bool:
    """Download a file directly from Mendeley's public download endpoint."""
    ctx = ssl.create_default_context()
    target_path = os.path.join(target_dir, filename)

    print(f"Downloading Mendeley dataset file: {filename} ...")
    try:
        req = urllib.request.Request(download_url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=120) as resp:
            content = resp.read()
            with open(target_path, 'wb') as f:
                f.write(content)
        print(f"  -> SUCCESS ({len(content)} bytes saved to {os.path.relpath(target_path, BASE_DIR)})")
        return True
    except Exception as e:
        print(f"  ERROR downloading {filename} from {download_url}: {e}")
        return False


def download_nasa_psi_file(accession: str, filename: str, target_dir: str) -> bool:
    """Download a file from NASA PSI using the presigned URL endpoint."""
    ctx = ssl.create_default_context()
    params = urllib.parse.urlencode({
        'file': filename,
        'version': '1',
        'redirect': 'false'
    })
    endpoint = f"https://psi.nasa.gov/geode-py/ws/studies/{accession}/download?{params}"
    target_path = os.path.join(target_dir, filename)

    print(f"Fetching download URL for [{accession}] {filename} ...")
    try:
        req = urllib.request.Request(endpoint, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=25) as resp:
            s3_url = resp.read().decode('utf-8').strip()
            if not s3_url.startswith('http'):
                print(f"  ERROR: Presigned endpoint returned invalid response: {s3_url[:200]}")
                return False

        print(f"  Downloading from S3 to {os.path.relpath(target_path, BASE_DIR)} ...")
        req2 = urllib.request.Request(s3_url, headers=HEADERS)
        with urllib.request.urlopen(req2, context=ctx, timeout=120) as resp2:
            content = resp2.read()
            with open(target_path, 'wb') as f:
                f.write(content)
        print(f"  -> SUCCESS ({len(content)} bytes)")
        return True
    except Exception as e:
        print(f"  ERROR downloading {filename}: {e}")
        return False


def download_nasa_psi_metadata(accession: str, target_dir: str) -> bool:
    """Save investigation metadata JSON from NASA PSI."""
    ctx = ssl.create_default_context()
    url = f"https://psi.nasa.gov/geode-py/ws/repo/investigations/{accession}"
    target_path = os.path.join(target_dir, f"{accession}_metadata.json")
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=25) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            with open(target_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
        print(f"Saved metadata for [{accession}] to {os.path.relpath(target_path, BASE_DIR)}")
        return True
    except Exception as e:
        print(f"ERROR saving metadata for {accession}: {e}")
        return False


def build_manifest(check_mode: bool = False):
    """Scan raw ML datasets, compute sha256 and row counts, and update ml_manifest.json."""
    os.makedirs(PROVENANCE_DIR, exist_ok=True)
    os.makedirs(RAW_ML_DIR, exist_ok=True)

    manifest_entries = []
    missing_manual_datasets = []

    for ds_id, cfg in DATASET_CONFIGS.items():
        entry = {
            'id': cfg['id'],
            'name': cfg['name'],
            'source_url': cfg['source_url'],
            'doi': cfg['doi'],
            'license': cfg['license'],
            'license_url': cfg['license_url'],
            'access_date': datetime.now(timezone.utc).isoformat(),
            'files': [],
            'notes': cfg['notes']
        }

        if cfg.get('existing_file'):
            # D6
            filepath = cfg['existing_file']
            if os.path.exists(filepath):
                fname = os.path.basename(filepath)
                fsize = os.path.getsize(filepath)
                fhash = compute_sha256(filepath)
                frows = count_rows(filepath)
                entry['files'].append({
                    'name': fname,
                    'relative_path': os.path.relpath(filepath, BASE_DIR).replace('\\', '/'),
                    'bytes': fsize,
                    'sha256': fhash,
                    'rows': frows
                })
            else:
                print(f"Warning: Existing dataset file missing: {filepath}")
        elif cfg.get('dir_name'):
            ds_dir = os.path.join(RAW_ML_DIR, cfg['dir_name'])
            os.makedirs(ds_dir, exist_ok=True)

            found_files = []
            if os.path.exists(ds_dir):
                for f in sorted(os.listdir(ds_dir)):
                    full_p = os.path.join(ds_dir, f)
                    if os.path.isfile(full_p):
                        fsize = os.path.getsize(full_p)
                        fhash = compute_sha256(full_p)
                        frows = count_rows(full_p)
                        found_files.append({
                            'name': f,
                            'relative_path': os.path.relpath(full_p, BASE_DIR).replace('\\', '/'),
                            'bytes': fsize,
                            'sha256': fhash,
                            'rows': frows
                        })

            entry['files'] = found_files

            if ds_id in ['D1', 'D2', 'D3'] and len(found_files) == 0:
                missing_manual_datasets.append((ds_id, cfg['name'], cfg['source_url'], cfg['dir_name']))

        manifest_entries.append(entry)

    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest_entries, f, indent=2)

    print(f"\nUpdated ML manifest: {os.path.relpath(MANIFEST_PATH, BASE_DIR)}")
    for entry in manifest_entries:
        print(f"  [{entry['id']}] {entry['name']}: {len(entry['files'])} files recorded")
        for f in entry['files']:
            print(f"     - {f['name']} ({f['bytes']} bytes, {f.get('rows', 0)} rows, sha256: {f['sha256'][:12]}...)")

    if missing_manual_datasets:
        print("\n" + "=" * 78)
        print("ACTION REQUIRED (HUMAN DOWNLOAD FOR D1-D3):")
        print("The following Mendeley datasets require browser download into data/raw_ml/:")
        for ds_id, name, url, dirname in missing_manual_datasets:
            print(f"  [{ds_id}] {name}")
            print(f"        URL: {url}")
            print(f"        Target Directory: data/raw_ml/{dirname}/")
        print("=" * 78 + "\n")
        return False
    return True


def run_download():
    """Download NASA PSI datasets (D4, D5) and Mendeley datasets (D1, D2, D3)."""
    print("=== Downloading NASA PSI Telemetry Datasets (D4 & D5) ===")

    # D4: PSI-102 (SAME)
    d4_dir = os.path.join(RAW_ML_DIR, 'd4_same')
    os.makedirs(d4_dir, exist_ok=True)
    download_nasa_psi_metadata('PSI-102', d4_dir)
    for fname in DATASET_CONFIGS['D4']['files_to_download']:
        download_nasa_psi_file('PSI-102', fname, d4_dir)

    # D5: PSI-101 (SAME-R)
    d5_dir = os.path.join(RAW_ML_DIR, 'd5_samer')
    os.makedirs(d5_dir, exist_ok=True)
    download_nasa_psi_metadata('PSI-101', d5_dir)
    for fname in DATASET_CONFIGS['D5']['files_to_download']:
        download_nasa_psi_file('PSI-101', fname, d5_dir)

    print("\n=== Downloading Mendeley Datasets (D1, D2, D3) ===")
    for ds_id in ['D1', 'D2', 'D3']:
        cfg = DATASET_CONFIGS[ds_id]
        t_dir = os.path.join(RAW_ML_DIR, cfg['dir_name'])
        os.makedirs(t_dir, exist_ok=True)
        for item in cfg.get('files_to_download', []):
            dest_file = os.path.join(t_dir, item['name'])
            if not os.path.exists(dest_file):
                download_mendeley_file(item['url'], item['name'], t_dir)
            else:
                print(f"File {item['name']} already exists in {cfg['dir_name']}.")

    print("\n=== Updating Manifest ===")
    return build_manifest(check_mode=False)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="ML Data Acquisition and Verification")
    parser.add_argument('--check', action='store_true', help="Verify manifest and dataset files without redownloading")
    args = parser.parse_args()

    if args.check:
        success = build_manifest(check_mode=True)
        if not success:
            sys.exit(2)
    else:
        success = run_download()
        if not success:
            sys.exit(2)
