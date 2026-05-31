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
