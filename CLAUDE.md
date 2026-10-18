# FGV MBA Summary Platform — Claude Instructions

## What This Project Is

A personal learning platform for André's FGV MBA in Management (Gestão Empresarial). Notes are written in Obsidian and compiled into a static HTML site served on GitHub Pages. One new subject is added approximately every month.

**Live site:** `https://acantidio.github.io/fgv-summary-platform/`
**GitHub repo:** `https://github.com/acantidio/fgv-summary-platform`
**Obsidian vault:** `/Users/acantidio/Library/Mobile Documents/com~apple~CloudDocs/Documents/Obsidian/main/MBA GE80/` (iCloud)

---

## The Primary Recurring Task: Adding a New Subject

This will happen every month. When André says something like "I finished class X, add it to the platform", follow this exact flow.

There are two possible sources — check both before asking:
- **Obsidian note** (Path A, below) — André's own class notes.
- **Teacher materials** in `complementary-study-docs/[slug]/` (Path B, see "Subjects built from teacher materials") — slides, apostila, dinâmicas, plus any class board (Mural/Miro). Recent subjects (Supply Chain, Gestão de Projetos) were built this way, with no Obsidian note.

### 1. Find the Obsidian note

```bash
ls "/Users/acantidio/Library/Mobile Documents/com~apple~CloudDocs/Documents/Obsidian/main/MBA GE80/"
```

Read the relevant `.md` file. The content starts immediately — no frontmatter in Obsidian files.

### 2. Create the content file

Create `content/[slug].md` with frontmatter + the Obsidian content as the body.

**Frontmatter template:**
```markdown
---
title: Full Subject Name in Portuguese
slug: lowercase-kebab-case
description: One sentence summary of what this subject covers.
status: complete        # complete | in-progress | pending
color: purple           # purple | amber | teal | blue | rose — pick one not overused
---

[Obsidian content here]
```

**Rules:**
- `slug` must be unique and URL-safe (no accents, lowercase, hyphens only)
- `color` — pick one that isn't already used by too many subjects. Check `content/` to see current distribution.
- `status: in-progress` if notes are incomplete; `complete` if the class is fully documented.
- Do NOT add a frontmatter section to the Obsidian content — paste it verbatim below the `---` closing.

**Current color assignments:**
| Color | Subjects |
|---|---|
| purple | Estratégia Corporativa · Supply Chain Management |
| blue | Transformação Digital · Gestão de Projetos e Criação de Valor |
| amber | Análise de Demonstrativos Contábeis |
| teal | Gestão de Serviços |
| rose | Liderança e Gestão de Equipes |

Next subject: pick amber, teal or rose (one subject each).

Rotate through colors; each new subject gets the next available or least-used color.

### 3. Handle Obsidian-specific syntax

Obsidian notes may contain:
- `[[wikilinks]]` — strip the brackets, leave the text: `[[Estratégia]]` → `Estratégia`
- `![[embedded files]]` — remove entirely
- `---` horizontal rules — render fine, keep them
- Tab-indented nested lists — `marked` handles these correctly, no changes needed

### 4. Enrich with AI

Transform the raw notes into a structured learning document using Claude Opus (model ID in `enrich.js`, currently `claude-opus-4-8`):

```bash
npm run enrich -- [slug]
```

This reads `content/[slug].md`, calls Claude Opus, and writes `content/enriched/[slug].md`. The enriched file contains:
- `> [!SUMMARY]` — a 2–3 sentence cheat-sheet at the top
- `> [!EXAM]` — callouts for exam-critical content
- `> [!KEY]` — callouts for key concepts and frameworks with clean definitions
- `> [!RECALL]` — self-test questions at the end

The API key is managed via 1Password CLI, never as a plaintext `.env`. `.env.tpl` (committed) references `op://Dev/fgv-summary-platform/anthropic_api_key`. `npm run enrich`/`npm run render` already wrap the underlying command with `op run --env-file=.env.tpl --`. See `1PASSWORD-ENV-GUIDE.md` in the Projetos root for the full setup.

Runs once per subject. Re-run only if the raw notes change significantly:
```bash
rm content/enriched/[slug].md && npm run enrich -- [slug]
```

### 5. Run tests and render

```bash
npm test                          # Must pass before committing
npm run render -- [slug]          # Generates docs/[slug]/index.html
```

If the frontmatter test fails, check that `status` and `color` are valid values (see above).

### 6. Open locally to verify

```bash
open docs/index.html
```

Verify the new card appears on the hub. Click through to the subject page and check:
- Summary callout (◎ Resumo) appears at the top
- Exam alerts (⚠ Cai na Prova) highlight the right content
- Key concept cards (◆ Conceito-Chave) are present for major frameworks
- Recall questions (? Recall Ativo) appear at the bottom

