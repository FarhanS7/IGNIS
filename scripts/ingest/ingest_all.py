"""NASA Physical Sciences Informatics (PSI) Ingestion Engine.

Downloads real microgravity combustion experimental tables, investigation metadata,
and data dictionaries / calibrated telemetry from the official NASA PSI portal (CC0-1.0).
Strict TLS verification enabled using system default CA certificates.
"""

import os
import sys
import ssl
import json
import hashlib
import urllib.request
import urllib.parse
from datetime import datetime, timezone

# Strict TLS Context (Default verification, no CERT_NONE)
try:
    ssl_context = ssl.create_default_context()
except Exception as e:
    print(f"Error initializing default SSL context: {e}", file=sys.stderr)
    sys.exit(1)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) IGNIS-NASA-SpaceApps/2.0'
}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..'))
RAW_DIR = os.path.join(BASE_DIR, 'data', 'raw')
PROCESSED_DIR = os.path.join(BASE_DIR, 'data', 'processed')
PROVENANCE_DIR = os.path.join(BASE_DIR, 'data', 'provenance')
ERROR_LOG = os.path.join(RAW_DIR, '_errors.log')
MANIFEST_PATH = os.path.join(PROVENANCE_DIR, 'manifest.json')

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)
os.makedirs(PROVENANCE_DIR, exist_ok=True)

# Target NASA PSI Combustion Investigations
TARGET_INVESTIGATIONS = [
    'PSI-25',   # BASS-II (Burning and Suppression of Solids - II)
    'PSI-69',   # FLEX (Flame Extinguishment Experiment)
    'PSI-98',   # SAFFIRE-I (Spacecraft Fire Safety Experiment-I)
    'PSI-26',   # BASS (Burning and Suppression of Solids)
    'PSI-100',  # SAFFIRE-III (Spacecraft Fire Experiment-III)
    'PSI-99',   # SAFFIRE-II (Spacecraft Fire Experiment-II)
    'PSI-68',   # FLEX-2 (Flame Extinguishment Experiment - 2)
    'PSI-10',   # ACME Flame Design
    'PSI-20',   # ACME BRE (Burning Rate Emulator)
    'PSI-21',   # ACME CLD Flame (Coflow Laminar Diffusion Flame)
    'PSI-22',   # ACME E-FIELD Flames
    'PSI-23',   # ACME s-Flame
    'PSI-39',   # CFI (Cool Flames Investigation)
    'PSI-159',  # ACME CFI-G (Cool Flames Investigation with Gases)
]

manifest_records = []
errors = []

def log_error(url, reason):
    msg = f"[{datetime.now(timezone.utc).isoformat()}] FAILED: {url} | Reason: {reason}"
    print(msg, file=sys.stderr)
    errors.append(msg)
    with open(ERROR_LOG, 'a', encoding='utf-8') as f:
        f.write(msg + '\n')

def compute_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def get_presigned_url(accession, filename, version=1):
    params = urllib.parse.urlencode({
        'file': filename,
        'version': str(version),
        'redirect': 'false'
    })
    endpoint = f"https://psi.nasa.gov/geode-py/ws/studies/{accession}/download?{params}"
    req = urllib.request.Request(endpoint, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ssl_context, timeout=25) as resp:
            res = resp.read().decode('utf-8').strip()
            if res.startswith('http'):
                return res
            raise ValueError(f"Endpoint did not return HTTP download URL: {res[:200]}")
    except ssl.SSLError as e:
        log_error(endpoint, f"SSL verification failed for host psi.nasa.gov: {e}")
        raise
    except Exception as e:
        log_error(endpoint, f"Failed to retrieve presigned URL: {e}")
        raise

def download_file(accession, filename, doi, license_name, target_dir, version=1):
    original_url = f"https://psi.nasa.gov/physci/repo/data/investigations/{accession}/{filename}"
    target_path = os.path.join(target_dir, filename)
    
    print(f"Downloading [{accession}] {filename} ...")
    try:
        s3_url = get_presigned_url(accession, filename, version=version)
        req = urllib.request.Request(s3_url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ssl_context, timeout=60) as resp:
            content = resp.read()
            with open(target_path, 'wb') as f:
                f.write(content)
        
        file_size = len(content)
        sha256_hash = compute_sha256(target_path)
        access_date = datetime.now(timezone.utc).isoformat()
        
        record = {
            "investigation_id": accession,
            "file_name": filename,
            "doi": doi,
            "original_url": original_url,
            "access_date": access_date,
            "file_size_bytes": file_size,
            "sha256": sha256_hash,
            "license": license_name or "CC0-1.0",
            "saved_path": os.path.relpath(target_path, BASE_DIR).replace('\\', '/')
        }
        manifest_records.append(record)
        print(f"  -> SUCCESS ({file_size} bytes, sha256: {sha256_hash[:12]}...)")
        return target_path
    except ssl.SSLError as e:
        log_error(original_url, f"SSL verification failed during S3 file download: {e}")
        return None
    except Exception as e:
        log_error(original_url, str(e))
        return None

