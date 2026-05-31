# Complementary Materials Engine — Roadmap

> **Status: Planned — not yet implemented**
> This document captures the architectural intent for a future feature. Nothing described here exists in code yet.

---

## The Problem

Each FGV MBA subject has two layers of knowledge:

1. **In-class notes** — André's Obsidian notes, already powering the platform via `content/*.md`
2. **Complementary materials** — teacher slides, recommended books, PDFs, case studies, stored in `complementary-study-docs/[slug]/`

The second layer is currently unused. It contains dense, authoritative content that could significantly enrich each subject page — but reading and manually summarizing 100+ pages per subject is not practical.

---

## The Intent

Build an automated pipeline (`process.js` or similar) that:

1. **Reads** all files in `complementary-study-docs/[slug]/`
2. **Extracts** text content from each file type (PDF, PPTX, DOCX, etc.)
3. **Synthesizes** the content using an AI model (Claude API) with the Obsidian notes as context
4. **Outputs** structured Markdown sections that can be merged into the subject page or rendered as an additional "deep dive" section

The workflow should be a single command (note: `npm run enrich` is already used for note enrichment — this engine will use a different script name, e.g. `npm run process`):

```bash
npm run process -- estrategia-corporativa
# or: npm run process -- --all
```

---

## Proposed Architecture

```
complementary-study-docs/[slug]/
    ↓  (file extraction: pdf-parse, pptx-to-text, etc.)
extract.js
    ↓  (raw text per file)
synthesize.js  ← calls Claude API with extracted text + existing content/[slug].md as context
    ↓  (structured Markdown: summaries, key concepts, formulas, exam tips)
content/[slug].supplementary.md  ← or merged directly into content/[slug].md
    ↓
build.js  (existing pipeline, picks up enriched content)
    ↓
docs/[slug]/index.html
```

---

## What the Engine Should Produce

For each subject, the enrichment pass should generate one or more of the following sections, appended to or embedded in the subject page:

### `## Leituras Complementares`
A synthesized summary of the key arguments and frameworks from each reading material — not a verbatim extraction, but a distillation of what's relevant for the MBA context.

### `## Conceitos-Chave do Material`
Definitions, formulas, and frameworks extracted from slides and books that aren't in the class notes but are examinable.

### `## Dicas de Prova (do Material)`
Exam-relevant highlights found in teacher slides or highlighted in PDFs — distinct from the `## Prova` section in the Obsidian notes, which captures in-class exam guidance.

### `## Conexões e Síntese`
How the complementary materials connect to or expand on the in-class notes — cross-references, contradictions, deeper explorations of topics mentioned briefly in class.

---

## File Types to Support

| Type | Extraction approach |
|---|---|
| `.pdf` | `pdf-parse` npm package |
| `.pptx` | `pptx-extractor` or `officegen` |
| `.docx` | `mammoth` npm package |
| `.txt`, `.md` | Direct read |
| Images in PDFs | Skip text extraction; consider vision API later |

---

## Claude API Integration

The synthesis step will use the Claude API (Anthropic SDK) with:

- **Model:** `claude-opus-4-7` (always use the most capable model — same principle as `enrich.js`)
- **Prompt caching:** enabled — the system prompt and extracted text are stable across runs
- **Context:** the existing `content/[slug].md` is passed as context so the synthesis is anchored to what André already knows
- **Output format:** structured Markdown matching the section headers above
- **Token budget:** per-file synthesis to avoid context overflow on large PDFs

---

## Implementation Notes (for when this is built)

- The engine should be **idempotent** — running it twice on the same inputs produces the same output
- Extracted raw text should be cached locally (e.g., `complementary-study-docs/[slug]/.cache/`) so the API isn't called again if the source files haven't changed — use file hashes for cache invalidation
- The pipeline should run independently of `build.js` — it enriches `content/`, which `build.js` then renders
- The existing test suite in `test.js` should be extended to cover the new content model when supplementary sections are added
- Cost awareness: large PDFs + many subjects = significant API spend. Add a dry-run mode that reports estimated token usage before hitting the API.

---

## How to Trigger This Work

When André decides it's time to build this, start a new session in this project and say:

> "Let's build the complementary materials engine."

Claude will read this document and `CLAUDE.md`, understand the full context, and proceed directly to brainstorming and planning the implementation.
