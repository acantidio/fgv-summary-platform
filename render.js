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
    renderSubject(args[0]).catch(err => { console.error(err.message); process.exit(1) })
  } else {
    console.error('Usage: node render.js [slug] | --all')
    process.exit(1)
  }
}
