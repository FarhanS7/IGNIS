"""Unit and integrity tests for ML data provenance manifest.

Validates schema, licenses, DOI references, and hash consistency of ml_manifest.json.
Gracefully skips raw file content checks when run in CI environments where raw ML data is gitignored.
"""

import os
import json
import re
import hashlib
import pytest

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..'))
MANIFEST_PATH = os.path.join(BASE_DIR, 'data', 'provenance', 'ml_manifest.json')


@pytest.fixture(scope="module")
def manifest():
    assert os.path.exists(MANIFEST_PATH), f"Manifest file missing: {MANIFEST_PATH}"
    with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    assert isinstance(data, list), "Manifest must be a top-level JSON list"
    assert len(data) >= 6, f"Expected at least 6 dataset entries (D1-D6), found {len(data)}"
    return data


def test_manifest_entries_valid_schema(manifest):
    """Verify each dataset entry has all mandatory metadata fields and valid licenses."""
    required_keys = {'id', 'name', 'source_url', 'doi', 'license', 'license_url', 'files', 'notes'}
    valid_licenses = {'CC0-1.0', 'CC BY 4.0'}

    ids = set()
    for entry in manifest:
        missing = required_keys - set(entry.keys())
        assert not missing, f"Dataset {entry.get('id')} missing keys: {missing}"
        assert entry['id'] not in ids, f"Duplicate dataset ID: {entry['id']}"
        ids.add(entry['id'])

        # Verify license is open-access and proven
        assert entry['license'] in valid_licenses, (
            f"Dataset {entry['id']} has unapproved or unverified license: {entry['license']}"
        )
        assert entry['license_url'].startswith('http'), f"Invalid license URL for {entry['id']}"
        assert entry['doi'].strip(), f"Dataset {entry['id']} must have a valid DOI"


def test_manifest_file_hashes_format(manifest):
    """Verify file records conform to schema with 64-char hex SHA-256."""
    sha256_pattern = re.compile(r'^[a-f0-9]{64}$')

    for entry in manifest:
        for f in entry.get('files', []):
            assert 'name' in f, f"File in {entry['id']} missing 'name'"
            assert 'bytes' in f and isinstance(f['bytes'], int) and f['bytes'] > 0, (
                f"File {f.get('name')} in {entry['id']} invalid bytes"
            )
            assert 'sha256' in f, f"File {f.get('name')} in {entry['id']} missing sha256"
            assert sha256_pattern.match(f['sha256']), (
                f"File {f['name']} sha256 is not a valid 64-char hex string: {f['sha256']}"
            )


def test_manifest_local_file_hashes_match(manifest):
    """When files are present on disk, ensure their sha256 matches the manifest exactly."""
    files_checked = 0

    for entry in manifest:
        for f in entry.get('files', []):
            rel_path = f.get('relative_path')
            if not rel_path:
                continue

            full_path = os.path.join(BASE_DIR, rel_path.replace('/', os.sep))
            if os.path.exists(full_path):
                h = hashlib.sha256()
                with open(full_path, 'rb') as fp:
                    while chunk := fp.read(65536):
                        h.update(chunk)
                computed_hash = h.hexdigest()
                assert computed_hash == f['sha256'], (
                    f"Hash mismatch for {rel_path}! Expected {f['sha256']}, got {computed_hash}"
                )
                assert os.path.getsize(full_path) == f['bytes'], (
                    f"Byte count mismatch for {rel_path}! Expected {f['bytes']}, got {os.path.getsize(full_path)}"
                )
                files_checked += 1

    if files_checked == 0:
        pytest.skip("No raw dataset files present on disk (expected in CI environments where data/raw_ml is gitignored).")
    else:
        print(f"\nVerified integrity of {files_checked} local dataset files against manifest.")

