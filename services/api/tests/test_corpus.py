"""Tests for Section C: Cited Corpus extraction and verbatim chunk fidelity."""

from __future__ import annotations

import json
from pathlib import Path
import pytest

ROOT = Path(__file__).resolve().parents[3]
CHUNKS_PATH = ROOT / "data" / "corpus" / "chunks.jsonl"
PAGES_PATH = ROOT / "data" / "corpus" / "pages.json"


@pytest.fixture(scope="module")
def corpus_data():
    assert CHUNKS_PATH.exists(), f"Corpus chunks not found at {CHUNKS_PATH}"
    assert PAGES_PATH.exists(), f"Corpus pages not found at {PAGES_PATH}"

    with open(PAGES_PATH, "r", encoding="utf-8") as f:
        pages = json.load(f)

    chunks = []
    with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                chunks.append(json.loads(line))

    return {"pages": pages, "chunks": chunks}


def test_corpus_non_empty(corpus_data):
    """Asserts that corpus chunks and pages were generated and non-empty."""
    chunks = corpus_data["chunks"]
    pages = corpus_data["pages"]

    assert len(chunks) > 0, "No chunks found in chunks.jsonl"
    assert len(pages) >= 14, f"Expected at least 14 documents in pages.json, got {len(pages)}"
    assert len(chunks) >= 800, f"Expected at least 800 chunks, got {len(chunks)}"


def test_chunk_fields_completeness(corpus_data):
    """Asserts every chunk has doc_id, page, source_url, sha256, text, chunk_id, title, year."""
    chunks = corpus_data["chunks"]

    for idx, c in enumerate(chunks):
        assert "chunk_id" in c and c["chunk_id"], f"Chunk #{idx} missing chunk_id"
        assert "doc_id" in c and c["doc_id"], f"Chunk #{idx} missing doc_id"
        assert "page" in c and isinstance(c["page"], int) and c["page"] >= 1, f"Chunk #{idx} invalid page"
        assert "source_url" in c and c["source_url"].startswith("http"), f"Chunk #{idx} invalid source_url: {c.get('source_url')}"
        assert "sha256" in c and len(c["sha256"]) == 64, f"Chunk #{idx} invalid sha256"
        assert "text" in c and len(c["text"].strip()) > 0, f"Chunk #{idx} has empty text"
        assert "title" in c and c["title"], f"Chunk #{idx} missing title"
        assert "year" in c and c["year"], f"Chunk #{idx} missing year"


def test_chunk_text_is_verbatim_substring_of_page(corpus_data):
    """Asserts that EVERY chunk's text is a strict verbatim substring of its source page."""
    chunks = corpus_data["chunks"]
    pages = corpus_data["pages"]

    failures = []
    for c in chunks:
        doc_id = c["doc_id"]
        page_num_str = str(c["page"])
        chunk_text = c["text"]

        assert doc_id in pages, f"Doc {doc_id} not found in pages store"
        assert page_num_str in pages[doc_id], f"Page {page_num_str} of doc {doc_id} not found in pages store"

        full_page_text = pages[doc_id][page_num_str]

        # Assert verbatim substring
        if chunk_text not in full_page_text:
            failures.append((c["chunk_id"], doc_id, c["page"]))

    assert not failures, f"Found {len(failures)} chunks whose text is not a verbatim substring of their page! First 5: {failures[:5]}"
