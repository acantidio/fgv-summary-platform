# AI HTML Renderer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `build.js` with `render.js` — a Claude Opus-powered renderer that converts enriched markdown into rich, subject-specific HTML pages with adaptive visual components.

**Architecture:** `render.js` exports `renderSubject(slug, client?)`, `buildHub()`, and `renderSite(client?)`. `renderSubject` reads `content/enriched/[slug].md`, calls Opus with a detailed design-system prompt, and writes the response directly to `docs/[slug]/index.html`. `buildHub` is a synchronous, AI-free function that regenerates `docs/index.html` from content frontmatter. The optional `client` parameter on AI functions enables test mocking without module patching.

**Tech Stack:** Node.js ESM, `@anthropic-ai/sdk`, `gray-matter`, `node:test` (built-in), `node:assert/strict` (built-in)

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `render.js` | Hub builder, subject renderer, SYSTEM_PROMPT, CLI |
| Modify | `test.js` | Remove build.js tests; add render.js tests with mocks |
| Modify | `package.json` | Remove `"build"`, add `"render"` |
| Modify | `.github/workflows/deploy.yml` | Remove build + commit steps |
| Modify | `CLAUDE.md` | Update commands table |
| Delete | `build.js` | No longer needed |

---

## Task 1: Create render.js with buildHub()

**Files:**
- Create: `render.js`
- Modify: `test.js`

- [ ] **Step 1: Add the buildHub test to test.js**

Open `test.js`. After the last existing test block, add:

```javascript
// ── render.js: buildHub ───────────────────────────────────────────────────────
test('buildHub generates docs/index.html with sorted card links', async () => {
  const { buildHub } = await import('./render.js')
  buildHub()

  assert.ok(existsSync(join(DOCS_DIR, 'index.html')), 'docs/index.html must exist')
  const hub = readFileSync(join(DOCS_DIR, 'index.html'), 'utf-8')
  assert.ok(hub.startsWith('<!DOCTYPE html>'), 'must start with DOCTYPE')
  assert.ok(hub.includes('lang="pt-BR"'), 'must declare pt-BR language')
  assert.ok(hub.includes('href="./estrategia-corporativa/"'), 'must link to estrategia-corporativa')
  assert.ok(hub.includes('href="./gestao-de-servicos/"'), 'must link to gestao-de-servicos')
  assert.ok(hub.includes('href="./transformacao-digital/"'), 'must link to transformacao-digital')
  assert.ok(hub.includes('href="./analise-demonstrativos/"'), 'must link to analise-demonstrativos')
  assert.ok(!hub.includes('<script'), 'must contain no script tags')
  const alphaIdx = hub.indexOf('Análise')
  const estratIdx = hub.indexOf('Estratégia')
  assert.ok(alphaIdx < estratIdx, 'cards must be sorted alphabetically by title')
})
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
cd /Users/andrecantidio/Documents/Projetos/personal/fgv-summary-platform && node --test test.js 2>&1 | grep -A 3 "buildHub"
```

Expected: `Error: Cannot find module './render.js'` or similar failure.

- [ ] **Step 3: Create render.js**

Create `/Users/andrecantidio/Documents/Projetos/personal/fgv-summary-platform/render.js` with:

