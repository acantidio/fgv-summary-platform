# Learning Content Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `npm run enrich -- [slug]` command that calls Claude Opus 4.7 to transform raw Obsidian notes into a structured learning document with exam alerts, key concept cards, active recall questions, and a summary — then update `build.js` to render those components as styled HTML.

**Architecture:** Raw notes in `content/[slug].md` are never touched. `enrich.js` reads them, calls Claude Opus 4.7, and writes enriched content to `content/enriched/[slug].md` using a callout syntax (`> [!EXAM]`, `> [!KEY]`, `> [!RECALL]`, `> [!SUMMARY]`). `build.js` is updated to prefer the enriched file when it exists and to pre-process callout blocks into styled HTML `<div>` components before passing the rest to `marked`.

**Tech Stack:** Node.js 22 ESM, `@anthropic-ai/sdk`, `gray-matter`, `marked`, node:test

---

## File Map

| File | Change |
|---|---|
| `package.json` | Add `@anthropic-ai/sdk` dependency + `enrich` script |
| `build.js` | Export `parseCallouts()`, update `parseContent()` to prefer enriched file, add callout CSS to `renderSubjectPage()` |
| `enrich.js` | New — AI enrichment script |
| `test.js` | Add 4 new tests: callout parsing (×2), enriched file preference, enrich.js importable |
| `CLAUDE.md` | Full rewrite to document new workflow |
| `docs/guides/adding-a-subject.md` | Add enrich step (Step 4) and shift subsequent steps |
| `docs/guides/content-model.md` | Add callout syntax section |

---

## Task 1: Install Anthropic SDK and register the enrich script

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the Anthropic SDK**

```bash
npm install @anthropic-ai/sdk
```

Expected output: added `@anthropic-ai/sdk` to `node_modules/` and `package-lock.json`.

- [ ] **Step 2: Add the enrich script to package.json**

Replace the `"scripts"` block in `package.json`:

```json
{
  "name": "fgv-summary-platform",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "node build.js",
    "test": "node --test test.js",
    "enrich": "node enrich.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0",
    "gray-matter": "^4.0.3",
    "marked": "^12.0.0"
  }
}
```

- [ ] **Step 3: Verify install**

```bash
node -e "import('@anthropic-ai/sdk').then(m => console.log('ok', typeof m.default))"
```

Expected: `ok function`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @anthropic-ai/sdk dependency"
```

---

## Task 2: Write failing tests for callout parsing and enriched file preference

**Files:**
- Modify: `test.js`

- [ ] **Step 1: Add 4 new tests at the bottom of test.js**

Append these tests after the existing `buildSite` test:

```js
// ── Callout parsing ───────────────────────────────────────────────────────────
test('parseCallouts converts [!EXAM] block to callout HTML', async () => {
  const { parseCallouts } = await import('./build.js')
  const input = '> [!EXAM]\n> BSC cai em todas as provas.\n'
  const output = parseCallouts(input)
  assert.ok(output.includes('class="callout callout-exam"'), 'must have callout-exam class')
  assert.ok(output.includes('Cai na Prova'), 'must include exam label text')
  assert.ok(output.includes('BSC cai em todas as provas'), 'must preserve body text')
})

test('parseCallouts handles all four callout types', async () => {
  const { parseCallouts } = await import('./build.js')
  const types = ['EXAM', 'KEY', 'RECALL', 'SUMMARY']
  for (const type of types) {
    const input = `> [!${type}]\n> Body text for ${type}.\n`
    const output = parseCallouts(input)
    assert.ok(
      output.includes(`callout-${type.toLowerCase()}`),
      `must produce callout-${type.toLowerCase()} class for [!${type}]`
    )
  }
})

test('parseContent prefers enriched file over raw when enriched file exists', async () => {
  const { parseContent } = await import('./build.js')
  const { mkdirSync, writeFileSync, unlinkSync } = await import('node:fs')

  const enrichedDir = join(__dirname, 'content', 'enriched')
  const enrichedPath = join(enrichedDir, 'estrategia-corporativa.md')
  mkdirSync(enrichedDir, { recursive: true })
  writeFileSync(enrichedPath, `---
title: Estratégia Corporativa e de Negócios
slug: estrategia-corporativa
description: Metodologia de planejamento estratégico.
status: complete
color: purple
---

> [!EXAM]
> Enriched content marker — this line only exists in the enriched file.
`, 'utf-8')

  try {
    const result = parseContent(join(CONTENT_DIR, 'estrategia-corporativa.md'))
    assert.ok(
      result.html.includes('callout-exam'),
      'parseContent must use the enriched file (which has [!EXAM] callout)'
    )
  } finally {
    unlinkSync(enrichedPath)
  }
})

