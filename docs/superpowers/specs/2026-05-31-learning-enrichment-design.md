# Learning Content Enrichment — Design Spec

**Date:** 2026-05-31  
**Status:** Approved  
**Scope:** Transform raw Obsidian class notes into high-quality learning documents using AI, for all FGV MBA subjects.

---

## Problem

Raw Obsidian notes are written for capture speed, not for learning. They are loose bullet points, sometimes incomplete or inconsistent. The current build pipeline simply converts them to HTML — no learning science is applied. The result is a formatted dump, not a study tool.

## Goal

Every subject page becomes a genuinely useful learning document: structured, scannable, with exam alerts, key concept cards, active recall questions, and a summary cheat sheet — all generated automatically from the raw notes.

---

## Architecture

```
Obsidian vault (raw notes)
       ↓
content/[slug].md            ← raw notes + frontmatter (unchanged, source of truth)
       ↓  npm run enrich -- [slug]
content/enriched/[slug].md   ← AI-structured learning content (callout syntax)
       ↓  npm run build
docs/[slug]/index.html       ← final rendered page with learning components
```

### Key principle
Raw notes in `content/` are **never modified**. The enriched files in `content/enriched/` are always derived artifacts — delete and re-enrich anytime.

---

## Enrichment Script: `enrich.js`

### Invocation
```bash
npm run enrich -- estrategia-corporativa   # enrich one subject
npm run enrich -- --all                    # enrich all subjects missing an enriched file
```

### Model
Always use **Claude Opus 4.7** (`claude-opus-4-7`) — the most capable model available. Learning quality is the priority; cost per enrichment run is acceptable for a one-time-per-subject operation.

### Script flow
1. Parse CLI argument (`slug` or `--all`)
2. Read `content/[slug].md`, extract frontmatter + raw body
3. Call Claude Opus 4.7 with system prompt (see below)
4. Write response to `content/enriched/[slug].md` (same frontmatter, enriched body)
5. Log success with token usage

### System prompt (instructional contract)
The prompt instructs Claude to act as a learning designer and to:

1. **Restructure** the raw notes into logical sections with clear H2/H3 headers
2. **Identify** exam-critical content (anything the professor flagged as important, recurring, or test-likely) → wrap in `[!EXAM]`
3. **Extract** key concepts and frameworks → wrap in `[!KEY]` with a clean one-paragraph definition in Portuguese
4. **Generate** 3–5 active recall questions → wrap in `[!RECALL]`
5. **Write** a 2–3 sentence cheat-sheet summary → wrap in `[!SUMMARY]` at the very top of the body
6. **Preserve** all original information — nothing invented, nothing dropped
7. **Write entirely in Portuguese** — same language as the source notes
8. **Output only the enriched markdown body** — no preamble, no explanation, no code fences

---

## Callout Syntax

Four component types defined by blockquote prefix:

| Syntax | Component | Color / Style | Purpose |
|---|---|---|---|
| `> [!SUMMARY]` | Cheat Sheet | Accent color, top of page | 2–3 sentence overview of the whole subject |
| `> [!EXAM]` | Exam Alert | Amber/warning | What the professor signals will be tested |
| `> [!KEY]` | Key Concept | Purple/brand | Important framework or term with clean definition |
| `> [!RECALL]` | Active Recall | Teal/green | Self-test question — answer mentally before reading on |

### Example enriched markdown

```markdown
> [!SUMMARY]
> BSC e OKR caem em todas as provas. O foco é dominar o mapa estratégico e saber conectar os 4 pilares: Financeiro, Clientes, Processos Internos e Aprendizado. SWOT é o principal instrumento de análise do ambiente.

## Direcionamento

> [!KEY]
> **Proposta de Valor** — Define o encaixe entre o que o produto oferece (lado esquerdo do canvas) e o que o cliente precisa (lado direito). O processo tem 4 etapas: mapear Produto/Cliente/Substituto → preencher lado do cliente → preencher lado do produto → fazer o encaixe conectando as tags.

> [!EXAM]
> BSC é o tema mais cobrado. Saber montar o Mapa (conectar objetivos de baixo pra cima, pelos 4 pilares) e o Painel (Objetivos, Indicadores, Alvos com valor atual e meta, Projetos/Iniciativas).

## Recall

> [!RECALL]
> Quais são os 4 pilares do BSC e como eles se conectam no mapa estratégico?

> [!RECALL]
> Qual a diferença entre Visão e Missão? Qual muda e qual não muda?
```

---

## Build Pipeline Changes

### `build.js` updates

1. **Enriched file fallback**: `parseContent()` checks `content/enriched/[slug].md` first; falls back to `content/[slug].md`
2. **Callout renderer**: before passing body to `marked`, a pre-processing step converts `> [!TYPE]\n> text` blocks into styled HTML `<div class="callout callout-TYPE">` elements
3. **Callout CSS**: four new component styles added to `renderSubjectPage()` CSS

### Callout HTML output
```html
<div class="callout callout-exam">
  <div class="callout-label">⚠ Cai na Prova</div>
  <div class="callout-body">...</div>
</div>

<div class="callout callout-key">
  <div class="callout-label">◆ Conceito-Chave</div>
  <div class="callout-body">...</div>
</div>

<div class="callout callout-recall">
  <div class="callout-label">? Recall Ativo</div>
  <div class="callout-body">...</div>
</div>

<div class="callout callout-summary">
  <div class="callout-label">◎ Resumo</div>
  <div class="callout-body">...</div>
</div>
```

---

## Test Coverage

`test.js` additions:
- Callout parser correctly converts `[!EXAM]`, `[!KEY]`, `[!RECALL]`, `[!SUMMARY]` syntax
- Enriched file is preferred over raw file when both exist
- Build output contains `.callout-exam` class when enriched file has `[!EXAM]`
- `enrich.js` can be imported without side effects (dry-run safe)

---

## File Inventory

| File | Change |
|---|---|
| `enrich.js` | New — AI enrichment script |
| `content/enriched/[slug].md` | New — AI-generated per subject |
| `build.js` | Updated — callout renderer + enriched/ fallback |
| `test.js` | Updated — callout and enriched-file tests |
| `package.json` | Updated — `enrich` script added |
| `CLAUDE.md` | Updated — full workflow for new + enrich step |
| `docs/guides/adding-a-subject.md` | Updated — enrich step added |
| `docs/guides/content-model.md` | Updated — callout syntax documented |

---

## Updated Recurring Workflow (Adding a New Subject)

```
1. Copy Obsidian note → content/[slug].md  (with frontmatter)
2. npm run enrich -- [slug]                (AI transforms notes → enriched/)
3. npm run build                           (renders enriched content)
4. open docs/index.html                    (verify)
5. git add content/ docs/ && git commit && git push
```

---

## Out of Scope (for now)

- Complementary materials (PDFs, slides) — separate future engine
- Re-enrichment on note update (manual re-run is sufficient)
- Enrichment of hub/index page
