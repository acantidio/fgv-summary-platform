# FGV MBA Summary Platform — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static HTML site from Obsidian Markdown notes covering all FGV MBA subjects, deployed on GitHub Pages, with a hub page and per-subject pages inheriting the estrategia-corporativa design system.

**Architecture:** A single `build.js` Node.js ESM script reads `content/*.md` files, parses YAML frontmatter + Markdown body, and renders two HTML templates (hub page + subject page) into `docs/`. GitHub Actions runs the build on every push to `main` and commits the updated `docs/`. Zero JS on rendered pages.

**Tech Stack:** Node.js 20+ (ESM, `"type":"module"`), `gray-matter` v4 (frontmatter parsing), `marked` v12 (Markdown → HTML), `node:test` (built-in test runner — no extra dependency), GitHub Actions, GitHub Pages.

---

## File Map

| File | Responsibility |
|---|---|
| `package.json` | Project config, `build`/`test` scripts, dependencies |
| `build.js` | Full pipeline: parse content, render templates, write `docs/` |
| `test.js` | All tests — written once in Task 2, made to pass in Tasks 3–6 |
| `content/*.md` | Obsidian notes with frontmatter (single source of truth) |
| `docs/index.html` | Generated hub page |
| `docs/[slug]/index.html` | Generated per-subject pages |
| `.github/workflows/deploy.yml` | CI: build + commit `docs/` on push to `main` |
| `.gitignore` | Ignore `node_modules/` |

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "fgv-summary-platform",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "node build.js",
    "test": "node --test test.js"
  },
  "dependencies": {
    "gray-matter": "^4.0.3",
    "marked": "^12.0.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, `package-lock.json` generated.

- [ ] **Step 3: Create `.gitignore`**

```
node_modules/
```

- [ ] **Step 4: Initialize git and commit**

```bash
git init
git add package.json package-lock.json .gitignore
git commit -m "chore: project scaffold"
```

---

## Task 2: Content Files + Full Test Suite

**Files:**
- Create: `content/estrategia-corporativa.md`
- Create: `content/gestao-de-servicos.md`
- Create: `content/transformacao-digital.md`
- Create: `content/analise-demonstrativos.md`
- Create: `test.js` (complete — all tests written upfront)

**Note on test strategy:** `test.js` uses static imports only for built-in modules and `gray-matter`. Tests for `build.js` functions use dynamic `await import('./build.js')` inside async tests — this lets the test file exist before `build.js` is created, and each test fails gracefully until its function is implemented.

- [ ] **Step 1: Create `content/` directory**

```bash
mkdir content
```

- [ ] **Step 2: Create `content/estrategia-corporativa.md`**

```markdown
---
title: Estratégia Corporativa e de Negócios
slug: estrategia-corporativa
description: Metodologia de planejamento estratégico, BSC, OKR e ferramentas de análise de ambiente.
status: complete
color: purple
---

## Resumo

**Chegar no macro objetivo, saindo do desempenho atual para o desempenho futuro por meio da estratégia**

## Prova

**Estudo de caso, criar a estratégia da empresa com os Principais tópicos; BSC e OKR cai em todas**

Saber a IMPORTÂNCIA de cada fase da metodologia (Direcionamento, Ambiente, Desdobramento) e cada ferramenta (Missão, visão, valores; Proposta de Valor, SWOT, **BSC** (Sempre cai), etc

Destaques: SWOT, BSC

## Tópicos

[paste body from Obsidian: Estratégia corporativa e de negócios.md]
```

- [ ] **Step 3: Create `content/gestao-de-servicos.md`**

```markdown
---
title: Gestão de Serviços
slug: gestao-de-servicos
description: Marketing para serviços, carteiras de clientes, qualidade e fidelização.
status: complete
color: teal
---

## Tópicos

[paste body from Obsidian: Gestão de Serviços.md]
```

- [ ] **Step 4: Create `content/transformacao-digital.md`**

```markdown
---
title: Transformação Digital
slug: transformacao-digital
description: Fundamentos e frameworks de transformação digital nas organizações.
status: in-progress
color: blue
---

## Tópicos

[paste body from Obsidian: Transformação Digital.md]
```

- [ ] **Step 5: Create `content/analise-demonstrativos.md`**

```markdown
---
title: Análise de Demonstrativos Contábeis
slug: analise-demonstrativos
description: Leitura e interpretação de balanços patrimoniais, DRE e indicadores financeiros.
status: complete
color: amber
---

## Tópicos

[paste body from Obsidian: Análise de demonstrativos contábeis.md]
```

- [ ] **Step 6: Create `test.js` — complete test suite**

```javascript
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = join(__dirname, 'content')
const DOCS_DIR = join(__dirname, 'docs')

const REQUIRED_FIELDS = ['title', 'slug', 'description', 'status', 'color']
const VALID_STATUSES = ['complete', 'in-progress', 'pending']
const VALID_COLORS = ['purple', 'amber', 'teal', 'blue', 'rose']

// ── Task 2: content files ─────────────────────────────────────────────────────
test('content files exist and have valid frontmatter', () => {
  const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'))
  assert.ok(files.length >= 4, `Expected at least 4 content files, found ${files.length}`)
  for (const file of files) {
    const { data } = matter(readFileSync(join(CONTENT_DIR, file), 'utf-8'))
    for (const field of REQUIRED_FIELDS) {
      assert.ok(data[field], `${file}: missing frontmatter field "${field}"`)
    }
    assert.ok(VALID_STATUSES.includes(data.status), `${file}: invalid status "${data.status}"`)
    assert.ok(VALID_COLORS.includes(data.color), `${file}: invalid color "${data.color}"`)
  }
})

// ── Task 3: parseContent ──────────────────────────────────────────────────────
test('parseContent returns all required fields plus rendered html', async () => {
  const { parseContent } = await import('./build.js')
  const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'))
  const result = parseContent(join(CONTENT_DIR, files[0]))

  assert.equal(typeof result.title, 'string', 'title must be string')
  assert.ok(result.title.length > 0, 'title must be non-empty')
  assert.equal(typeof result.slug, 'string', 'slug must be string')
  assert.ok(result.slug.length > 0, 'slug must be non-empty')
  assert.equal(typeof result.description, 'string', 'description must be string')
  assert.equal(typeof result.status, 'string', 'status must be string')
  assert.equal(typeof result.color, 'string', 'color must be string')
  assert.equal(typeof result.html, 'string', 'html must be string')
  assert.ok(result.html.includes('<'), 'html must contain rendered HTML tags')
})

// ── Task 4: renderSubjectPage ─────────────────────────────────────────────────
test('renderSubjectPage returns valid HTML with title and rendered body', async () => {
  const { renderSubjectPage } = await import('./build.js')
  const subject = {
    title: 'Test Subject',
    slug: 'test-subject',
    description: 'A test description.',
    status: 'complete',
    color: 'purple',
    html: '<h2>Section</h2><p>Body text</p>',
  }
  const html = renderSubjectPage(subject)

  assert.ok(html.startsWith('<!DOCTYPE html>'), 'must start with DOCTYPE')
  assert.ok(html.includes('lang="pt-BR"'), 'must declare pt-BR language')
  assert.ok(html.includes('Test Subject'), 'must contain subject title')
  assert.ok(html.includes('<h2>Section</h2>'), 'must include rendered markdown body')
  assert.ok(html.includes('href="../"'), 'must contain back link to hub')
  assert.ok(!html.includes('<script'), 'must contain no script tags')
})

// ── Task 5: renderHubPage ─────────────────────────────────────────────────────
test('renderHubPage returns HTML with sorted card links for all subjects', async () => {
  const { renderHubPage } = await import('./build.js')
  const subjects = [
    { title: 'Beta Subject', slug: 'beta', description: 'Desc B', status: 'in-progress', color: 'amber', html: '' },
    { title: 'Alpha Subject', slug: 'alpha', description: 'Desc A', status: 'complete', color: 'purple', html: '' },
  ]
  const html = renderHubPage(subjects)

  assert.ok(html.startsWith('<!DOCTYPE html>'), 'must start with DOCTYPE')
  assert.ok(html.includes('href="./alpha/"'), 'must contain link to alpha')
  assert.ok(html.includes('href="./beta/"'), 'must contain link to beta')
  assert.ok(html.includes('Alpha Subject'), 'must contain first subject title')
  assert.ok(html.includes('Beta Subject'), 'must contain second subject title')
  assert.ok(!html.includes('<script'), 'must contain no script tags')
  // Sorted alphabetically: Alpha before Beta
  assert.ok(html.indexOf('Alpha Subject') < html.indexOf('Beta Subject'), 'cards must be sorted by title')
})

// ── Task 6: buildSite ─────────────────────────────────────────────────────────
test('buildSite generates docs/index.html and all subject pages', async () => {
  const { buildSite } = await import('./build.js')
  buildSite()

  assert.ok(existsSync(join(DOCS_DIR, 'index.html')), 'docs/index.html must exist')

  const slugs = ['estrategia-corporativa', 'gestao-de-servicos', 'transformacao-digital', 'analise-demonstrativos']
  for (const slug of slugs) {
    assert.ok(existsSync(join(DOCS_DIR, slug, 'index.html')), `docs/${slug}/index.html must exist`)
  }

  const hub = readFileSync(join(DOCS_DIR, 'index.html'), 'utf-8')
  assert.ok(hub.includes('href="./estrategia-corporativa/"'), 'hub must link to estrategia-corporativa')
  assert.ok(hub.includes('href="./gestao-de-servicos/"'), 'hub must link to gestao-de-servicos')
})
```

- [ ] **Step 7: Run tests — verify content test passes, build tests fail gracefully**

```bash
npm test
```

Expected:
```
✓ content files exist and have valid frontmatter
✗ parseContent returns all required fields plus rendered html
  Error: Cannot find module './build.js'
✗ renderSubjectPage returns valid HTML ...
  Error: Cannot find module './build.js'
✗ renderHubPage returns HTML with sorted card links ...
  Error: Cannot find module './build.js'
✗ buildSite generates docs/index.html and all subject pages
  Error: Cannot find module './build.js'
```

- [ ] **Step 8: Commit**

```bash
git add content/ test.js
git commit -m "feat: add content files and complete test suite"
```

---

## Task 3: `parseContent()` — Read and Parse Markdown Files

**Files:**
- Create: `build.js`

- [ ] **Step 1: Create `build.js` with `parseContent`**

```javascript
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { marked } from 'marked'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const CONTENT_DIR = join(__dirname, 'content')
export const DOCS_DIR = join(__dirname, 'docs')

export function parseContent(filePath) {
  const raw = readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    title: data.title,
    slug: data.slug,
    description: data.description,
    status: data.status,
    color: data.color,
    html: marked(content),
  }
}
```

- [ ] **Step 2: Run tests — verify parseContent test now passes**

```bash
npm test
```

Expected:
```
✓ content files exist and have valid frontmatter
✓ parseContent returns all required fields plus rendered html
✗ renderSubjectPage returns valid HTML ...
✗ renderHubPage returns HTML with sorted card links ...
✗ buildSite generates docs/index.html and all subject pages
```

- [ ] **Step 3: Commit**

```bash
git add build.js
git commit -m "feat: add parseContent with gray-matter and marked"
```

---

## Task 4: `renderSubjectPage()` — Subject Page Template

**Files:**
- Modify: `build.js`

- [ ] **Step 1: Append accent map, status labels, `sharedCSS()`, and `renderSubjectPage()` to `build.js`**

```javascript
const ACCENT = {
  purple: { light: '#EEEDFE', main: '#534AB7' },
  amber:  { light: '#FAEEDA', main: '#854F0B' },
  teal:   { light: '#E6F4F1', main: '#0F6E56' },
  blue:   { light: '#EBF5FF', main: '#1A56DB' },
  rose:   { light: '#FDE8EC', main: '#C81E3A' },
}

const STATUS_LABEL = {
  complete: 'Concluído',
  'in-progress': 'Em andamento',
  pending: 'Pendente',
}

function sharedCSS() {
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300..700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #FAF9F6; --bg-card: #FFFFFF; --bg-surface: #F3F1EC;
      --text-primary: #1A1A18; --text-secondary: #5C5B56; --text-tertiary: #8A8985;
      --border: #DDD9D0; --border-light: #ECEAE4;
      --font-display: 'DM Serif Display', Georgia, serif;
      --font-body: 'DM Sans', -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --radius: 16px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-body); background: var(--bg); color: var(--text-primary); -webkit-font-smoothing: antialiased; line-height: 1.6; font-size: 16px; }
    a { color: inherit; text-decoration: none; }
    .container { max-width: 800px; margin: 0 auto; padding: 48px 24px 80px; }
    .badge { font-family: var(--font-mono); font-size: 10px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; display: inline-block; }
    @media (max-width: 640px) { .container { padding: 32px 16px 48px; } }
  </style>`
}