```javascript
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

try {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), '.env')
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
      const [key, ...rest] = line.split('=')
      if (key && rest.length && !process.env[key.trim()]) {
        process.env[key.trim()] = rest.join('=').trim()
      }
    }
  }
} catch { /* ignore */ }

const __dirname = dirname(fileURLToPath(import.meta.url))
export const CONTENT_DIR = join(__dirname, 'content')
export const DOCS_DIR = join(__dirname, 'docs')

const ACCENT = {
  purple: { light: '#EEEDFE', main: '#534AB7' },
  amber:  { light: '#FAEEDA', main: '#854F0B' },
  teal:   { light: '#E6F4F1', main: '#0F6E56' },
  blue:   { light: '#E6F1FB', main: '#185FA5' },
  rose:   { light: '#FDE8EC', main: '#C81E3A' },
}

const STATUS_LABEL = {
  complete: 'Concluído',
  'in-progress': 'Em andamento',
  pending: 'Pendente',
}

const SYSTEM_PROMPT = `placeholder — implemented in Task 2`

export function buildHub() {
  const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'))
  const subjects = files
    .map(f => matter(readFileSync(join(CONTENT_DIR, f), 'utf-8')).data)
    .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))

  const cards = subjects.map(s => {
    const accent = ACCENT[s.color] ?? ACCENT.purple
    const statusLabel = STATUS_LABEL[s.status] ?? s.status
    return `      <a href="./${s.slug}/" class="card" style="border-top-color:${accent.main}">
        <span class="badge" style="background:${accent.light};color:${accent.main}">${statusLabel}</span>
        <h2>${s.title}</h2>
        <p>${s.description}</p>
      </a>`
  }).join('\n')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FGV MBA — Resumo de Conteúdos</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
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
    body { font-family: var(--font-body); background: var(--bg); color: var(--text-primary); -webkit-font-smoothing: antialiased; line-height: 1.6; font-size: 16px; }
    a { color: inherit; text-decoration: none; }
    .container { max-width: 800px; margin: 0 auto; padding: 48px 24px 80px; }
    .badge { font-family: var(--font-mono); font-size: 10px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; display: inline-block; }
    .hub-header { padding: 56px 0 44px; }
    .label { font-family: var(--font-mono); font-size: 11px; font-weight: 500; color: var(--text-tertiary); letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 12px; }
    h1 { font-family: var(--font-display); font-size: clamp(28px, 5vw, 42px); font-weight: 400; line-height: 1.2; margin-bottom: 12px; }
    .subtitle { font-size: 16px; color: var(--text-secondary); line-height: 1.7; max-width: 520px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .card { background: var(--bg-card); border: 1px solid var(--border-light); border-top: 4px solid transparent; border-radius: var(--radius); padding: 24px 28px 28px; display: block; transition: box-shadow 0.2s, transform 0.2s; }
    .card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.07); transform: translateY(-2px); border-color: var(--border); }
    .card h2 { font-family: var(--font-display); font-size: 20px; font-weight: 400; margin: 10px 0 8px; line-height: 1.3; }
    .card p { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } .hub-header { padding: 40px 0 32px; } .card { padding: 20px; } }
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

  mkdirSync(DOCS_DIR, { recursive: true })
  writeFileSync(join(DOCS_DIR, 'index.html'), html, 'utf-8')
}

export async function renderSubject(slug, client = null) {
  throw new Error('Not implemented yet — complete Task 2')
}

export async function renderSite(client = null) {
  throw new Error('Not implemented yet — complete Task 3')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('render.js CLI not yet implemented — complete Task 3')
}
```

- [ ] **Step 4: Run the test to confirm buildHub passes**

```bash
node --test test.js 2>&1 | grep -E "(buildHub|✓|✗|pass|fail)" | head -20
```

Expected: `✓ buildHub generates docs/index.html with sorted card links`

- [ ] **Step 5: Commit**

```bash
git add render.js test.js
git commit -m "feat: add render.js scaffold with buildHub()"
```

---

## Task 2: Implement SYSTEM_PROMPT and renderSubject()

**Files:**
- Modify: `render.js`
- Modify: `test.js`

- [ ] **Step 1: Add the renderSubject test to test.js**

After the buildHub test block, add:

```javascript
// ── render.js: renderSubject ──────────────────────────────────────────────────
test('renderSubject writes Anthropic response HTML to docs/[slug]/index.html', async () => {
  const { renderSubject } = await import('./render.js')

  const mockHtml = '<!DOCTYPE html><html lang="pt-BR"><head><title>Test — FGV MBA</title></head><body><p>mock content</p></body></html>'
  const mockClient = {
    messages: {
      create: async () => ({ content: [{ type: 'text', text: mockHtml }] })
    }
  }

  await renderSubject('estrategia-corporativa', mockClient)

  const outputPath = join(DOCS_DIR, 'estrategia-corporativa', 'index.html')
  assert.ok(existsSync(outputPath), 'docs/estrategia-corporativa/index.html must be created')
  const written = readFileSync(outputPath, 'utf-8')
  assert.equal(written, mockHtml, 'file contents must exactly match the Anthropic response text')
})

test('renderSubject throws a clear error when enriched file is missing', async () => {
  const { renderSubject } = await import('./render.js')
  const mockClient = { messages: { create: async () => ({}) } }

  await assert.rejects(
    () => renderSubject('__nonexistent_slug__', mockClient),
    /npm run enrich/,
    'error message must mention how to fix the problem'
  )
})
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
node --test test.js 2>&1 | grep -E "(renderSubject|Not implemented)" | head -10
```

Expected: both renderSubject tests fail with `Error: Not implemented yet`.

- [ ] **Step 3: Replace the SYSTEM_PROMPT placeholder and implement renderSubject() in render.js**

Replace the `const SYSTEM_PROMPT = ...` line and the `renderSubject` stub with:

```javascript
const SYSTEM_PROMPT = `You are a world-class educational interface designer and front-end engineer. Your single task is to transform enriched MBA learning content into a beautiful, subject-specific HTML page that makes the knowledge easier to absorb.

