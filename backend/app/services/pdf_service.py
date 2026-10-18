import re
from pathlib import Path
from typing import Optional
import fitz  # PyMuPDF
from pypdf import PdfReader

class PDFExtractionResult:
    def __init__(self, page_count: int, pages_text: list[dict], sections: list[dict], metadata: dict):
        self.page_count = page_count
        self.pages_text = pages_text  # [{"page": 1, "text": "...", "char_count": 120}]
        self.sections = sections      # [{"title": "...", "content": "...", "page_start": 1, "page_end": 2}]
        self.metadata = metadata

class PDFService:
    @staticmethod
    def validate_pdf_bytes(content: bytes, max_size_mb: int = 50) -> tuple[bool, Optional[str]]:
        """Validate PDF file magic number and file size."""
        if not content:
            return False, "File is empty."

        if len(content) > max_size_mb * 1024 * 1024:
            return False, f"File size exceeds maximum allowed size of {max_size_mb}MB."

        if not content.startswith(b"%PDF-"):
            return False, "Invalid file format: File does not start with standard PDF header."

        return True, None

    @staticmethod
    def extract_content(file_path: Path) -> PDFExtractionResult:
        """Extract text, page numbers, and structural sections from PDF."""
        pages_text: list[dict] = []
        sections: list[dict] = []
        metadata: dict = {}

        # 1. Primary: Use PyMuPDF (fitz)
        try:
            doc = fitz.open(file_path)
            metadata = doc.metadata or {}
            page_count = len(doc)

            toc = doc.get_toc()  # [[lvl, title, page], ...]

            full_text_list = []
            for page_idx in range(page_count):
                page = doc[page_idx]
                text = page.get_text("text").strip()
                char_count = len(text)
                pages_text.append({
                    "page": page_idx + 1,
                    "text": text,
                    "char_count": char_count
                })
                if text:
                    full_text_list.append((page_idx + 1, text))

            doc.close()

            # 2. Divide into logical sections
            sections = PDFService._build_sections(toc, pages_text)

            return PDFExtractionResult(
                page_count=page_count,
                pages_text=pages_text,
                sections=sections,
                metadata=metadata
            )
        except Exception as e:
            # Fallback to pypdf
            return PDFService._extract_with_pypdf(file_path, str(e))

    @staticmethod
    def _extract_with_pypdf(file_path: Path, previous_error: str) -> PDFExtractionResult:
        try:
            reader = PdfReader(str(file_path))
            page_count = len(reader.pages)
            pages_text = []

            for idx, page in enumerate(reader.pages):
                text = (page.extract_text() or "").strip()
                pages_text.append({
                    "page": idx + 1,
                    "text": text,
                    "char_count": len(text)
                })

            sections = PDFService._build_sections([], pages_text)
            metadata = {k.strip("/"): str(v) for k, v in (reader.metadata or {}).items()}

            return PDFExtractionResult(
                page_count=page_count,
                pages_text=pages_text,
                sections=sections,
                metadata=metadata
            )
        except Exception as fallback_err:
            raise ValueError(f"Failed to extract PDF content: {previous_error}; Fallback error: {fallback_err}")

    @staticmethod
    def _build_sections(toc: list, pages_text: list[dict]) -> list[dict]:
        """Build structured sections from TOC or heuristic page chunking."""
        sections: list[dict] = []

        # If valid TOC is detected
        if toc and len(toc) >= 2:
            for i, item in enumerate(toc):
                lvl, title, pstart = item[0], item[1].strip(), item[2]
                pend = toc[i + 1][2] - 1 if i + 1 < len(toc) else len(pages_text)
                pend = max(pstart, min(pend, len(pages_text)))

                sec_text = "\n\n".join([
                    p["text"] for p in pages_text if pstart <= p["page"] <= pend
                ])

                sections.append({
                    "title": title or f"Section {i+1}",
                    "content": sec_text[:4000],  # keep preview/digest
                    "page_start": pstart,
                    "page_end": pend,
                    "position": i
                })
            return sections

        # Heuristic: split by headings or chunk by 2-3 pages
        chunk_size = 2 if len(pages_text) <= 10 else 3
        current_chunk = []
        start_page = 1
        sec_idx = 0

        for page in pages_text:
            current_chunk.append(page)
            if len(current_chunk) >= chunk_size or page["page"] == len(pages_text):
                end_page = page["page"]
                combined_text = "\n\n".join([p["text"] for p in current_chunk])

                # Detect prominent title from first non-empty lines
                title = PDFService._extract_heading_candidate(combined_text) or f"Part {sec_idx + 1}: Pages {start_page}-{end_page}"

                sections.append({
                    "title": title,
                    "content": combined_text[:4000],
                    "page_start": start_page,
                    "page_end": end_page,
                    "position": sec_idx
                })

                sec_idx += 1
                current_chunk = []
                start_page = end_page + 1

        if not sections and pages_text:
            sections.append({
                "title": "Document Overview",
                "content": pages_text[0]["text"][:4000],
                "page_start": 1,
                "page_end": len(pages_text),
                "position": 0
            })

        return sections

    @staticmethod
    def _extract_heading_candidate(text: str) -> Optional[str]:
        """Detect title or heading from text lines."""
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        for line in lines[:5]:
            # Look for lines that look like chapters, titles, or headings
            if 3 < len(line) < 70 and not line.endswith((".", ",", ";")):
                clean = re.sub(r'^[0-9\.\-\s]+', '', line).strip()
                if len(clean) > 3:
                    return clean
        return None

pdf_service = PDFService()
