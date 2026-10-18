# Complementary Study Materials

This folder holds all supplementary materials for each FGV MBA subject — books, PDFs, teacher slides, readings, and any other files that complement the in-class notes in `content/`.

## Structure

Each subfolder maps 1:1 to a subject slug in `content/`:

```
complementary-study-docs/
├── analise-demonstrativos/
├── estrategia-corporativa/
├── gestao-de-projetos/          ← apostila, slides, 6 dinâmicas (.docx)
│   └── extracted/               ← Markdown extracted from the files above + Mural board (committed)
├── gestao-de-servicos/
├── supply-chain-management/
│   └── extracted/
├── transformacao-digital/
└── [new-subject-slug]/          ← created when a new subject is added
```

## What Goes Here

Drop any of the following into the relevant subject folder:

- Teacher slides (`.pdf`, `.pptx`)
- Recommended reading PDFs
- Supplementary book chapters
- Case study files
- Any other study material distributed during or outside class

No specific naming convention required — dump files as-is.

Original binaries (`.pdf`, `.pptx`, `.docx`, `.xlsx`, images…) are **gitignored** — they stay local. What gets committed is the Markdown in `[slug]/extracted/`, produced by the scripts in `scripts/` (see "Subjects Built from Teacher Materials" in `CLAUDE.md`). Class boards (Mural/Miro) are extracted to `extracted/mural-<group>.md`.

## Adding a New Subject Folder

When adding a new subject to the platform, create its folder here at the same time:

```bash
mkdir complementary-study-docs/[slug]
```

Keep it in sync with `content/` — every subject should have a corresponding folder here.

---

## Future: Complementary Materials Engine

> **Status: Planned — not yet automated.** Today the extraction is semi-manual: `scripts/extract_*.py` turn the files into Markdown, and the enrichment is written in-session (done for Supply Chain Management and Gestão de Projetos).

See [`docs/guides/complementary-materials-engine.md`](../docs/guides/complementary-materials-engine.md) for the full roadmap.

The intent is to build an automated processing pipeline that reads the files in each subject folder, extracts and synthesizes their content using AI, and aggregates the insights directly into the subject pages on the platform.

When implemented, dropping a PDF into this folder and running a single command will enrich the corresponding subject page with additional sections derived from that material — no manual summarization needed.
