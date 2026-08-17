#!/usr/bin/env python3
"""Extract text and images from a slide-deck PDF, page by page.

Writes:
  <out_dir>/images/page-XXX-img-YY.<ext>   — extracted raster images
  <out_dir>/extracted.md                   — page-by-page text with
                                              [Imagem: images/page-XXX-img-YY.<ext>]
                                              markers positioned where each
                                              image appears on the page

Usage:
  python3 scripts/extract_pdf_slides.py <pdf_path> <out_dir>
"""
import sys
import os
import fitz  # PyMuPDF


def extract(pdf_path: str, out_dir: str) -> None:
    images_dir = os.path.join(out_dir, "images")
    os.makedirs(images_dir, exist_ok=True)

    doc = fitz.open(pdf_path)
    md_lines = []

    for page_index in range(len(doc)):
        page = doc[page_index]
        page_num = page_index + 1

        md_lines.append(f"## Slide {page_num}\n")

        # Collect text blocks and image blocks together, ordered by
        # vertical position, so image references land roughly where
        # they appear on the slide.
        blocks = page.get_text("dict")["blocks"]
        image_list = page.get_images(full=True)

        # Map xref -> extracted filename (extract each image once per page)
        xref_to_file = {}
        img_counter = 0
        for img in image_list:
            xref = img[0]
            if xref in xref_to_file:
                continue
            img_counter += 1
            try:
                base_image = doc.extract_image(xref)
            except Exception as e:
                print(f"  [warn] page {page_num}: failed to extract xref {xref}: {e}")
                continue
            ext = base_image["ext"]
            fname = f"page-{page_num:03d}-img-{img_counter:02d}.{ext}"
            fpath = os.path.join(images_dir, fname)
            with open(fpath, "wb") as f:
                f.write(base_image["image"])
            xref_to_file[xref] = f"images/{fname}"

        # Build an ordered sequence of (y_position, kind, content)
        items = []
        for block in blocks:
            bbox = block.get("bbox", (0, 0, 0, 0))
            y = bbox[1]
            if block["type"] == 0:  # text
                text = ""
                for line in block.get("lines", []):
                    line_text = "".join(span["text"] for span in line.get("spans", []))
                    if line_text.strip():
                        text += line_text + "\n"
                if text.strip():
                    items.append((y, "text", text.strip()))
            elif block["type"] == 1:  # image block
                # image blocks don't reliably carry xref in dict mode;
                # fall back to page-level image list positions below
                pass

        # Attach image blocks by re-querying image rects
        for img in image_list:
            xref = img[0]
            if xref not in xref_to_file:
                continue
            rects = page.get_image_rects(xref)
            y = rects[0].y0 if rects else 0
            items.append((y, "image", xref_to_file[xref]))

        items.sort(key=lambda t: t[0])

        if not items:
            md_lines.append("_(slide sem texto ou imagens extraíveis)_\n")

        for _, kind, content in items:
            if kind == "text":
                for line in content.split("\n"):
                    md_lines.append(f"- {line}")
                md_lines.append("")
            else:
                md_lines.append(f"[Imagem: {content}]")
                md_lines.append("")

        md_lines.append("")

    out_md = os.path.join(out_dir, "extracted.md")
    with open(out_md, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))

    print(f"Pages processed: {len(doc)}")
    print(f"Text written to: {out_md}")
    print(f"Images written to: {images_dir}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 scripts/extract_pdf_slides.py <pdf_path> <out_dir>")
        sys.exit(1)
    extract(sys.argv[1], sys.argv[2])
