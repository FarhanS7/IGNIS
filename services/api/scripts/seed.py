"""Seed script to load fixture JSON files into Supabase (Task A.10).

Reference: PRD v1.1 §18 | DECISIONS.md D-004, D-008.

Supports:
1. --dry-run: validates fixtures, counts records, and checks FK constraints without making network calls.
2. Direct insertion/upsert via Supabase REST API (PostgREST) using httpx.
"""

import argparse
import json
import logging
import os
import sys
from pathlib import Path
from typing import Any

import httpx

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("ignis.seed")

# Foreign key dependency order:
INSERT_ORDER = [
    "data_sources",
    "experiments",
    "experiment_runs",
    "habitat_presets",
    "source_documents",
    "source_chunks",
    "media_assets",
    "cv_measurements",
    "stories",
]

DEFAULT_FIXTURES_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data" / "fixtures"


def load_fixtures(fixtures_dir: Path) -> dict[str, list[dict[str, Any]]]:
    """Loads all JSON fixture files from directory."""
    fixtures: dict[str, list[dict[str, Any]]] = {}
    for table_name in INSERT_ORDER:
        file_path = fixtures_dir / f"{table_name}.json"
        if not file_path.exists():
            raise FileNotFoundError(f"Fixture file missing for table '{table_name}': {file_path}")
        with open(file_path, "r", encoding="utf-8") as f:
            fixtures[table_name] = json.load(f)
    return fixtures


def validate_foreign_keys(fixtures: dict[str, list[dict[str, Any]]]) -> bool:
    """Validates relational integrity across all loaded fixtures."""
    logger.info("Validating foreign key relationships...")
    errors: list[str] = []

    data_source_ids = {r["id"] for r in fixtures.get("data_sources", [])}
    experiment_ids = {r["id"] for r in fixtures.get("experiments", [])}
    document_ids = {r["id"] for r in fixtures.get("source_documents", [])}
    media_ids = {r["id"] for r in fixtures.get("media_assets", [])}

    # 1. experiment_runs -> experiment_id
    for run in fixtures.get("experiment_runs", []):
        if run.get("experiment_id") not in experiment_ids:
            errors.append(f"experiment_run {run.get('id')} references non-existent experiment {run.get('experiment_id')}")

    # 2. source_documents -> source_id (optional), experiment_id (optional)
    for doc in fixtures.get("source_documents", []):
        if doc.get("source_id") and doc["source_id"] not in data_source_ids:
            errors.append(f"source_document {doc.get('id')} references non-existent data_source {doc.get('source_id')}")
        if doc.get("experiment_id") and doc["experiment_id"] not in experiment_ids:
            errors.append(f"source_document {doc.get('id')} references non-existent experiment {doc.get('experiment_id')}")

    # 3. source_chunks -> document_id, experiment_id (optional)
    for chunk in fixtures.get("source_chunks", []):
        if chunk.get("document_id") not in document_ids:
            errors.append(f"source_chunk {chunk.get('id')} references non-existent source_document {chunk.get('document_id')}")
        if chunk.get("experiment_id") and chunk["experiment_id"] not in experiment_ids:
            errors.append(f"source_chunk {chunk.get('id')} references non-existent experiment {chunk.get('experiment_id')}")

    # 4. media_assets -> experiment_id (optional)
    for media in fixtures.get("media_assets", []):
        if media.get("experiment_id") and media["experiment_id"] not in experiment_ids:
            errors.append(f"media_asset {media.get('id')} references non-existent experiment {media.get('experiment_id')}")

    # 5. cv_measurements -> media_asset_id
    for cv in fixtures.get("cv_measurements", []):
        if cv.get("media_asset_id") not in media_ids:
            errors.append(f"cv_measurement {cv.get('id')} references non-existent media_asset {cv.get('media_asset_id')}")

    if errors:
        for err in errors:
            logger.error("FK Integrity Error: %s", err)
        return False

    logger.info("FK Integrity Check: PASSED with 0 errors.")
    return True


def upsert_table_records(
    table_name: str,
    records: list[dict[str, Any]],
    supabase_url: str,
    supabase_key: str,
    client: httpx.Client | None = None,
) -> int:
    """Upserts records into a Supabase table via PostgREST endpoint."""
    url = f"{supabase_url.rstrip('/')}/rest/v1/{table_name}"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation",
    }

    local_client = client or httpx.Client(timeout=30.0)
    try:
        # Batch in chunks of 50 to avoid request size limits
        batch_size = 50
        inserted_count = 0
        for i in range(0, len(records), batch_size):
            batch = records[i : i + batch_size]
            response = local_client.post(url, headers=headers, json=batch)
            if response.status_code not in (200, 201):
                logger.error(
                    "Failed to upsert into %s (batch %d-%d): %s - %s",
                    table_name,
                    i,
                    i + len(batch),
                    response.status_code,
                    response.text,
                )
                response.raise_for_status()
            inserted_count += len(batch)
        return inserted_count
    finally:
        if client is None:
            local_client.close()


def run_seed(
    dry_run: bool = False,
    fixtures_dir: Path | None = None,
    supabase_url: str | None = None,
    supabase_key: str | None = None,
    http_client: httpx.Client | None = None,
) -> dict[str, int]:
    """Main seeding pipeline."""
    target_dir = fixtures_dir or DEFAULT_FIXTURES_DIR
    logger.info("Loading fixtures from %s", target_dir)

    fixtures = load_fixtures(target_dir)

    # Validate FK constraints
    if not validate_foreign_keys(fixtures):
        raise ValueError("Fixture foreign key validation failed.")

    summary: dict[str, int] = {}
    for table_name in INSERT_ORDER:
        records = fixtures[table_name]
        summary[table_name] = len(records)
        logger.info("Table '%s': %d records ready.", table_name, len(records))

    if dry_run:
        logger.info("DRY-RUN completed successfully. No records were sent to Supabase.")
        return summary

    # Verify credentials
    sb_url = supabase_url or os.getenv("SUPABASE_URL")
    sb_key = supabase_key or os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

    if not sb_url or not sb_key:
        raise ValueError(
            "Supabase credentials missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY "
            "or use --dry-run."
        )

    logger.info("Connecting to Supabase at %s", sb_url)
    results: dict[str, int] = {}
    for table_name in INSERT_ORDER:
        records = fixtures[table_name]
        logger.info("Upserting %d records into '%s'...", len(records), table_name)
        count = upsert_table_records(table_name, records, sb_url, sb_key, client=http_client)
        results[table_name] = count
        logger.info("Successfully upserted %d records into '%s'.", count, table_name)

    logger.info("All tables seeded successfully.")
    return results


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed IGNIS database with mock fixtures.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate fixtures and foreign keys without connecting to Supabase.",
    )
    parser.add_argument(
        "--fixtures-dir",
        type=Path,
        default=DEFAULT_FIXTURES_DIR,
        help="Path to directory containing JSON fixture files.",
    )
    args = parser.parse_args()

    try:
        run_seed(dry_run=args.dry_run, fixtures_dir=args.fixtures_dir)
        sys.exit(0)
    except Exception as exc:
        logger.critical("Seed failed: %s", exc, exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
