"""Verification script for data/provenance/manifest.json and data/raw/."""

import os
import json
import hashlib
from collections import defaultdict

BASE_DIR = r'e:\IGNIS'
RAW_DIR = os.path.join(BASE_DIR, 'data', 'raw')
MANIFEST_PATH = os.path.join(BASE_DIR, 'data', 'provenance', 'manifest.json')
ERROR_LOG = os.path.join(RAW_DIR, '_errors.log')

def compute_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def verify():
    with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    manifest_files = {entry['file_name']: entry for entry in manifest['files']}
    print(f"Total entries in manifest: {len(manifest_files)}")

    raw_files = [f for f in os.listdir(RAW_DIR) if f != '_errors.log']
    print(f"Total physical files in data/raw/: {len(raw_files)}")

    per_inv_count = defaultdict(int)
    mismatches = []
    missing_in_manifest = []

    for fn in raw_files:
        fp = os.path.join(RAW_DIR, fn)
        sz = os.path.getsize(fp)
        sha = compute_sha256(fp)

        if fn not in manifest_files:
            missing_in_manifest.append(fn)
            continue

        entry = manifest_files[fn]
        per_inv_count[entry['investigation_id']] += 1

        if entry['file_size_bytes'] != sz:
            mismatches.append(f"Size mismatch for {fn}: manifest={entry['file_size_bytes']}, actual={sz}")
        if entry['sha256'] != sha:
            mismatches.append(f"SHA-256 mismatch for {fn}: manifest={entry['sha256']}, actual={sha}")

    print("\nFiles downloaded per investigation:")
    for inv in sorted(per_inv_count.keys()):
        print(f"  {inv}: {per_inv_count[inv]} files")

    print(f"\nMismatches: {len(mismatches)}")
    for m in mismatches:
        print(" ", m)

    print(f"Missing in manifest: {len(missing_in_manifest)}")
    for m in missing_in_manifest:
        print(" ", m)

    print("\nContents of _errors.log:")
    if os.path.exists(ERROR_LOG):
        with open(ERROR_LOG, 'r', encoding='utf-8') as f:
            print(f.read().strip())
    else:
        print("No errors logged.")

if __name__ == '__main__':
    verify()
