"""Extracts text from NASA science documents & NTRS reports and generates chunked corpus.

Pipeline:
1. Extracts text with 1-indexed page numbers from PDFs (via pypdfium2 / pdfplumber) and DOCX (python-docx).
2. Chunks by page with ~220-word windows and 40-word overlap.
3. Guarantees that chunk text is a 100% VERBATIM substring of the extracted page text.
4. Outputs data/corpus/chunks.jsonl and data/corpus/pages.json (for verbatim verification).
"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any

import docx
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data" / "raw"
REPORTS_DIR = RAW_DIR / "reports"
CORPUS_DIR = ROOT / "data" / "corpus"
MANIFEST_PATH = ROOT / "data" / "provenance" / "manifest.json"
CHUNKS_PATH = CORPUS_DIR / "chunks.jsonl"
PAGES_PATH = CORPUS_DIR / "pages.json"

CHUNK_WORD_TARGET = 220
CHUNK_WORD_OVERLAP = 40


def compute_sha256(path: Path) -> str:
    """Computes SHA-256 hash of a file."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def extract_pdf_pages(pdf_path: Path) -> list[dict[str, Any]]:
    """Extracts text page by page from PDF using pypdfium2."""
    pages = []
    pdf = pdfium.PdfDocument(pdf_path)
    for idx, page in enumerate(pdf, start=1):
        textpage = page.get_textpage()
        text = textpage.get_text_range() or ""
        pages.append({"page_number": idx, "text": text})
    return pages


def extract_docx_pages(docx_path: Path) -> list[dict[str, Any]]:
    """Extracts paragraphs from docx into logical pages of ~400 words."""
    doc = docx.Document(docx_path)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    full_text = "\n\n".join(paragraphs)

    matches = list(re.finditer(r"\S+", full_text))
    if not matches:
        return [{"page_number": 1, "text": ""}]

    pages = []
    page_words = 400
    for p_idx, start in enumerate(range(0, len(matches), page_words), start=1):
        end = min(len(matches), start + page_words)
        char_start = matches[start].start()
        char_end = matches[end - 1].end()
        page_str = full_text[char_start:char_end]
        pages.append({"page_number": p_idx, "text": page_str})

    return pages


def chunk_page_text(page_text: str, target_words: int = CHUNK_WORD_TARGET, overlap: int = CHUNK_WORD_OVERLAP) -> list[str]:
    """Generates verbatim sub-strings of page_text using word spans.
    
    Guarantees mathematically that chunk in page_text is True.
    """
    matches = list(re.finditer(r"\S+", page_text))
    if not matches:
        return []

    if len(matches) <= target_words:
        char_start = matches[0].start()
        char_end = matches[-1].end()
        return [page_text[char_start:char_end]]

    chunks = []
    step = max(1, target_words - overlap)
    for start in range(0, len(matches), step):
        end = min(len(matches), start + target_words)
        char_start = matches[start].start()
        char_end = matches[end - 1].end()
        chunk_slice = page_text[char_start:char_end]
        if chunk_slice:
            chunks.append(chunk_slice)
        if end >= len(matches):
            break

    return chunks