You will receive the subject metadata and enriched markdown body. Return ONLY a complete <!DOCTYPE html> document — no explanation, no markdown fences, no preamble.

## Design Language

Use ONLY these exact values — never invent new colors or fonts.

Fonts (load from Google Fonts):
  Display headings: 'DM Serif Display', Georgia, serif
  Body text: 'DM Sans', -apple-system, sans-serif
  Labels/badges: 'JetBrains Mono', monospace

CSS variables to define in :root:
  --bg: #FAF9F6; --bg-card: #FFFFFF; --bg-surface: #F3F1EC; --bg-accent: #E8E4DB;
  --text-primary: #1A1A18; --text-secondary: #5C5B56; --text-tertiary: #8A8985;
  --border: #DDD9D0; --border-light: #ECEAE4;
  --purple-50: #EEEDFE; --purple-400: #7F77DD; --purple-600: #534AB7; --purple-800: #3C3489;
  --amber-50: #FAEEDA; --amber-400: #BA7517; --amber-600: #854F0B; --amber-800: #633806;
  --teal-50: #E6F4F1; --teal-400: #1D9E75; --teal-600: #0F6E56; --teal-800: #085041;
  --blue-50: #E6F1FB; --blue-400: #378ADD; --blue-600: #185FA5; --blue-800: #0C447C;
  --rose-50: #FDE8EC; --rose-600: #C81E3A;

Accent color from the subject's color field:
  purple → main: #534AB7, light: #EEEDFE
  amber  → main: #854F0B, light: #FAEEDA
  teal   → main: #0F6E56, light: #E6F4F1
  blue   → main: #185FA5, light: #E6F1FB
  rose   → main: #C81E3A, light: #FDE8EC

## Adaptive Component Rules

The visual form MUST match the cognitive structure of the content.
A bullet list is a LAST RESORT — never the default for structured content.

When you encounter:                        Render it as:
──────────────────────────────────────────────────────────────────────────────
2×2 analysis (SWOT, quadrants)         CSS grid 2×2 — distinct background color per cell
Framework with named pillars           Card grid — one card per named element with
  (BSC perspectives, Diamond)            title + description
Sequence of steps or phases            Numbered stepper — circle number + title +
                                         description connected vertically