### 7. Commit and push

```bash
git add content/[slug].md content/enriched/[slug].md docs/
git commit -m "feat: add [Subject Name]"
git push
```

GitHub Actions runs the tests; GitHub Pages (legacy build from `main:/docs`) deploys the committed `docs/` files. The site updates within ~2 minutes, but the Pages CDN caches pages for up to 10 minutes (`max-age=600`) — a new page can 404 or the hub can look stale in that window. Verify with a cache-buster: `curl -s "https://acantidio.github.io/fgv-summary-platform/?x=$RANDOM" | grep [slug]`.

---

## Subjects Built from Teacher Materials (Path B)

When there is no Obsidian note, the subject is built from the files in `complementary-study-docs/[slug]/`. This replaces steps 1–5 above; the commit/push step is the same.

### 1. Extract the materials to Markdown

Outputs go in `complementary-study-docs/[slug]/extracted/` (the `.md` files are committed; the original PDFs/DOCX/PPTX and extracted images are gitignored). The scripts need PyMuPDF and python-docx, which are not installed system-wide — use a throwaway venv:

```bash
python3 -m venv /tmp/fgv-venv && /tmp/fgv-venv/bin/pip install pymupdf python-docx
D=complementary-study-docs/[slug]
/tmp/fgv-venv/bin/python scripts/extract_pdf_slides.py "$D/<slides>.pdf" $D/extracted      # → extracted.md + images/
/tmp/fgv-venv/bin/python scripts/extract_pdf_text.py  "$D/<apostila>.pdf" $D/extracted/apostila.md
/tmp/fgv-venv/bin/python scripts/extract_docx.py      "$D/<dinamica>.docx" "$D/extracted/<dinamica>.md"
```

Many slides are **image-only** (diagrams, canvases, matrices) and extract as empty text. Render those pages to PNG (`page.get_pixmap(dpi=70)` in PyMuPDF) and read them visually — key frameworks often live only there.

### 2. Class boards (Mural / Miro)

Classes may be run on an online board with the group's work. A plain fetch returns an empty JS shell; boards need a real browser. For Mural, a public link allows **"Enter as a visitor"** (asks for a display name — use a neutral one like "Visitante"; other participants may see it). The board content is in the JSON response of `GET /api/v0/content/murals/<workspace>.<id>/widgets` — capture it with Playwright (`playwright-core` + the Chromium in `~/Library/Caches/ms-playwright/`) instead of screenshotting. Child widgets have coordinates **relative to their parent frame** (`properties.parentId`); template images (`PhotoWidget.photoURL`) resolve to signed URLs in the `/assets` response (they expire in ~15 min). Save a clean Markdown extract as `extracted/mural-<group>.md`. The Gestão de Projetos subject is the reference example.

### 3. Assemble the raw content file

`content/[slug].md` = frontmatter + the extracted Markdown concatenated under `# Slides — …`, `# Apostila — …`, `# Dinâmica — …`, `# Mural — …` headings (image markers stripped).

### 4. Enrich and render

Either run `npm run enrich` / `npm run render` (API, via 1Password), or — as done for Supply Chain and Gestão de Projetos — write `content/enriched/[slug].md` and `docs/[slug]/index.html` in-session, reusing the CSS system of an existing subject page (e.g. `docs/gestao-de-projetos/index.html`). Rules for in-session enrichment:
- Mark anything not in the teacher's material as **"Complemento"** (e.g. a standard formula the slides omit).
- When sources contradict each other (e.g. a dinâmica table vs. the slide), follow the slide/board, and call out the contradiction in a `[!EXAM]` callout.
- Analyses of exercises are labeled "não é gabarito oficial".

Then rebuild the hub without any API call:

```bash
node -e "import('./render.js').then(m => m.buildHub())"
```

### 5. Verify

`npm test`, then screenshot the page at 1200px and 390px with headless Chromium and check for horizontal overflow on mobile (`document.documentElement.scrollWidth > innerWidth`). Inline `grid-template-columns` styles bypass the mobile breakpoint — use the `.cards.cN` classes instead.

---

## Commands

| Command | Purpose |
|---|---|
| `npm ci` | Install dependencies (needed once per clone — `render.js` imports `@anthropic-ai/sdk` even for `buildHub`) |
| `npm test` | Run all tests (render tests write to a temp dir; `docs/` is not touched) |
| `node -e "import('./render.js').then(m => m.buildHub())"` | Rebuild only the hub (`docs/index.html`) — no API call |
| `npm run render -- [slug]` | AI-render one subject page (run once per subject) |
| `npm run render -- --all` | AI-render all subjects that have enriched files ⚠️ also overwrites the in-session (Path B) pages — prefer rendering one slug at a time |
| `npm run enrich -- [slug]` | AI-enrich one subject (run once per subject) |
| `npm run enrich -- --all` | AI-enrich all subjects missing an enriched file |
| `open docs/index.html` | Preview locally |

