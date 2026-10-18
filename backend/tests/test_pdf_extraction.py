from pathlib import Path
import pytest
from app.services.pdf_service import pdf_service

def test_pdf_validation_empty():
    valid, err = pdf_service.validate_pdf_bytes(b"")
    assert not valid
    assert "empty" in err.lower()

def test_pdf_validation_invalid_header():
    valid, err = pdf_service.validate_pdf_bytes(b"HELLO NOT A PDF")
    assert not valid
    assert "header" in err.lower()

def test_pdf_validation_valid_header():
    valid, err = pdf_service.validate_pdf_bytes(b"%PDF-1.4 sample content here")
    assert valid
    assert err is None

def test_heading_extraction_heuristic():
    text = "Chapter 1: Neural Networks and Deep Learning\nThis is the introductory text about neural computation."
    candidate = pdf_service._extract_heading_candidate(text)
    assert candidate is not None
    assert "Neural Networks" in candidate
