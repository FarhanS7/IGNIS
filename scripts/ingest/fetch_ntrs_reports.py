"""NTRS API Client & Report Harvester.

Searches the NASA Technical Reports Server (NTRS) Public API for:
1. SAFFIRE-I/II/III flight results
2. BASS and BASS-II
3. Exploration atmosphere flammability
4. FLEX and FLEX-2

Downloads public PDFs, computes SHA-256 hashes, and records them in manifest.json.
"""

from __future__ import annotations

import hashlib
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
REPORTS_DIR = ROOT / "data" / "raw" / "reports"
MANIFEST_PATH = ROOT / "data" / "provenance" / "manifest.json"

TOPIC_QUERIES = {
    "SAFFIRE": "Saffire spacecraft fire experiment flight results",
    "BASS": "Burning and Suppression of Solids BASS-II microgravity",
    "EXPLORATION_ATM": "exploration atmosphere flammability oxygen microgravity",
    "FLEX": "Flame Extinction Experiment FLEX droplet combustion",
}


def search_ntrs(query: str, limit: int = 5) -> list[dict[str, Any]]:
    """Queries NTRS search endpoint and returns parsed publication metadata."""
    encoded_q = urllib.parse.quote(query)
    url = f"https://ntrs.nasa.gov/api/citations/search?q={encoded_q}"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) IGNIS/2.0"},
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        results = data.get("results", [])
        return results[:limit]


def download_pdf(ntrs_id: str, pdf_rel_url: str, output_path: Path) -> tuple[str, int]:
    """Downloads a public PDF from NTRS and returns (sha256, size_bytes)."""
    full_url = f"https://ntrs.nasa.gov{pdf_rel_url}"
    req = urllib.request.Request(
        full_url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) IGNIS/2.0"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        content = resp.read()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(content)

    sha256 = hashlib.sha256(content).hexdigest()
    return sha256, len(content)


def harvest_reports() -> list[dict[str, Any]]:
    """Harvests candidate reports across the 4 key topics."""
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    candidates = []
    seen_ids = set()

    print("=" * 80)
    print("SEARCHING NASA TECHNICAL REPORTS SERVER (NTRS) API")
    print("=" * 80)

    for topic_key, query in TOPIC_QUERIES.items():
        print(f"\n[Topic: {topic_key}] Query: '{query}'")
        try:
            results = search_ntrs(query, limit=5)
        except Exception as e:
            print(f"Error querying NTRS for {topic_key}: {e}")
            continue

        for r in results:
            nid = str(r.get("id"))
            if nid in seen_ids:
                continue
            seen_ids.add(nid)

            title = r.get("title", "Unknown Title")
            dist = r.get("distribution", "UNKNOWN")
            year = (r.get("distributionDate") or r.get("created") or r.get("submittedDate") or nid)[:4]

            # Check downloads for PDF
            dls = r.get("downloads", [])
            pdf_rel_url = None
            for d in dls:
                link = d.get("links", {}).get("pdf")
                if link and link.endswith(".pdf"):
                    pdf_rel_url = link
                    break

            has_pdf = pdf_rel_url is not None
            can_download = has_pdf and (dist == "PUBLIC" or dist == "UNCLASSIFIED")

            candidate = {
                "topic": topic_key,
                "ntrs_id": nid,
                "title": title,
                "year": year,
                "distribution": dist,
                "has_pdf": has_pdf,
                "pdf_rel_url": pdf_rel_url,
                "downloaded": False,
                "file_path": None,
                "sha256": None,
                "size_bytes": None,
            }

            print(f" -> Found ID: {nid:<12} | Year: {year} | Dist: {dist:<8} | PDF: {has_pdf}")
            print(f"    Title: {title}")

            candidates.append(candidate)

    # Now download public PDFs for selected high-relevance reports (top 1-2 per topic)
    selected_to_download = []
    for topic_key in TOPIC_QUERIES.keys():
        topic_cands = [c for c in candidates if c["topic"] == topic_key and c["has_pdf"] and c["distribution"] == "PUBLIC"]
        if topic_cands:
            # pick top 2
            selected_to_download.extend(topic_cands[:2])

    print("\n" + "=" * 80)
    print(f"DOWNLOADING {len(selected_to_download)} PUBLIC NASA TECHNICAL REPORTS")
    print("=" * 80)

    for cand in selected_to_download:
        nid = cand["ntrs_id"]
        rel_url = cand["pdf_rel_url"]
        dest = REPORTS_DIR / f"{nid}.pdf"
        print(f"Downloading/Verifying {nid} ({cand['title'][:50]}...)...")
        if dest.exists() and dest.stat().st_size > 0:
            with open(dest, "rb") as f:
                content = f.read()
            sha = hashlib.sha256(content).hexdigest()
            cand["downloaded"] = True
            cand["file_path"] = f"data/raw/reports/{nid}.pdf"
            cand["sha256"] = sha
            cand["size_bytes"] = len(content)
            print(f"   Cached: {len(content)} bytes | SHA-256: {sha[:16]}...")
            continue

        try:
            sha, size = download_pdf(nid, rel_url, dest)
            cand["downloaded"] = True
            cand["file_path"] = f"data/raw/reports/{nid}.pdf"
            cand["sha256"] = sha
            cand["size_bytes"] = size
            print(f"   Success: {size} bytes | SHA-256: {sha[:16]}...")
        except Exception as e:
            print(f"   Download failed for {nid}: {e}")


    # Update manifest.json
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            manifest = json.load(f)
    else:
        manifest = {"manifest_version": "2.0", "files": []}

    manifest_files = manifest.setdefault("files", [])
    existing_paths = {f.get("saved_path") or f.get("path"): f for f in manifest_files}

    for cand in candidates:
        if cand["downloaded"]:
            entry = {
                "investigation_id": f"NTRS-{cand['ntrs_id']}",
                "file_name": f"{cand['ntrs_id']}.pdf",
                "saved_path": cand["file_path"],
                "original_url": f"https://ntrs.nasa.gov{cand['pdf_rel_url']}",
                "sha256": cand["sha256"],
                "file_size_bytes": cand["size_bytes"],
                "license": "NASA-Public-Domain",
                "distribution": cand["distribution"],
                "ntrs_id": cand["ntrs_id"],
                "title": cand["title"],
                "year": cand["year"],
            }
            if cand["file_path"] in existing_paths:
                existing_paths[cand["file_path"]].update(entry)
            else:
                manifest_files.append(entry)

    manifest["total_files"] = len(manifest_files)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nUpdated {MANIFEST_PATH} with downloaded technical reports.")

    return candidates


if __name__ == "__main__":
    cands = harvest_reports()
