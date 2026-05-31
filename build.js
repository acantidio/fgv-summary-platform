import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { marked } from 'marked'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const CONTENT_DIR = join(__dirname, 'content')
export const DOCS_DIR = join(__dirname, 'docs')

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
