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

// ── calc.js: calcIndicators ───────────────────────────────────────────────────
test('calcIndicators computes all BP indicators from Raia Drogasil 2025 data', async () => {
  const { calcIndicators } = await import('./docs/calculadora-indicadores/calc.js')

  const result = calcIndicators({
    recLiq: null, lucBruto: null, lair: null, ll: null,
    at: 24393381, ac: 13519926, caixa: 296965, estoque: 9127427,
    rlp: 500417, inv: 1390158, imob: 7220602, intang: 1762278,
    pc: 9589193, pnc: 7482059, pl: 7322129, dlEbitda: null
  })

  const near = (a, b) => Math.abs(a - b) < 0.001

  assert.equal(result.ct, 17071252, 'Capital de Terceiros')
  assert.equal(result.ap, 10373038, 'Ativo Permanente')
  assert.ok(near(result.liqImediata, 0.031), `liqImediata got ${result.liqImediata}`)
  assert.ok(near(result.liqCorrente, 1.410), `liqCorrente got ${result.liqCorrente}`)
  assert.ok(near(result.liqSeca, 0.458), `liqSeca got ${result.liqSeca}`)
  assert.ok(near(result.gde, 0.675), `gde got ${result.gde}`)
  assert.ok(near(result.liqGeral, 0.821), `liqGeral got ${result.liqGeral}`)
  assert.ok(near(result.endGeral, 0.700), `endGeral got ${result.endGeral}`)
  assert.ok(near(result.compDivida, 0.562), `compDivida got ${result.compDivida}`)
  assert.ok(near(result.imobCP, 1.417), `imobCP got ${result.imobCP}`)
  assert.ok(near(result.imobRNC, 0.701), `imobRNC got ${result.imobRNC}`)
})

test('calcIndicators computes DRE indicators from MRV 2025 data', async () => {
  const { calcIndicators } = await import('./docs/calculadora-indicadores/calc.js')

  const result = calcIndicators({
    recLiq: null, lucBruto: null, lair: null, ll: -1042256,
    at: 16142630, ac: null, caixa: null, estoque: null,
    rlp: null, inv: null, imob: null, intang: null,
    pc: null, pnc: null, pl: 5327812, dlEbitda: null
  })

  const near = (a, b) => Math.abs(a - b) < 0.001
  assert.ok(near(result.roi, -0.0646), `roi got ${result.roi}`)
  assert.ok(near(result.roe, -0.1956), `roe got ${result.roe}`)
  assert.equal(result.payback, null, 'payback must be null when ll < 0')
})

test('calcIndicators returns null for indicators with missing inputs', async () => {
  const { calcIndicators } = await import('./docs/calculadora-indicadores/calc.js')
  const empty = { recLiq:null,lucBruto:null,lair:null,ll:null,at:null,ac:null,
    caixa:null,estoque:null,rlp:null,inv:null,imob:null,intang:null,
    pc:null,pnc:null,pl:null,dlEbitda:null }
  const result = calcIndicators(empty)
  assert.equal(result.liqImediata, null)
  assert.equal(result.roi, null)
  assert.equal(result.roe, null)
})

test('calcIndicators handles dlEbitda as pass-through input', async () => {
  const { calcIndicators } = await import('./docs/calculadora-indicadores/calc.js')
  const result = calcIndicators({
    recLiq:null,lucBruto:null,lair:null,ll:null,at:null,ac:null,
    caixa:null,estoque:null,rlp:null,inv:null,imob:null,intang:null,
    pc:null,pnc:null,pl:null,dlEbitda:2.5
  })
  assert.equal(result.dlEbitda, 2.5)
})

