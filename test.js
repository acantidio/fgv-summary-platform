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
  assert.ok(html.indexOf('Alpha Subject') < html.indexOf('Beta Subject'), 'cards must be sorted by title')
})

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
  const testSlug = '_test-callout-fixture'
  const enrichedPath = join(enrichedDir, `${testSlug}.md`)
  const rawPath = join(__dirname, 'content', `${testSlug}.md`)
  mkdirSync(enrichedDir, { recursive: true })
  writeFileSync(rawPath, `---
title: Test Fixture
slug: ${testSlug}
description: Fixture for enriched-file preference test.
status: complete
color: purple
---

Raw content only.
`, 'utf-8')
  writeFileSync(enrichedPath, `---
title: Test Fixture
slug: ${testSlug}
description: Fixture for enriched-file preference test.
status: complete
color: purple
---

> [!EXAM]
> Enriched content marker — this line only exists in the enriched file.
`, 'utf-8')

  try {
    const result = parseContent(rawPath)
    assert.ok(
      result.html.includes('callout-exam'),
      'parseContent must use the enriched file (which has [!EXAM] callout)'
    )
  } finally {
    unlinkSync(enrichedPath)
    unlinkSync(rawPath)
  }
})

test('enrich.js exports enrichSubject as a function without side effects on import', async () => {
  const mod = await import('./enrich.js')
  assert.equal(typeof mod.enrichSubject, 'function', 'must export enrichSubject function')
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
