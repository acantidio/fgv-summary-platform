#!/usr/bin/env python3
"""Extract text and tables from a .docx file to Markdown.

Paragraphs styled as headings become "### " lines; tables become
pipe-delimited rows. Merged table cells are emitted once (deduplicated
by the underlying cell element, not by text, so adjacent cells with
equal values are kept).

Usage:
  python3 scripts/extract_docx.py <docx_path> <out_md_path>
"""
import sys
import docx  # python-docx
from docx.table import Table
from docx.text.paragraph import Paragraph


def extract(docx_path: str, out_md_path: str) -> None:
    d = docx.Document(docx_path)
    out = []
    for el in d.element.body.iterchildren():
        tag = el.tag.split('}')[1]
        if tag == 'p':
            p = Paragraph(el, d)
            t = p.text.strip()
            if t:
                style = p.style.name.lower()
                out.append(("### " if "heading" in style or "título" in style else "") + t)
        elif tag == 'tbl':
            for row in Table(el, d).rows:
                cells, seen = [], []
                for c in row.cells:
                    if any(c._tc is s for s in seen):
                        continue
                    seen.append(c._tc)
                    cells.append(" ".join(c.text.split()))
                out.append("| " + " | ".join(cells) + " |")
            out.append("")

    with open(out_md_path, "w", encoding="utf-8") as f:
        f.write("\n\n".join(out) + "\n")
    print(f"Text written to: {out_md_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 scripts/extract_docx.py <docx_path> <out_md_path>")
        sys.exit(1)
    extract(sys.argv[1], sys.argv[2])