// ── calc.js: diagnoseBadge ────────────────────────────────────────────────────
test('diagnoseBadge returns correct badge for each indicator', async () => {
  const { diagnoseBadge } = await import('./docs/calculadora-indicadores/calc.js')

  assert.equal(diagnoseBadge('liqImediata', 0.03), 'ok')
  assert.equal(diagnoseBadge('liqImediata', 0.10), 'ok')
  assert.equal(diagnoseBadge('liqImediata', 0.54), 'crit')

  assert.equal(diagnoseBadge('liqCorrente', 1.41), 'ok')
  assert.equal(diagnoseBadge('liqCorrente', 1.00), 'warn')
  assert.equal(diagnoseBadge('liqCorrente', 0.80), 'crit')

  assert.equal(diagnoseBadge('liqSeca', 0.45), null)
  assert.equal(diagnoseBadge('gde', 0.67), null)

  assert.equal(diagnoseBadge('liqGeral', 1.10), 'ok')
  assert.equal(diagnoseBadge('liqGeral', 0.82), 'crit')

  assert.equal(diagnoseBadge('endGeral', 0.70), 'neutral')

  assert.equal(diagnoseBadge('compDivida', 0.29), 'ok')
  assert.equal(diagnoseBadge('compDivida', 0.56), 'crit')

  assert.equal(diagnoseBadge('imobCP', 0.80), 'ok')
  assert.equal(diagnoseBadge('imobCP', 1.42), 'crit')

  assert.equal(diagnoseBadge('imobRNC', 0.70), 'ok')
  assert.equal(diagnoseBadge('imobRNC', 1.10), 'crit')

  assert.equal(diagnoseBadge('dlEbitda', 1.5), 'ok')
  assert.equal(diagnoseBadge('dlEbitda', 2.5), 'warn')
  assert.equal(diagnoseBadge('dlEbitda', 3.5), 'crit')

  assert.equal(diagnoseBadge('margBruta', 0.33), 'neutral')
  assert.equal(diagnoseBadge('margOp', 0.19), 'neutral')
  assert.equal(diagnoseBadge('margLiq', 0.16), 'neutral')

  assert.equal(diagnoseBadge('roi', 0.05), null)

  assert.equal(diagnoseBadge('roe', 0.18), 'ok')
  assert.equal(diagnoseBadge('roe', 0.10), 'warn')
  assert.equal(diagnoseBadge('roe', -0.20), 'crit')

  assert.equal(diagnoseBadge('liqImediata', null), null)
})

// ── calc.js: diagnoseText ─────────────────────────────────────────────────────
test('diagnoseText returns appropriate phrase for each indicator state', async () => {
  const { diagnoseText } = await import('./docs/calculadora-indicadores/calc.js')

  const t1 = diagnoseText('liqImediata', { liqImediata: 0.03 })
  assert.ok(t1.includes('eficiente'), `liqImediata ok: got "${t1}"`)

  const t2 = diagnoseText('liqImediata', { liqImediata: 0.54 })
  assert.ok(t2.includes('ineficiente'), `liqImediata crit: got "${t2}"`)

  const t3 = diagnoseText('liqCorrente', { liqCorrente: 1.41 })
  assert.ok(t3.includes('folga financeira'), `liqCorrente ok: got "${t3}"`)

  const t4 = diagnoseText('liqCorrente', { liqCorrente: 1.00 })
  assert.ok(t4.includes('equilíbrio'), `liqCorrente warn: got "${t4}"`)

  const t5 = diagnoseText('liqCorrente', { liqCorrente: 0.80 })
  assert.ok(t5.includes('insuficiência'), `liqCorrente crit: got "${t5}"`)

  const t6 = diagnoseText('roe', { roe: 0.18 })
  assert.ok(t6.includes('cobertura do custo de oportunidade'), `roe ok: got "${t6}"`)

  const t7 = diagnoseText('roe', { roe: -0.20 })
  assert.ok(t7.includes('prejuízo'), `roe crit: got "${t7}"`)

  const t8 = diagnoseText('margBruta', { margBruta: 0.33, margOp: 0.19, margLiq: 0.16 })
  assert.ok(t8.includes('33,00%') && t8.includes('19,00%') && t8.includes('16,00%'), `margens: got "${t8}"`)

  assert.equal(diagnoseText('liqImediata', { liqImediata: null }), null)
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