def build_corpus() -> dict[str, Any]:
    """Builds the cited answers corpus from local science documents and NTRS reports."""
    CORPUS_DIR.mkdir(parents=True, exist_ok=True)

    # Define documents list
    doc_specs = [
        # Science docs
        {
            "doc_id": "PSI-100-README",
            "file": RAW_DIR / "PSI-100_Science Documents_SAFFIRE-I and SAFFIRE-III Readme.docx",
            "title": "SAFFIRE-I and SAFFIRE-III Experiment Readme",
            "year": 2017,
            "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-100",
        },
        {
            "doc_id": "PSI-10-ACME-ISRD",
            "file": RAW_DIR / "PSI-10_Science Documents_ACME_ISRD.pdf",
            "title": "ACME Integrated Science Requirements Definition (ISRD)",
            "year": 2015,
            "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-10",
        },
        {
            "doc_id": "PSI-10-SRD-FLAME-DESIGN",
            "file": RAW_DIR / "PSI-10_Science Documents_SRD_ACMEFlameDesign.pdf",
            "title": "ACME Flame Design Science Requirements Document",
            "year": 2014,
            "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-10",
        },
        {
            "doc_id": "PSI-23-ACME-SRD-REVIEW",
            "file": RAW_DIR / "PSI-23_Science Documents_ACME Integrated Science Requirements Definition Review 20100505.pdf",
            "title": "ACME Integrated Science Requirements Definition Review",
            "year": 2010,
            "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-23",
        },
        {
            "doc_id": "PSI-25-BASS2-README",
            "file": RAW_DIR / "PSI-25_Science Documents_BASS-II_ReadMe.docx",
            "title": "BASS-II Experiment ReadMe and Test Matrix Guide",
            "year": 2017,
            "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-25",
        },
        {
            "doc_id": "PSI-25-BASS2-SRD",
            "file": RAW_DIR / "PSI-25_Science Documents_BASS-II_SRD.pdf",
            "title": "BASS-II Science Requirements Document (SRD)",
            "year": 2010,
            "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-25",
        },
        {
            "doc_id": "PSI-26-BASS1-SRD",
            "file": RAW_DIR / "PSI-26_Science Documents_SRD_BASS.pdf",
            "title": "BASS Science Requirements Document (SRD)",
            "year": 2009,
            "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-26",
        },
        # Downloaded NTRS reports
        {
            "doc_id": "NTRS-20240002981",
            "file": REPORTS_DIR / "20240002981.pdf",
            "title": "Preliminary Results from the Saffire VI Experiment",
            "year": 2024,
            "url": "https://ntrs.nasa.gov/api/citations/20240002981/downloads/20240002981.pdf",
        },
        {
            "doc_id": "NTRS-20240007488",
            "file": REPORTS_DIR / "20240007488.pdf",
            "title": "Preliminary Results from the Saffire VI Experiment (Presentation)",
            "year": 2024,
            "url": "https://ntrs.nasa.gov/api/citations/20240007488/downloads/20240007488.pdf",
        },
        {
            "doc_id": "NTRS-20210011385",
            "file": REPORTS_DIR / "20210011385.pdf",
            "title": "Burning and Suppression of Solids-II (BASS-II) Summary Report",
            "year": 2021,
            "url": "https://ntrs.nasa.gov/api/citations/20210011385/downloads/20210011385.pdf",
        },
        {
            "doc_id": "NTRS-20160000593",
            "file": REPORTS_DIR / "20160000593.pdf",
            "title": "Combustion of Solids in Microgravity: Results from the BASS-II Experiment",
            "year": 2016,
            "url": "https://ntrs.nasa.gov/api/citations/20160000593/downloads/20160000593.pdf",
        },
        {
            "doc_id": "NTRS-20120016855",
            "file": REPORTS_DIR / "20120016855.pdf",
            "title": "Methanol Droplet Extinction in Oxygen/CO2/N2 Mixtures in Microgravity (FLEX)",
            "year": 2012,
            "url": "https://ntrs.nasa.gov/api/citations/20120016855/downloads/20120016855.pdf",
        },
        {
            "doc_id": "NTRS-20240013238",
            "file": REPORTS_DIR / "20240013238.pdf",
            "title": "NASA Exploration Atmosphere Tests 3 & 4 (Planetary EVA Prebreathe Protocols)",
            "year": 2024,
            "url": "https://ntrs.nasa.gov/api/citations/20240013238/downloads/20240013238.pdf",
        },
        {
            "doc_id": "NTRS-20130014061",
            "file": REPORTS_DIR / "20130014061.pdf",
            "title": "Methanol Droplet Combustion in Oxygen-Inert Environments in Microgravity",
            "year": 2013,
            "url": "https://ntrs.nasa.gov/api/citations/20130014061/downloads/20130014061.pdf",
        },
    ]

    all_chunks = []
    pages_store = {}
    total_pages = 0

    print("=" * 80)
    print("EXTRACTING PAGES & BUILDING CORPUS CHUNKS")
    print("=" * 80)

    for spec in doc_specs:
        fp = Path(spec["file"])
        if not fp.exists():
            print(f"Skipping missing file: {fp}")
            continue

        sha = compute_sha256(fp)
        doc_id = spec["doc_id"]
        title = spec["title"]
        year = spec["year"]
        url = spec["url"]

        print(f"Processing {doc_id} ({fp.name})...")
        if fp.suffix.lower() == ".pdf":
            pages = extract_pdf_pages(fp)
        elif fp.suffix.lower() == ".docx":
            pages = extract_docx_pages(fp)
        else:
            continue

        doc_pages_count = len(pages)
        total_pages += doc_pages_count

        # Store full page text for testing verification
        pages_store[doc_id] = {str(p["page_number"]): p["text"] for p in pages}

        doc_chunks_count = 0
        for p in pages:
            p_num = p["page_number"]
            p_text = p["text"]
            if not p_text.strip():
                continue

            chunks = chunk_page_text(p_text)
            for c_idx, chunk_str in enumerate(chunks, start=1):
                chunk_id = f"{doc_id}-p{p_num:03d}-c{c_idx:03d}"
                record = {
                    "chunk_id": chunk_id,
                    "doc_id": doc_id,
                    "title": title,
                    "year": str(year),
                    "page": p_num,
                    "text": chunk_str,
                    "source_url": url,
                    "sha256": sha,
                }
                all_chunks.append(record)
                doc_chunks_count += 1

        print(f"   -> {doc_pages_count} pages, {doc_chunks_count} chunks")

    # Save chunks.jsonl
    with open(CHUNKS_PATH, "w", encoding="utf-8") as f:
        for ch in all_chunks:
            f.write(json.dumps(ch, ensure_ascii=False) + "\n")

    # Save pages.json for tests to verify verbatim substring
    with open(PAGES_PATH, "w", encoding="utf-8") as f:
        json.dump(pages_store, f, ensure_ascii=False)

    print("\n" + "=" * 80)
    print("CORPUS BUILD COMPLETE")
    print(f"Total Documents Processed : {len(doc_specs)}")
    print(f"Total Pages Extracted    : {total_pages}")
    print(f"Total Chunks Generated   : {len(all_chunks)}")
    print(f"Saved Chunks to          : {CHUNKS_PATH}")
    print("=" * 80)

    return {
        "total_documents": len(doc_specs),
        "total_pages": total_pages,
        "total_chunks": len(all_chunks),
        "chunks_path": str(CHUNKS_PATH),
    }


if __name__ == "__main__":
    build_corpus()