def run_ingestion():
    # Clear previous error log if any
    if os.path.exists(ERROR_LOG):
        os.remove(ERROR_LOG)

    for accession in TARGET_INVESTIGATIONS:
        meta_url = f"https://psi.nasa.gov/geode-py/ws/repo/investigations/{accession}"
        print(f"\n=======================================================")
        print(f"Querying metadata for {accession} ...")
        try:
            req = urllib.request.Request(meta_url, headers=HEADERS)
            with urllib.request.urlopen(req, context=ssl_context, timeout=20) as resp:
                meta = json.loads(resp.read().decode('utf-8'))
        except ssl.SSLError as e:
            log_error(meta_url, f"SSL verification failed on psi.nasa.gov: {e}")
            continue
        except Exception as e:
            log_error(meta_url, f"Failed to fetch metadata: {e}")
            continue

        title = meta.get('title')
        acronym = meta.get('investigationAcronym')
        doi = meta.get('doi')
        license_id = meta.get('licenseIdentifier') or 'CC0-1.0'
        print(f"  Title: {title}\n  Acronym: {acronym}\n  DOI: {doi}\n  License: {license_id}")

        # Save metadata JSON
        meta_filename = f"{accession}_metadata.json"
        meta_path = os.path.join(RAW_DIR, meta_filename)
        with open(meta_path, 'w', encoding='utf-8') as f:
            json.dump(meta, f, indent=2)
        
        manifest_records.append({
            "investigation_id": accession,
            "file_name": meta_filename,
            "doi": doi,
            "original_url": meta_url,
            "access_date": datetime.now(timezone.utc).isoformat(),
            "file_size_bytes": os.path.getsize(meta_path),
            "sha256": compute_sha256(meta_path),
            "license": license_id,
            "saved_path": os.path.relpath(meta_path, BASE_DIR).replace('\\', '/')
        })

        # 1. Download Experimental Tables
        exp_tables = meta.get('experimentalTable', [])
        for t in exp_tables:
            fn = t.get('file_name')
            ver = t.get('version', 1)
            if fn:
                download_file(accession, fn, doi, license_id, RAW_DIR, version=ver)

        # 2. Download Readme, Dictionary, Telemetry, and Matrix files from 'added'
        added = meta.get('added', [])
        for f in added:
            fn = f.get('file_name', '')
            sz = f.get('file_size', 0)
            ver = f.get('version', 1)
            fn_lower = fn.lower()

            is_readme = any(k in fn_lower for k in ['readme', 'read_me', 'dict'])
            is_matrix = any(k in fn_lower for k in ['test.matrices', 'test_matrix', 'planned_test matrix', 'as_run_test matrix', 'as run_test matrix'])
            is_telemetry = any(k in fn_lower for k in ['telemetry', 'calibration'])
            is_srd = any(k in fn_lower for k in ['srd', 'science requirements'])

            # Include target documentation/telemetry, avoid raw frame dumps or multi-gigabyte archives
            if (is_readme or is_matrix or is_telemetry or is_srd) and sz < 10 * 1024 * 1024:
                if not fn_lower.endswith(('.zip', '.tiff', '.raw', 'proofsheet.pdf', '.png', '.jpg')):
                    download_file(accession, fn, doi, license_id, RAW_DIR, version=ver)

    # Write manifest.json
    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump({
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_files": len(manifest_records),
            "files": manifest_records
        }, f, indent=2)

    print("\n=======================================================")
    print("INGESTION COMPLETE.")
    print(f"Total manifest entries: {len(manifest_records)}")
    print(f"Errors logged: {len(errors)}")
    print(f"Manifest written to: {MANIFEST_PATH}")

if __name__ == '__main__':
    run_ingestion()
