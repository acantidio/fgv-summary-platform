# FGV MBA Summary Platform — Design Spec

**Date:** 2026-05-31
**Status:** Approved

## Overview

A personal learning consolidation platform for an FGV MBA in Management. Built from Obsidian Markdown notes, compiled into a fully static HTML site deployed on GitHub Pages. ~20 subjects, one added per month. Used for personal review and test preparation.

## Goals

- Single source of truth: Obsidian Markdown notes in `content/`
- Zero-friction onboarding of new subjects: drop a `.md` file, run build
- High performance: pure static HTML + CSS, zero JS on rendered pages
- Impeccable responsive experience across mobile, tablet, and desktop
- Design coherent with the existing `estrategia-corporativa` site aesthetic

## Non-Goals

- CMS, admin UI, authentication
- Search or filtering (not needed at this scale)
- Server-side rendering or a backend
- Any JavaScript on the rendered pages

---

## Repository Structure

```
fgv-summary-platform/
├── content/                        ← Obsidian .md files (source of truth)
│   ├── estrategia-corporativa.md
│   ├── gestao-de-servicos.md
│   ├── transformacao-digital.md
│   └── analise-demonstrativos.md
├── build.js                        ← entire build pipeline (~100 lines)
├── package.json                    ← dependencies: marked, gray-matter
├── docs/                           ← GitHub Pages output (never edited manually)
│   ├── index.html                  ← hub page (auto-generated)
│   └── [subject-slug]/
│       └── index.html              ← subject page (auto-generated)
└── .github/
    └── workflows/
        └── deploy.yml              ← auto-deploy on push to main
```

---

## Content Model

Each `.md` file in `content/` uses a YAML frontmatter block followed by free-form Markdown:

```markdown
---
title: Estratégia Corporativa e de Negócios
slug: estrategia-corporativa
description: Metodologia de planejamento estratégico, BSC, OKR e ferramentas de análise.
status: complete        # complete | in-progress | pending
color: purple           # purple | amber | teal | blue | rose
---

## Resumo
...

## Prova
...

## Tópicos
...
```

**Frontmatter fields:**

| Field | Required | Purpose |
|---|---|---|
| `title` | yes | Displayed on hub card and subject page header |
| `slug` | yes | Output directory name (`docs/[slug]/index.html`) |
| `description` | yes | Subtitle on hub card |
| `status` | yes | Badge on hub card: `complete`, `in-progress`, `pending` |
| `color` | yes | Accent color: `purple`, `amber`, `teal`, `blue`, `rose` |

Everything below the frontmatter renders as-is — Obsidian structure is preserved with no reformatting required.

---

## Build Pipeline

`build.js` executes three sequential steps:

1. **Read** — scans `content/` for all `.md` files; parses frontmatter with `gray-matter` and body with `marked`
2. **Render** — generates each subject page by injecting parsed HTML into a JS template literal; generates the hub page with all subject cards
3. **Write** — outputs `docs/index.html` and `docs/[slug]/index.html` for each subject

Key constraints:
- HTML templates are JS template literals inside `build.js` — no separate template files
- CSS is inlined into every page — each HTML file is fully self-contained
- Only external dependency is the Google Fonts `<link>` tag
- Build command: `npm run build` (runs `node build.js`)

**GitHub Actions** (`deploy.yml`) runs `npm run build` on every push to `main` and commits the updated `docs/` folder, enabling GitHub Pages to serve the latest content automatically.

---

## Page Architecture

### Hub Page (`docs/index.html`)

- Header: platform title, FGV/MBA label, brief description
- Card grid of all subjects sorted alphabetically by `title` frontmatter field
- Each card: color accent strip, title, description, status badge, arrow link
- Layout: 2-column grid on desktop (`> 1024px`), single column on mobile/tablet

### Subject Page (`docs/[slug]/index.html`)

- Back link to hub
- Subject header: title, status badge, color accent
- Body: Markdown rendered to HTML — headings, nested lists, inline code, blockquotes all styled
- No sidebar, no JS — pure scrollable reading experience

---

## Design System

Inherited from `estrategia-corporativa`:

**Typography:**
- Display: `DM Serif Display` (headings, card titles)
- Body: `DM Sans` (all body text)
- Mono: `JetBrains Mono` (labels, badges, code)

**Color palette:**
- Background: `#FAF9F6`
- Card background: `#FFFFFF`
- Surface: `#F3F1EC`
- Text primary: `#1A1A18`
- Text secondary: `#5C5B56`
- Border: `#DDD9D0`
- Accent colors: purple, amber, teal, blue, rose (mapped from existing CSS variables)

**Responsive breakpoints (3 media queries, no framework):**
- `< 640px` — mobile: single column, 16px body, full-width cards
- `640–1024px` — tablet: single column, max-width container
- `> 1024px` — desktop: 2-column card grid on hub, reading column on subject pages

---

## Deployment

- GitHub Pages configured to serve from `docs/` on the `main` branch
- GitHub Actions workflow triggers on push to `main`:
  1. Checkout repo
  2. `npm ci`
  3. `npm run build`
  4. Commit updated `docs/` back to `main` with `[skip ci]` in the message to prevent re-triggering the workflow
- No preview environments needed

---

## Adding a New Subject (operational flow)

1. Write notes in Obsidian as usual
2. Copy `.md` file to `content/` with correct frontmatter
3. `git add content/[file].md && git commit -m "add [subject]" && git push`
4. GitHub Actions builds and deploys automatically — done