export function renderSubjectPage(subject) {
  const accent = ACCENT[subject.color] ?? ACCENT.purple
  const statusLabel = STATUS_LABEL[subject.status] ?? subject.status

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${subject.title} — FGV MBA</title>
  ${sharedCSS()}
  <style>
    .back { font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); letter-spacing: 0.5px; display: inline-block; margin-bottom: 28px; transition: color 0.15s; }
    .back:hover { color: var(--text-primary); }
    .subject-header { background: var(--bg-card); border: 1px solid var(--border-light); border-top: 4px solid ${accent.main}; border-radius: var(--radius); padding: 24px 28px; margin-bottom: 32px; }
    .subject-header h1 { font-family: var(--font-display); font-size: clamp(24px, 4vw, 36px); font-weight: 400; line-height: 1.2; margin-top: 10px; }
    .content h2 { font-family: var(--font-display); font-size: 22px; font-weight: 400; margin: 40px 0 14px; padding-bottom: 8px; border-bottom: 1px solid var(--border-light); line-height: 1.3; }
    .content h3 { font-size: 15px; font-weight: 600; margin: 24px 0 10px; }
    .content h4 { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin: 16px 0 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .content p { margin-bottom: 14px; line-height: 1.75; }
    .content ul, .content ol { padding-left: 22px; margin-bottom: 14px; }
    .content li { margin-bottom: 5px; line-height: 1.65; }
    .content li > ul, .content li > ol { margin-top: 5px; margin-bottom: 2px; }
    .content strong { font-weight: 600; }
    .content em { font-style: italic; color: var(--text-secondary); }
    .content code { font-family: var(--font-mono); font-size: 13px; background: var(--bg-surface); padding: 2px 6px; border-radius: 4px; }
    .content pre { background: var(--bg-surface); padding: 18px; border-radius: 8px; overflow-x: auto; margin-bottom: 18px; }
    .content pre code { background: none; padding: 0; }
    .content blockquote { border-left: 3px solid var(--border); padding: 2px 0 2px 18px; color: var(--text-secondary); margin-bottom: 14px; }
    .content hr { border: none; border-top: 1px solid var(--border-light); margin: 28px 0; }
    @media (max-width: 640px) {
      .subject-header { padding: 20px; }
      .content h2 { font-size: 19px; margin-top: 32px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <a href="../" class="back">← FGV MBA</a>
    <div class="subject-header">
      <span class="badge" style="background:${accent.light};color:${accent.main}">${statusLabel}</span>
      <h1>${subject.title}</h1>
    </div>
    <div class="content">${subject.html}</div>
  </div>
</body>
</html>`
}
```

- [ ] **Step 2: Run tests — verify renderSubjectPage test now passes**

```bash
npm test
```

Expected:
```
✓ content files exist and have valid frontmatter
✓ parseContent returns all required fields plus rendered html
✓ renderSubjectPage returns valid HTML with title and rendered body
✗ renderHubPage returns HTML with sorted card links ...
✗ buildSite generates docs/index.html and all subject pages
```

- [ ] **Step 3: Commit**

```bash
git add build.js
git commit -m "feat: add renderSubjectPage with full responsive CSS"
```

---

## Task 5: `renderHubPage()` — Hub Page with Card Grid

**Files:**
- Modify: `build.js`

- [ ] **Step 1: Append `renderHubPage()` to `build.js`**

```javascript
export function renderHubPage(subjects) {
  const sorted = [...subjects].sort((a, b) =>
    a.title.localeCompare(b.title, 'pt-BR')
  )

  const cards = sorted.map(s => {
    const accent = ACCENT[s.color] ?? ACCENT.purple
    const statusLabel = STATUS_LABEL[s.status] ?? s.status
    return `      <a href="./${s.slug}/" class="card" style="border-top-color:${accent.main}">
        <span class="badge" style="background:${accent.light};color:${accent.main}">${statusLabel}</span>
        <h2>${s.title}</h2>
        <p>${s.description}</p>
      </a>`
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FGV MBA — Resumo de Conteúdos</title>
  ${sharedCSS()}
  <style>
    .hub-header { padding: 56px 0 44px; }
    .label { font-family: var(--font-mono); font-size: 11px; font-weight: 500; color: var(--text-tertiary); letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 12px; }
    h1 { font-family: var(--font-display); font-size: clamp(28px, 5vw, 42px); font-weight: 400; line-height: 1.2; margin-bottom: 12px; }
    .subtitle { font-size: 16px; color: var(--text-secondary); line-height: 1.7; max-width: 520px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .card { background: var(--bg-card); border: 1px solid var(--border-light); border-top: 4px solid transparent; border-radius: var(--radius); padding: 24px 28px 28px; display: block; transition: box-shadow 0.2s, transform 0.2s; }
    .card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.07); transform: translateY(-2px); border-color: var(--border); }
    .card h2 { font-family: var(--font-display); font-size: 20px; font-weight: 400; margin: 10px 0 8px; line-height: 1.3; }
    .card p { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    @media (max-width: 640px) {
      .grid { grid-template-columns: 1fr; }
      .hub-header { padding: 40px 0 32px; }
      .card { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hub-header">
      <span class="label">FGV · MBA em Gestão Empresarial</span>
      <h1>Resumo de Conteúdos</h1>
      <p class="subtitle">Consolidação dos aprendizados por disciplina. Para revisão e preparação para provas.</p>
    </div>
    <div class="grid">
${cards}
    </div>
  </div>
</body>
</html>`
}
```

- [ ] **Step 2: Run tests — verify renderHubPage test now passes**

```bash
npm test
```

Expected:
```
✓ content files exist and have valid frontmatter
✓ parseContent returns all required fields plus rendered html
✓ renderSubjectPage returns valid HTML with title and rendered body
✓ renderHubPage returns HTML with sorted card links for all subjects
✗ buildSite generates docs/index.html and all subject pages
```

- [ ] **Step 3: Commit**

```bash
git add build.js
git commit -m "feat: add renderHubPage with responsive 2-column card grid"
```

---

## Task 6: `buildSite()` — Orchestrate and Write Output

**Files:**
- Modify: `build.js`

- [ ] **Step 1: Append `buildSite()` and CLI entry point to `build.js`**

```javascript
export function buildSite() {
  const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'))
  const subjects = files.map(f => parseContent(join(CONTENT_DIR, f)))

  mkdirSync(DOCS_DIR, { recursive: true })

  for (const subject of subjects) {
    const dir = join(DOCS_DIR, subject.slug)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), renderSubjectPage(subject), 'utf-8')
  }

  writeFileSync(join(DOCS_DIR, 'index.html'), renderHubPage(subjects), 'utf-8')
  console.log(`✓ Built ${subjects.length} subjects → docs/`)
}