---

## Architecture at a Glance

```
content/[slug].md                        ← Raw Obsidian note + frontmatter (source of truth, never modified)
content/enriched/[slug].md               ← AI-enriched learning content (generated by enrich.js)
complementary-study-docs/[slug]/         ← PDFs, slides, books per subject (dump files here; originals gitignored)
complementary-study-docs/[slug]/extracted/ ← Markdown extracted from those files (committed)
scripts/extract_*.py                     ← PDF slides / PDF text / DOCX → Markdown extractors (PyMuPDF, python-docx)
enrich.js                                ← AI enrichment: reads content/ → writes content/enriched/
render.js                                ← AI renderer: reads content/enriched/ → writes docs/ (run once per subject)
test.js                                  ← Tests covering content frontmatter, enrich import, and render functions
.env.tpl                                 ← ANTHROPIC_API_KEY via op:// reference (committed, no real secret)
docs/index.html                          ← Generated hub page (never edit directly)
docs/[slug]/index.html                   ← AI-generated subject page (never edit directly)
.github/workflows/deploy.yml             ← CI: runs tests on push to main, deploys committed docs/
```

`render.js` exports: `buildHub()`, `renderSubject(slug, client?)`, `renderSite(client?)`.
All output is pure HTML + CSS — zero JavaScript on the output pages.

### Enrichment model

Always use the **latest Claude Opus model** for enrichment — check `enrich.js` for the current model ID. This is a one-time-per-subject operation where learning quality matters more than speed or cost. Never downgrade to a smaller model (no Sonnet, no Haiku).

---

## Callout Syntax Reference

The enriched files use four callout types. `render.js` passes them to Claude Opus, which renders them as styled HTML components.

| Syntax | Rendered label | Color | Purpose |
|---|---|---|---|
| `> [!SUMMARY]` | ◎ Resumo | Surface/neutral | 2–3 sentence cheat-sheet at top of page |
| `> [!EXAM]` | ⚠ Cai na Prova | Amber | Exam-critical content |
| `> [!KEY]` | ◆ Conceito-Chave | Purple | Key framework or concept with definition |
| `> [!RECALL]` | ? Recall Ativo | Teal | Self-test question |

Example:
```markdown
> [!EXAM]
> BSC é o tema mais cobrado. Saber montar o Mapa (de baixo pra cima) e o Painel (Objetivos, Indicadores, Alvos, Iniciativas).

> [!KEY]
> **SWOT** — Análise do ambiente atual dividida em quatro quadrantes: Forças e Fraquezas (internos, controláveis) e Oportunidades e Ameaças (externos, de mercado). Cada item deve ser rastreável com tag (S01, W01, O01, T01).
```

---

## Complementary Materials

Each subject has a dedicated folder at `complementary-study-docs/[slug]/` for teacher slides, PDFs, books, and any other supplementary files. Dump materials there as-is — no naming convention required.

**When adding a new subject**, always create the corresponding folder:
```bash
mkdir complementary-study-docs/[slug]
```

Today these files are processed by hand (see "Subjects Built from Teacher Materials" above). A future automated engine would do it with one command. See [`docs/guides/complementary-materials-engine.md`](docs/guides/complementary-materials-engine.md) for the full roadmap. To trigger that work: start a session and say **"Let's build the complementary materials engine."**

---

## Detailed Guides

- [Adding a Subject (full guide)](docs/guides/adding-a-subject.md) — complete walkthrough with edge cases
- [Content Model Reference](docs/guides/content-model.md) — all frontmatter fields, valid values, and callout syntax
- [Design System](docs/guides/design-system.md) — colors, fonts, CSS variables, breakpoints
- [Complementary Materials Engine](docs/guides/complementary-materials-engine.md) — planned pipeline for processing PDFs, slides, and books

---

## What NOT to Do

- Never edit `docs/*.html` or `content/enriched/*.md` of an API-generated subject by hand — regenerate them with `render.js` / `enrich.js`. Exception: subjects authored in-session (Path B: Supply Chain, Gestão de Projetos) have no API-generated version, so their files are edited directly — re-running `npm run render`/`enrich` on them would replace the hand-built version.
- Never commit with failing tests
- Never edit the `SYSTEM_PROMPT` in `render.js` unless the design needs to change globally
- Do not add JavaScript to the output pages — the design is intentionally JS-free
- Never use a model weaker than Claude Opus for enrichment or rendering — learning quality depends on it (check `enrich.js` and `render.js` for current model ID)
- Never commit a plaintext `.env` — secrets live in 1Password, referenced via `.env.tpl`
