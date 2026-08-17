#!/usr/bin/env python3
"""Extract plain text from a PDF, page by page (no images).

Usage:
  python3 scripts/extract_pdf_text.py <pdf_path> <out_md_path>
"""
import sys
import fitz  # PyMuPDF


def extract(pdf_path: str, out_md_path: str) -> None:
    doc = fitz.open(pdf_path)
    lines = []
    for i in range(len(doc)):
        page = doc[i]
        lines.append(f"## Página {i + 1}\n")
        text = page.get_text("text").strip()
        lines.append(text if text else "_(página sem texto)_")
        lines.append("")

    with open(out_md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Pages processed: {len(doc)}")
    print(f"Text written to: {out_md_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 scripts/extract_pdf_text.py <pdf_path> <out_md_path>")
        sys.exit(1)
    extract(sys.argv[1], sys.argv[2])