// Run when executed directly: node build.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildSite()
}
```

- [ ] **Step 2: Run tests — all five tests must pass**

```bash
npm test
```

Expected:
```
✓ content files exist and have valid frontmatter
✓ parseContent returns all required fields plus rendered html
✓ renderSubjectPage returns valid HTML with title and rendered body
✓ renderHubPage returns HTML with sorted card links for all subjects
✓ buildSite generates docs/index.html and all subject pages
```

- [ ] **Step 3: Verify build output**

```bash
npm run build
ls docs/
```

Expected:
```
analise-demonstrativos/  estrategia-corporativa/  gestao-de-servicos/  index.html  transformacao-digital/
```

- [ ] **Step 4: Open hub in browser to do a visual check**

```bash
open docs/index.html
```

Verify: 4 subject cards visible, correct titles/badges/colors. Click through to a subject page, verify back link works and Markdown renders cleanly.

- [ ] **Step 5: Commit**

```bash
git add build.js docs/
git commit -m "feat: add buildSite — full static site generation pipeline"
```

---

## Task 7: GitHub Actions Deployment Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create the workflow file**

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build site
        run: npm run build

      - name: Commit generated docs
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add docs/
          git diff --staged --quiet || git commit -m "chore: rebuild site [skip ci]"
          git push
```