test('enrich.js exports enrichSubject as a function without side effects on import', async () => {
  const mod = await import('./enrich.js')
  assert.equal(typeof mod.enrichSubject, 'function', 'must export enrichSubject function')
})
```

- [ ] **Step 2: Run tests — verify exactly 4 new failures**

```bash
npm test
```

Expected: 5 original tests pass, 4 new tests fail with messages like:
- `SyntaxError` or `does not provide an export named 'parseCallouts'`
- `parseCallouts is not a function`
- `callout-exam` not found
- `enrichSubject is not a function`

---

## Task 3: Implement parseCallouts and update parseContent in build.js

**Files:**
- Modify: `build.js`

- [ ] **Step 1: Update the import line at the top of build.js**

Replace:
```js
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
```

With:
```js
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
```

- [ ] **Step 2: Add the parseCallouts function after the STATUS_LABEL constant**

Insert this block after the `STATUS_LABEL` object (around line 23), before the `sharedCSS` function:

```js
const CALLOUT_LABELS = {
  EXAM:    '⚠ Cai na Prova',
  KEY:     '◆ Conceito-Chave',
  RECALL:  '? Recall Ativo',
  SUMMARY: '◎ Resumo',
}

export function parseCallouts(markdown) {
  return markdown.replace(
    /^> \[!(EXAM|KEY|RECALL|SUMMARY)\]\n((?:^> ?.*\n?)*)/gm,
    (_, type, body) => {
      const text = body.replace(/^> ?/gm, '').trim()
      const renderedBody = marked.parse(text)
      return `\n<div class="callout callout-${type.toLowerCase()}"><div class="callout-label">${CALLOUT_LABELS[type]}</div><div class="callout-body">${renderedBody}</div></div>\n\n`
    }
  )
}
```

- [ ] **Step 3: Update parseContent to prefer enriched files and run parseCallouts**

Replace the existing `parseContent` function (lines 151–162):

```js
export function parseContent(filePath) {
  const enrichedPath = join(CONTENT_DIR, 'enriched', basename(filePath))
  const effectivePath = existsSync(enrichedPath) ? enrichedPath : filePath
  const raw = readFileSync(effectivePath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    title: data.title,
    slug: data.slug,
    description: data.description,
    status: data.status,
    color: data.color,
    html: marked.parse(parseCallouts(content)),
  }
}
```

- [ ] **Step 4: Run the callout and enriched-file tests — verify they now pass**

```bash
npm test
```

Expected: 3 of the 4 new tests now pass (`parseCallouts [!EXAM]`, `parseCallouts all types`, `parseContent prefers enriched`). The 4th test (`enrich.js exports enrichSubject`) still fails because `enrich.js` doesn't exist yet.

- [ ] **Step 5: Commit**

```bash
git add build.js
git commit -m "feat: add callout parser and enriched-file fallback to build"
```

---

## Task 4: Add callout component CSS to renderSubjectPage

**Files:**
- Modify: `build.js`

- [ ] **Step 1: Add callout styles inside the renderSubjectPage style block**

In `renderSubjectPage`, locate the `<style>` block that contains `.content hr { ... }`. Add the following CSS immediately after that rule (before the `@media` block):

```css
    .callout { border-radius: 8px; padding: 16px 20px; margin: 24px 0; }
    .callout-label { font-family: var(--font-mono); font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; }
    .callout-body { line-height: 1.75; }
    .callout-body p { margin-bottom: 8px; }
    .callout-body p:last-child { margin-bottom: 0; }
    .callout-exam { background: #FEF9EC; border-left: 3px solid #D97706; }
    .callout-exam .callout-label { color: #92400E; }
    .callout-key { background: #EEEDFE; border-left: 3px solid #534AB7; }
    .callout-key .callout-label { color: #3730A3; }
    .callout-recall { background: #E6F4F1; border-left: 3px solid #0F6E56; }
    .callout-recall .callout-label { color: #065F46; }
    .callout-summary { background: var(--bg-surface); border: 1px solid var(--border); border-left: 3px solid var(--text-secondary); }
    .callout-summary .callout-label { color: var(--text-secondary); }
```

- [ ] **Step 2: Run all tests to confirm nothing regressed**

```bash
npm test
```

Expected: 8 tests pass (5 original + 3 new callout/enriched tests). The `enrich.js` test still fails.

- [ ] **Step 3: Commit**

```bash
git add build.js
git commit -m "feat: add callout component CSS to subject page"
```

---

## Task 5: Write enrich.js

**Files:**
- Create: `enrich.js`

- [ ] **Step 1: Create enrich.js**

```js
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = join(__dirname, 'content')
const ENRICHED_DIR = join(__dirname, 'content', 'enriched')

const SYSTEM_PROMPT = `Você é um designer instrucional especializado em conteúdo de MBA brasileiro. Sua tarefa é transformar anotações brutas de aula em um documento de aprendizagem de alta qualidade.

Você receberá anotações brutas de estudo. Transforme-as em um documento estruturado seguindo estas regras:

1. RESUMO: Adicione um callout \`> [!SUMMARY]\` no início do corpo (antes de qualquer heading). Escreva 2-3 frases em português capturando o essencial da disciplina — o que o aluno precisa dominar.

2. REESTRUTURE: Organize o conteúdo em seções claras com headings H2/H3 descritivos. Melhore o fluxo e a clareza sem perder nenhuma informação.

3. ALERTAS DE PROVA: Identifique qualquer conteúdo que o aluno marcou como importante para provas (frases como "cai em todas", "sempre cai", "destaque", palavras em MAIÚSCULAS de ênfase). Envolva esse conteúdo em callouts \`> [!EXAM]\` próximos a onde aparece no texto.

4. CONCEITOS-CHAVE: Para cada framework, modelo ou conceito importante (ex: SWOT, BSC, Forças de Porter, OKR), crie um callout \`> [!KEY]\` com uma definição limpa de 1 parágrafo em português. Coloque-o onde o conceito aparece pela primeira vez.

5. PERGUNTAS DE RECALL: Ao final do documento, adicione uma seção \`## Perguntas de Recall\` com 4 a 6 callouts \`> [!RECALL]\`. Cada um deve ser uma pergunta que testa a compreensão de um conceito-chave das notas. Escreva as perguntas em português.

6. PRESERVE: Não invente informações. Não descarte informações. Todo fato das notas brutas deve aparecer no output.

7. IDIOMA: Escreva inteiramente em português. Mesmo registro das notas originais.

8. OUTPUT: Retorne apenas o corpo do markdown enriquecido — sem frontmatter, sem cercas de código, sem preâmbulo ou explicação. Apenas o conteúdo.

Sintaxe dos callouts (exatamente assim):
> [!SUMMARY]
> texto aqui

> [!EXAM]
> texto aqui

> [!KEY]
> texto aqui

> [!RECALL]
> texto aqui`

export async function enrichSubject(slug) {
  const rawPath = join(CONTENT_DIR, `${slug}.md`)
  if (!existsSync(rawPath)) {
    throw new Error(`Content file not found: ${rawPath}`)
  }

  const raw = readFileSync(rawPath, 'utf-8')
  const { data, content } = matter(raw)

  const client = new Anthropic()
  console.log(`Enriching "${slug}" with Claude Opus 4.7...`)

  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: content.trim() }],
  })

  const enrichedBody = response.content[0].text
  const enrichedFile = matter.stringify(enrichedBody, data)

  mkdirSync(ENRICHED_DIR, { recursive: true })
  writeFileSync(join(ENRICHED_DIR, `${slug}.md`), enrichedFile, 'utf-8')

  console.log(`✓ Enriched ${slug} (${response.usage.input_tokens} in / ${response.usage.output_tokens} out)`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)

  if (!args[0]) {
    console.error('Usage: npm run enrich -- <slug>')
    console.error('       npm run enrich -- --all')
    process.exit(1)
  }

  if (args[0] === '--all') {
    const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'))
    for (const file of files) {
      const slug = file.replace('.md', '')
      const enrichedPath = join(ENRICHED_DIR, file)
      if (!existsSync(enrichedPath)) {
        await enrichSubject(slug)
      } else {
        console.log(`↩ Skipping ${slug} (enriched file already exists)`)
      }
    }
  } else {
    await enrichSubject(args[0])
  }
}
```

- [ ] **Step 2: Run all 9 tests — all must pass**

```bash
npm test
```

Expected: all 9 tests pass. The `enrich.js exports enrichSubject` test now passes because `enrich.js` exists and exports `enrichSubject`.

- [ ] **Step 3: Commit**

```bash
git add enrich.js
git commit -m "feat: add AI enrichment script (Claude Opus 4.7)"
```

---

## Task 6: Smoke test — enrich estrategia-corporativa and verify output

**Files:**
- Creates: `content/enriched/estrategia-corporativa.md`

- [ ] **Step 1: Set ANTHROPIC_API_KEY if not already set**

```bash
echo $ANTHROPIC_API_KEY
```

If empty, set it:
```bash
export ANTHROPIC_API_KEY=your_key_here
```

- [ ] **Step 2: Run enrichment**

```bash
npm run enrich -- estrategia-corporativa
```

Expected output:
```
Enriching "estrategia-corporativa" with Claude Opus 4.7...
✓ Enriched estrategia-corporativa (NNN in / NNN out)
```

- [ ] **Step 3: Inspect the enriched file**

```bash
head -60 content/enriched/estrategia-corporativa.md
```

Verify:
- Starts with frontmatter identical to `content/estrategia-corporativa.md`
- Body contains `> [!SUMMARY]` near the top
- Body contains at least one `> [!EXAM]` block
- Body contains at least one `> [!KEY]` block
- Body ends with a `## Perguntas de Recall` section with `> [!RECALL]` blocks

- [ ] **Step 4: Build and open locally**

```bash
npm run build && open docs/estrategia-corporativa/index.html
```

Verify in browser:
- Summary callout appears at the top with `◎ Resumo` label (surface background, dark left border)
- At least one amber `⚠ Cai na Prova` callout visible
- At least one purple `◆ Conceito-Chave` callout visible
- At least one teal `? Recall Ativo` callout at the bottom
- Back link works
- No horizontal scroll on mobile (DevTools → 390px wide)

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: all 9 tests pass.

- [ ] **Step 6: Commit**

```bash
git add content/enriched/estrategia-corporativa.md docs/
git commit -m "feat: add enriched learning content for Estratégia Corporativa"
```

---

## Task 7: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Rewrite CLAUDE.md with the updated workflow**

Replace the entire content of `CLAUDE.md` with:

```markdown
# FGV MBA Summary Platform — Claude Instructions

## What This Project Is

A personal learning platform for André's FGV MBA in Management (Gestão Empresarial). Notes are written in Obsidian and compiled into a static HTML site served on GitHub Pages. One new subject is added approximately every month.

**Live site:** `https://acantidio.github.io/fgv-summary-platform/`
**GitHub repo:** `https://github.com/acantidio/fgv-summary-platform`
**Obsidian vault:** `/Users/andrecantidio/Documents/Obsidian/main/MBA GE80/`

---

## The Primary Recurring Task: Adding a New Subject

This will happen every month. When André says something like "I finished class X, add it to the platform", follow this exact flow:

### 1. Find the Obsidian note

```bash
ls "/Users/andrecantidio/Documents/Obsidian/main/MBA GE80/"
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
| Color | Subject |
|---|---|
| purple | Estratégia Corporativa |
| teal | Gestão de Serviços |
| blue | Transformação Digital |
| amber | Análise de Demonstrativos Contábeis |
| rose | (available) |

Rotate through colors; each new subject gets the next available or least-used color.

### 3. Handle Obsidian-specific syntax

Obsidian notes may contain:
- `[[wikilinks]]` — strip the brackets, leave the text: `[[Estratégia]]` → `Estratégia`
- `![[embedded files]]` — remove entirely
- `---` horizontal rules — render fine, keep them
- Tab-indented nested lists — `marked` handles these correctly, no changes needed

### 4. Enrich with AI

Run the enrichment step to transform the raw notes into a structured learning document:

```bash
npm run enrich -- [slug]
```

This calls **Claude Opus 4.7** and writes the enriched content to `content/enriched/[slug].md`. The enriched file contains:
- `> [!SUMMARY]` — a 2–3 sentence cheat-sheet at the top
- `> [!EXAM]` — callouts for exam-critical content
- `> [!KEY]` — callouts for key concepts and frameworks with clean definitions
- `> [!RECALL]` — self-test questions at the end

Requires `ANTHROPIC_API_KEY` set in the environment. Runs once per subject — re-run only if the raw notes change significantly.

### 5. Run tests and build

```bash
npm test          # Must pass before committing
npm run build     # Generates docs/ output
```

If the frontmatter test fails, check that `status` and `color` are valid values (see above).

### 6. Open locally to verify

```bash
open docs/index.html
```

Verify the new card appears on the hub with correct title, color badge, and description. Click through to the subject page and check:
- Summary callout (◎ Resumo) appears at the top
- Exam alerts (⚠ Cai na Prova) highlight the right content
- Key concept cards (◆ Conceito-Chave) are present
- Recall questions (? Recall Ativo) appear at the bottom

### 7. Commit and push

```bash
git add content/[slug].md content/enriched/[slug].md docs/
git commit -m "feat: add [Subject Name]"
git push
```

GitHub Actions will run tests, rebuild, and re-deploy automatically. The live site updates within ~2 minutes.

---

## Commands

| Command | Purpose |
|---|---|
| `npm test` | Run all tests |
| `npm run build` | Generate `docs/` from `content/` (uses enriched files when available) |
| `npm run enrich -- [slug]` | AI-enrich one subject (run once per subject) |
| `npm run enrich -- --all` | AI-enrich all subjects that don't yet have an enriched file |
| `node build.js` | Same as npm run build |
| `open docs/index.html` | Preview locally |

---

## Architecture at a Glance

```
content/[slug].md                        ← Raw Obsidian note + frontmatter (source of truth, never modified)
content/enriched/[slug].md               ← AI-enriched learning content (generated by enrich.js)
complementary-study-docs/[slug]/         ← PDFs, slides, books per subject (dump files here)
enrich.js                                ← AI enrichment: reads content/ → writes content/enriched/
build.js                                 ← Build pipeline: reads enriched/ (fallback: content/) → writes docs/
test.js                                  ← Tests covering content, callout parsing, build, and enrich import
docs/index.html                          ← Generated hub page (never edit directly)
docs/[slug]/index.html                   ← Generated subject pages (never edit directly)
.github/workflows/deploy.yml             ← CI: runs on push to main (test + build only, not enrich)
```

`build.js` exports: `parseContent()`, `parseCallouts()`, `renderSubjectPage()`, `renderHubPage()`, `buildSite()`.
All rendering is pure HTML + CSS — zero JavaScript on the output pages.

### Enrichment model

Always use **Claude Opus 4.7** (`claude-opus-4-7`) for enrichment. This is a one-time-per-subject operation where quality matters more than speed or cost.

---

## Callout Syntax Reference

The enriched files use these four callout types. `build.js` converts them to styled HTML components.

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

A future automated engine will process these files and enrich the subject pages. See [`docs/guides/complementary-materials-engine.md`](docs/guides/complementary-materials-engine.md) for the full roadmap. To trigger that work: start a session and say **"Let's build the complementary materials engine."**

---

## Detailed Guides

- [Adding a Subject (full guide)](docs/guides/adding-a-subject.md) — complete walkthrough with edge cases
- [Content Model Reference](docs/guides/content-model.md) — all frontmatter fields, valid values, and callout syntax
- [Design System](docs/guides/design-system.md) — colors, fonts, CSS variables, breakpoints
- [Complementary Materials Engine](docs/guides/complementary-materials-engine.md) — planned pipeline for processing PDFs, slides, and books

---

## What NOT to Do

- Never edit `docs/*.html` directly — they are always regenerated by `build.js`
- Never edit `content/enriched/*.md` directly — they are always regenerated by `enrich.js`
- Never commit with failing tests
- Never edit `build.js` templates unless the design needs to change globally
- Do not add JavaScript to the output pages — the design is intentionally JS-free
- Never use a model weaker than Claude Opus 4.7 for enrichment — learning quality depends on it
```

- [ ] **Step 2: Verify the file was written correctly**

```bash
head -10 CLAUDE.md
```

Expected: starts with `# FGV MBA Summary Platform — Claude Instructions`

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with enrichment workflow"
```

---

## Task 8: Update docs/guides/adding-a-subject.md

**Files:**
- Modify: `docs/guides/adding-a-subject.md`

- [ ] **Step 1: Insert the enrich step (new Step 4) and renumber subsequent steps**

Replace the entire content of `docs/guides/adding-a-subject.md`:

```markdown
# Adding a New Subject — Complete Guide

This is the step-by-step for adding a new FGV MBA subject to the platform. Follows the same process every time.

---

## Step 1: Find the Obsidian Note

```bash
ls "/Users/andrecantidio/Documents/Obsidian/main/MBA GE80/"
```

Read the relevant file:

```bash
cat "/Users/andrecantidio/Documents/Obsidian/main/MBA GE80/[Subject Name].md"
```

Obsidian notes have no frontmatter — the content starts directly with Markdown.

---

## Step 2: Choose a Slug and Color

**Slug rules:**
- Lowercase, hyphens only, no accents or special characters
- Must be unique across all files in `content/`
- Will become the URL path: `https://acantidio.github.io/fgv-summary-platform/[slug]/`

Examples:
| Subject | Slug |
|---|---|
| Finanças Corporativas | `financas-corporativas` |
| Gestão de Projetos | `gestao-de-projetos` |
| Liderança e Comportamento Organizacional | `lideranca-e-comportamento` |

**Color selection:**
```bash
grep "^color:" content/*.md
```

Pick the color used least often. Available: `purple`, `amber`, `teal`, `blue`, `rose`.

---

## Step 3: Create the Content File

Create `content/[slug].md`:

```markdown
---
title: Full Subject Name in Portuguese
slug: the-slug-you-chose
description: One concise sentence describing what this subject covers.
status: complete
color: rose
---

[paste Obsidian content here]
```

### Cleaning up Obsidian syntax

| Obsidian syntax | Action |
|---|---|
| `[[Page Name]]` | Replace with `Page Name` (remove brackets) |
| `[[Page Name\|Display Text]]` | Replace with `Display Text` |
| `![[filename.png]]` | Remove entirely |
| `#tag` at start of line | Remove the `#` or remove the line |
| `%%comment%%` | Remove entirely |
| Tab-indented lists | Keep as-is — `marked` handles tabs fine |

---

## Step 4: Enrich with AI

Transform the raw notes into a structured learning document using Claude Opus 4.7:

```bash
npm run enrich -- [slug]
```

This reads `content/[slug].md`, calls Claude Opus 4.7, and writes `content/enriched/[slug].md`.

Requires `ANTHROPIC_API_KEY` in the environment:
```bash
export ANTHROPIC_API_KEY=your_key_here
```

Expected output:
```
Enriching "[slug]" with Claude Opus 4.7...
✓ Enriched [slug] (NNN in / NNN out)
```

**The enriched file is what gets built and displayed.** If you significantly update the raw notes later, delete the enriched file and re-run enrich:
```bash
rm content/enriched/[slug].md
npm run enrich -- [slug]
```

---

## Step 5: Validate and Build

```bash
npm test
```

Expected: all tests pass. Then:

```bash
npm run build
```

Expected output: `✓ Built N subjects → docs/`

---

## Step 6: Visual Check

```bash
open docs/index.html
```

Checklist:
- [ ] New card appears on hub with correct title, color, description
- [ ] Click through to subject page — back link works
- [ ] Summary callout (◎ Resumo) appears at the top
- [ ] At least one Exam alert (⚠ Cai na Prova) is visible
- [ ] At least one Key concept (◆ Conceito-Chave) card is visible
- [ ] Recall questions (? Recall Ativo) section at the bottom
- [ ] All content from original notes is present

**Mobile check (browser DevTools, 390px):**
- Single column layout, no horizontal scroll
- Callout cards readable and not clipped

---

## Step 7: Commit and Push

```bash
git add content/[slug].md content/enriched/[slug].md docs/
git commit -m "feat: add [Subject Name]"
git push
```

GitHub Actions runs `npm test` + `npm run build` automatically. Site is live within ~2 minutes.

Check the run:
```bash
gh run list --repo acantidio/fgv-summary-platform
```

---

## Step 8: Create the Complementary Materials Folder

```bash
mkdir complementary-study-docs/[slug]
```

Drop any teacher slides, PDFs, or books there whenever you have them.

---

## Updating Existing Content

When notes for an existing subject grow:

1. Edit `content/[slug].md` with updated Obsidian content
2. Re-enrich: `rm content/enriched/[slug].md && npm run enrich -- [slug]`
3. `npm test && npm run build`
4. `git add content/[slug].md content/enriched/[slug].md docs/ && git commit -m "chore: update [Subject Name]" && git push`
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/adding-a-subject.md
git commit -m "docs: update adding-a-subject guide with enrich step"
```

---

## Task 9: Update docs/guides/content-model.md

**Files:**
- Modify: `docs/guides/content-model.md`

- [ ] **Step 1: Add the callout syntax section to content-model.md**

After the `## Full Example` section at the end of the file, append:

```markdown

---

## Callout Syntax (Enriched Files Only)

Files in `content/enriched/` use four callout types that `build.js` renders as styled HTML components. These are generated by `enrich.js` — do not write them by hand in `content/*.md`.

### Syntax

```markdown
> [!TYPE]
> Body text here. Can span multiple lines as long as each line starts with `> `.
> **Bold** and other inline markdown work inside callout bodies.
```

### Types

| Type | Rendered label | Background | Purpose |
|---|---|---|---|
| `[!SUMMARY]` | ◎ Resumo | Surface/neutral | 2–3 sentence overview placed at the top of the page |
| `[!EXAM]` | ⚠ Cai na Prova | Amber `#FEF9EC` | Exam-critical content flagged by the professor |
| `[!KEY]` | ◆ Conceito-Chave | Purple `#EEEDFE` | Key framework or term with a clean definition |
| `[!RECALL]` | ? Recall Ativo | Teal `#E6F4F1` | Self-test question — answer before reading on |

### Example

```markdown
> [!SUMMARY]
> BSC e OKR caem em todas as provas. O foco é dominar o mapa estratégico e conectar os 4 pilares.

> [!KEY]
> **SWOT** — Análise do ambiente atual: Forças e Fraquezas (interno, controlável) vs. Oportunidades e Ameaças (externo, mercado). Cada item deve ser rastreável com tag (S01, W01, O01, T01).

> [!EXAM]
> BSC é o tema mais cobrado. Saber montar: Mapa (conectar objetivos de baixo pra cima) + Painel (Objetivos, Indicadores, Alvos com valor atual e meta, Iniciativas).

> [!RECALL]
> Quais são os 4 pilares do BSC e como eles se conectam no mapa estratégico?
```
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/content-model.md
git commit -m "docs: add callout syntax reference to content model"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] `enrich.js` with Claude Opus 4.7 → Task 5
- [x] `content/enriched/` directory → created at runtime by enrich.js
- [x] `> [!EXAM]`, `> [!KEY]`, `> [!RECALL]`, `> [!SUMMARY]` callout syntax → Tasks 3, 4
- [x] `build.js` prefers enriched file → Task 3
- [x] `npm run enrich -- [slug]` and `--all` flag → Tasks 1, 5
- [x] Tests for callout parsing, enriched file preference, enrich.js import → Task 2
- [x] CLAUDE.md updated → Task 7
- [x] `docs/guides/adding-a-subject.md` updated → Task 8
- [x] `docs/guides/content-model.md` updated → Task 9
- [x] Smoke test on estrategia-corporativa → Task 6

**Placeholder scan:** No TBDs, no "add appropriate handling", all code blocks are complete.

**Type consistency:** `parseCallouts` exported from `build.js` and imported in `test.js` consistently. `enrichSubject(slug)` takes a string slug throughout. `marked.parse()` used consistently in both `parseCallouts` body rendering and `parseContent`.
