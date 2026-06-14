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

// ── content files ─────────────────────────────────────────────────────────────
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

// ── enrich.js ─────────────────────────────────────────────────────────────────
test('enrich.js exports enrichSubject as a function without side effects on import', async () => {
  const mod = await import('./enrich.js')
  assert.equal(typeof mod.enrichSubject, 'function', 'must export enrichSubject function')
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

test('buildHub includes Ferramentas section linking to calculadora-indicadores', async () => {
  const { buildHub } = await import('./render.js')
  buildHub()
  const hub = readFileSync(join(DOCS_DIR, 'index.html'), 'utf-8')
  assert.ok(hub.includes('href="./calculadora-indicadores/"'), 'hub must link to calculadora-indicadores')
  assert.ok(hub.includes('Ferramentas'), 'hub must include Ferramentas label')
  assert.ok(!hub.includes('<script'), 'hub must still contain no script tags')
})

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