`git diff --staged --quiet || ...` skips the commit when nothing changed. `[skip ci]` prevents the pushed commit from re-triggering the workflow.

- [ ] **Step 2: Push the repo to GitHub**

```bash
git remote add origin https://github.com/acantidio/fgv-summary-platform.git
git add .github/
git commit -m "chore: add GitHub Actions deploy workflow"
git push -u origin main
```

- [ ] **Step 3: Configure GitHub Pages**

Go to `https://github.com/acantidio/fgv-summary-platform/settings/pages`:
- Source: `Deploy from a branch`
- Branch: `main` / folder: `/docs`
- Save

Expected: After the workflow run completes (~2 min), site is live at `https://acantidio.github.io/fgv-summary-platform/`.

---

## Task 8: Replace Placeholder Content with Full Obsidian Notes

**Files:**
- Modify: `content/estrategia-corporativa.md`
- Modify: `content/gestao-de-servicos.md`
- Modify: `content/transformacao-digital.md`
- Modify: `content/analise-demonstrativos.md`

- [ ] **Step 1: Copy full content from Obsidian into each file**

For each file, keep the frontmatter block exactly as-is and replace the `[paste body from Obsidian: ...]` placeholder with the full note body:

| Content file | Obsidian source |
|---|---|
| `content/estrategia-corporativa.md` | `/Users/andrecantidio/Documents/Obsidian/main/MBA GE80/Estratégia corporativa e de negócios.md` |
| `content/gestao-de-servicos.md` | `/Users/andrecantidio/Documents/Obsidian/main/MBA GE80/Gestão de Serviços.md` |
| `content/transformacao-digital.md` | `/Users/andrecantidio/Documents/Obsidian/main/MBA GE80/Transformação Digital.md` |
| `content/analise-demonstrativos.md` | `/Users/andrecantidio/Documents/Obsidian/main/MBA GE80/Análise de demonstrativos contábeis.md` |

- [ ] **Step 2: Rebuild and run tests**

```bash
npm test && npm run build
```

Expected: all 5 tests pass, `docs/` rebuilt with full content.

- [ ] **Step 3: Visual QA — mobile viewport**

```bash
open docs/index.html
```

Open browser DevTools → toggle device toolbar (iPhone 14 Pro size: 393px). Verify:
- Hub: single column, no horizontal scroll, badge colors visible
- Subject page: comfortable reading width, nested lists render with indentation, bold/italic text styled correctly

- [ ] **Step 4: Commit and push**

```bash
git add content/ docs/
git commit -m "feat: add full Obsidian content for all 4 subjects"
git push
```

Expected: GitHub Actions triggers, runs tests, rebuilds, and deploys automatically.