Forces/actors around a center          Hub layout — center box surrounded by force boxes
  (Porter's 5 Forces)
Objectives + indicators + targets      <table> with styled column headers
  (BSC Painel)
[!SUMMARY] callout                     Full-width hero block at page top — larger font,
                                         more padding, accent-colored top border
[!EXAM] callout                        Amber alert banner with ⚠ prefix, prominent
                                         amber background, visually stands out
[!KEY] callout                         Purple definition card — bold term + explanation
                                         paragraph, purple left accent
[!RECALL] callout                      Teal question card with ? prefix — grouped at end
Comparison of options                  Side-by-side or grid comparison layout
Timeline / chronological list          Horizontal or vertical timeline component

## Required Page Structure

Every page MUST include ALL of the following:
1. Google Fonts <link> for DM Serif Display, DM Sans, JetBrains Mono
2. All CSS in a single <style> block — no external stylesheets
3. Back link "← FGV MBA" pointing to "../" — JetBrains Mono, text-tertiary color
4. Page header: subject title in DM Serif Display + status badge in accent colors
5. Sticky top navigation bar with anchor links to each major H2 section
6. Content sections — each H2 is a <section> with an id for the nav anchor
7. Responsive layout — single column at 640px and below
8. <title> tag formatted as: "{title} — FGV MBA"

## Hard Rules

- Output ONLY the complete <!DOCTYPE html> document — no markdown, no code fences, no commentary before or after
- Zero <script> tags — fully static, no JavaScript whatsoever
- All text in Portuguese
- Every fact from the input MUST appear in the output — no omissions, no truncation
- Never invent content, examples, or context not present in the input
- Never use hex colors outside the token system defined above
- Never use bullet lists where a structured visual component fits the content`

export async function renderSubject(slug, client = null) {
  const enrichedPath = join(CONTENT_DIR, 'enriched', `${slug}.md`)
  if (!existsSync(enrichedPath)) {
    throw new Error(`No enriched file found for "${slug}". Run: npm run enrich -- ${slug}`)
  }

  const raw = readFileSync(enrichedPath, 'utf-8')
  const { data, content } = matter(raw)
  const statusLabel = STATUS_LABEL[data.status] ?? data.status

  const userMessage = `Subject: ${data.title}
Color: ${data.color}
Status: ${statusLabel}
Description: ${data.description}

---

${content.trim()}`

  if (!client) client = new Anthropic()
  console.log(`Rendering "${slug}" with Claude Opus...`)

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const html = response.content[0].text
  const dir = join(DOCS_DIR, slug)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), html, 'utf-8')
  buildHub()
  console.log(`✓ Rendered "${slug}" → docs/${slug}/index.html`)
}
```

- [ ] **Step 4: Run the tests to confirm both renderSubject tests pass**

```bash
node --test test.js 2>&1 | grep -E "(renderSubject|✓|✗)" | head -10
```

Expected: both `renderSubject` tests show `✓`.

- [ ] **Step 5: Commit**

```bash
git add render.js test.js
git commit -m "feat: implement renderSubject() with SYSTEM_PROMPT"
```

---

## Task 3: Implement renderSite() and CLI

**Files:**
- Modify: `render.js`
- Modify: `test.js`

- [ ] **Step 1: Add the renderSite test to test.js**

After the renderSubject test block, add:

```javascript
// ── render.js: renderSite ─────────────────────────────────────────────────────
test('renderSite renders all enriched slugs and rebuilds hub', async () => {
  const { renderSite } = await import('./render.js')

  const renderedSlugs = []
  const mockClient = {
    messages: {
      create: async (params) => {
        const slugLine = params.messages[0].content.match(/Subject: (.+)/)
        if (slugLine) renderedSlugs.push(slugLine[1])
        return {
          content: [{
            type: 'text',
            text: '<!DOCTYPE html><html lang="pt-BR"><head><title>T — FGV MBA</title></head><body><p>mock</p></body></html>'
          }]
        }
      }
    }
  }

  await renderSite(mockClient)

  const enrichedDir = join(CONTENT_DIR, 'enriched')
  const enrichedSlugs = readdirSync(enrichedDir).filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''))

  for (const slug of enrichedSlugs) {
    assert.ok(
      existsSync(join(DOCS_DIR, slug, 'index.html')),
      `docs/${slug}/index.html must exist after renderSite`
    )
  }
  assert.ok(existsSync(join(DOCS_DIR, 'index.html')), 'hub must exist after renderSite')
  assert.ok(renderedSlugs.length >= enrichedSlugs.length, 'Anthropic must be called once per enriched slug')
})
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
node --test test.js 2>&1 | grep -E "(renderSite|Not implemented)" | head -5
```

Expected: `Error: Not implemented yet` for renderSite.

- [ ] **Step 3: Replace the renderSite stub and CLI block in render.js**

Replace the `renderSite` stub and the `if (process.argv[1] ...)` block with:

```javascript
export async function renderSite(client = null) {
  const enrichedDir = join(CONTENT_DIR, 'enriched')
  if (!existsSync(enrichedDir)) {
    console.log('No enriched files found. Run: npm run enrich -- --all')
    return
  }
  const slugs = readdirSync(enrichedDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''))

  for (const slug of slugs) {
    await renderSubject(slug, client)
  }
  console.log(`✓ Done — rendered ${slugs.length} subjects`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  if (args[0] === '--all') {
    renderSite().catch(err => { console.error(err.message); process.exit(1) })
  } else if (args[0]) {
    renderSubject(args[0])
      .then(() => buildHub())
      .catch(err => { console.error(err.message); process.exit(1) })
  } else {
    console.error('Usage: node render.js [slug] | --all')
    process.exit(1)
  }
}
```

- [ ] **Step 4: Run all tests to confirm everything passes**

```bash
node --test test.js 2>&1 | tail -20
```

Expected: all tests pass, no failures.

- [ ] **Step 5: Commit**

```bash
git add render.js test.js
git commit -m "feat: implement renderSite() and CLI"
```

---

## Task 4: Migrate test.js — remove build.js tests

**Files:**
- Modify: `test.js`

- [ ] **Step 1: Confirm current test count before migrating**

```bash
node --test test.js 2>&1 | grep -E "^(✓|✗|pass|fail)" | wc -l
```

Note the number — you should end up with fewer tests (the build.js-specific ones are removed).

- [ ] **Step 2: Remove the build.js-dependent tests from test.js**

Delete the following test blocks entirely (identified by their `test(...)` call and opening/closing braces):

- `test('parseContent returns all required fields plus rendered html', ...)`
- `test('renderSubjectPage returns valid HTML with title and rendered body', ...)`
- `test('renderHubPage returns HTML with sorted card links for all subjects', ...)`
- `test('parseCallouts converts [!EXAM] block to callout HTML', ...)`
- `test('parseCallouts handles all four callout types', ...)`
- `test('parseContent prefers enriched file over raw when enriched file exists', ...)`
- `test('buildSite generates docs/index.html and all subject pages', ...)`

Keep:
- `test('content files exist and have valid frontmatter', ...)` — no build.js dependency
- `test('enrich.js exports enrichSubject as a function without side effects on import', ...)`
- All three render.js tests added in Tasks 1–3

- [ ] **Step 3: Run the full test suite to confirm all remaining tests pass**

```bash
node --test test.js
```

Expected output (all green):
```
✓ content files exist and have valid frontmatter
✓ buildHub generates docs/index.html with sorted card links
✓ renderSubject writes Anthropic response HTML to docs/[slug]/index.html
✓ renderSubject throws a clear error when enriched file is missing
✓ renderSite renders all enriched slugs and rebuilds hub
✓ enrich.js exports enrichSubject as a function without side effects on import
```

- [ ] **Step 4: Commit**

```bash
git add test.js
git commit -m "test: migrate test.js from build.js to render.js"
```

---

## Task 5: Update project config files

**Files:**
- Modify: `package.json`
- Modify: `.github/workflows/deploy.yml`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update package.json**

Replace the `"scripts"` block with:

```json
"scripts": {
  "render": "node render.js",
  "test": "node --test test.js",
  "enrich": "node enrich.js"
}
```

- [ ] **Step 2: Update .github/workflows/deploy.yml**

Remove the `"Build site"` step and the `"Commit generated docs"` step entirely. The final workflow `steps` should be:

```yaml
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
```

The deploy step is removed because GitHub Pages deploys from the `main` branch `docs/` folder directly — tests pass, push happens, Pages picks up the committed HTML files.

Wait — check how GitHub Pages is configured for this repo before removing the deploy step. If it relies on the `gh-pages` branch or a specific action, you may need to keep a deploy step. Run:

```bash
cat .github/workflows/deploy.yml
```

If the workflow only writes to `docs/` and relies on GitHub Pages being configured to serve from `main/docs`, remove the commit step. If it uses `peaceiris/actions-gh-pages` or similar, keep the deploy action but remove only the build + git-commit steps.

- [ ] **Step 3: Update CLAUDE.md commands table**

Find the commands table in `CLAUDE.md` (under the `## Commands` heading). Replace it with:

```markdown
| Command | Purpose |
|---|---|
| `npm test` | Run all tests |
| `npm run render -- [slug]` | AI-render one subject page (runs once per subject) |
| `npm run render -- --all` | AI-render all subjects that have enriched files |
| `npm run enrich -- [slug]` | AI-enrich one subject (run once per subject) |
| `npm run enrich -- --all` | AI-enrich all subjects missing an enriched file |
| `open docs/index.html` | Preview locally |
```

Also update Step 5 of "The Primary Recurring Task" section — replace the `npm run build` reference:

Find:
```markdown
### 5. Run tests and build

\`\`\`bash
npm test          # Must pass before committing
npm run build     # Generates docs/ output
\`\`\`
```

Replace with:
```markdown
### 5. Run tests and render

\`\`\`bash
npm test                          # Must pass before committing
npm run render -- [slug]          # Generates docs/[slug]/index.html
\`\`\`
```

- [ ] **Step 4: Run npm test to confirm config change didn't break anything**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add package.json .github/workflows/deploy.yml CLAUDE.md
git commit -m "chore: replace build script with render, update CI and docs"
```

---

## Task 6: Delete build.js and final verification

**Files:**
- Delete: `build.js`

- [ ] **Step 1: Delete build.js**

```bash
rm /Users/andrecantidio/Documents/Projetos/personal/fgv-summary-platform/build.js
```

- [ ] **Step 2: Run the full test suite**

```bash
npm test
```

Expected: all 6 tests pass with no reference to build.js.

- [ ] **Step 3: Smoke-test the render CLI with a real subject**

```bash
npm run render -- estrategia-corporativa
```

Expected output:
```
Rendering "estrategia-corporativa" with Claude Opus...
✓ Rendered "estrategia-corporativa" → docs/estrategia-corporativa/index.html
```

Then open the result:
```bash
open docs/estrategia-corporativa/index.html
```

Verify: rich HTML page opens, not a generic markdown conversion. Check for subject-specific visual components (SWOT matrix, stepper for phases, etc.), sticky nav, back link, accent color matching the purple theme.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: remove build.js — render.js is now the sole output generator"
```

---

## Post-Implementation: Delete example folder

Once you've verified the output looks great:

```bash
rm -rf estrategia-corporativa-example/
git add -A
git commit -m "chore: remove example folder — superseded by AI renderer"
```
