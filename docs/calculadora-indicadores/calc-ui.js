import { calcIndicators, diagnoseBadge, diagnoseText, trendArrow } from './calc.js'

const FIELDS = {
  dre:       ['recLiq','lucBruto','lair','ll'],
  bpativo:   ['at','ac','caixa','estoque','rlp','inv','imob','intang'],
  bppassivo: ['pc','pnc','pl'],
  ratio:     ['dlEbitda'],
}
const ALL_FIELDS = [...FIELDS.dre, ...FIELDS.bpativo, ...FIELDS.bppassivo, ...FIELDS.ratio]
const MAX_PERIODS = 5

let state = {
  periods: [
    { label: String(new Date().getFullYear()), inputs: emptyInputs() }
  ]
}

function emptyInputs() {
  return Object.fromEntries(ALL_FIELDS.map(f => [f, null]))
}

function parseNum(s) {
  if (!s || !s.trim()) return null
  const n = parseFloat(s.replace(',', '.'))
  return isNaN(n) ? null : n
}

// ── Period tabs ───────────────────────────────────────────────────────────────

function renderPeriodTabs() {
  const container = document.getElementById('period-tabs')
  container.innerHTML = state.periods.map((p, i) => `
    <div class="period-tab" data-period="${i}">
      <input type="text" value="${p.label}" aria-label="Rótulo do período ${i+1}"
             data-period-label="${i}" maxlength="6">
      ${state.periods.length > 1
        ? `<button class="rm-btn" data-remove-period="${i}" title="Remover período">✕</button>`
        : ''}
    </div>
  `).join('')
}

function renderFormHeaders() {
  ['dre','bpativo','bppassivo','ratio'].forEach(section => {
    const row = document.getElementById(`${section}-header-row`)
    const extras = state.periods.map(() =>
      `<th style="min-width:120px"></th>`
    ).join('')
    const existing = row.querySelector('th')
    row.innerHTML = existing.outerHTML + extras
  })
}

function renderFormInputs() {
  state.periods.forEach((period, pi) => {
    ['dre','bpativo','bppassivo','ratio'].forEach(section => {
      const table = document.getElementById(`${section}-table`)
      const rows = table.querySelectorAll('tbody tr[data-field]')
      rows.forEach(tr => {
        const field = tr.getAttribute('data-field')
        let td = tr.querySelector(`td[data-period-input="${pi}"]`)
        if (!td) {
          td = document.createElement('td')
          td.setAttribute('data-period-input', pi)
          td.style.textAlign = 'right'
          tr.appendChild(td)
        }
        const val = period.inputs[field]
        td.innerHTML = `<input class="num-input" type="number" step="any"
          data-field="${field}" data-period="${pi}"
          value="${val !== null ? val : ''}" placeholder="—">`
      })
    })
  })
}

function renderForm() {
  renderPeriodTabs()
  renderFormHeaders()
  renderFormInputs()
  renderResults()
}

// ── Add / remove periods ──────────────────────────────────────────────────────

document.getElementById('add-period-btn').addEventListener('click', () => {
  if (state.periods.length >= MAX_PERIODS) return
  const lastLabel = state.periods[state.periods.length - 1].label
  const newLabel = String(parseInt(lastLabel, 10) - 1) || ''
  state.periods.push({ label: newLabel, inputs: emptyInputs() })
  rebuildFormStructure()
  renderForm()
})

document.getElementById('period-tabs').addEventListener('click', e => {
  const btn = e.target.closest('[data-remove-period]')
  if (!btn) return
  const i = parseInt(btn.getAttribute('data-remove-period'), 10)
  state.periods.splice(i, 1)
  rebuildFormStructure()
  renderForm()
})

document.getElementById('period-tabs').addEventListener('input', e => {
  const inp = e.target.closest('[data-period-label]')
  if (!inp) return
  const i = parseInt(inp.getAttribute('data-period-label'), 10)
  state.periods[i].label = inp.value
  renderFormHeaders()
  renderResults()
})

function rebuildFormStructure() {
  ['dre','bpativo','bppassivo','ratio'].forEach(section => {
    const table = document.getElementById(`${section}-table`)
    table.querySelectorAll('tbody tr[data-field]').forEach(tr => {
      tr.querySelectorAll('td[data-period-input]').forEach(td => td.remove())
    })
    const headerRow = document.getElementById(`${section}-header-row`)
    const first = headerRow.querySelector('th')
    headerRow.innerHTML = first.outerHTML
  })
}

// ── Input events ──────────────────────────────────────────────────────────────

document.getElementById('calc-form').addEventListener('input', e => {
  const inp = e.target.closest('[data-field][data-period]')
  if (!inp) return
  const field = inp.getAttribute('data-field')
  const pi = parseInt(inp.getAttribute('data-period'), 10)
  state.periods[pi].inputs[field] = parseNum(inp.value)
  renderResults()
})

// ── Results rendering ─────────────────────────────────────────────────────────

function fmtPct(v) { return v === null ? '—' : (v * 100).toFixed(2).replace('.', ',') + '%' }
function fmtDec(v, d = 2) { return v === null ? '—' : v.toFixed(d).replace('.', ',') }
function fmtYears(v) { return v === null ? '—' : v.toFixed(1).replace('.', ',') + ' anos' }

function badgeHtml(b) {
  if (!b || b === 'neutral') return ''
  const labels = { ok: '✓ Adequado', warn: '⚠ Atenção', crit: '✗ Crítico' }
  return `<span class="badge ${b}">${labels[b] || ''}</span>`
}

function trendHtml(indicator, prev, curr) {
  if (prev === null || curr === null) return ''
  const t = trendArrow(indicator, prev, curr)
  if (!t) return ''
  const cls = t.favorable === true ? 'good' : t.favorable === false ? 'bad' : 'neutral'
  return `<span class="trend ${cls}">${t.symbol}</span>`
}

function valueCell(indicator, allResults, periodIdx) {
  const ind = allResults[periodIdx]
  const prev = periodIdx < allResults.length - 1 ? allResults[periodIdx + 1] : null

  const raw = ind[indicator]
  let display = '—'

  if (['liqImediata','liqCorrente','liqSeca','liqGeral','endGeral','compDivida','imobCP','imobRNC','dlEbitda'].includes(indicator)) {
    display = fmtDec(raw)
  } else if (['gde','margBruta','margOp','margLiq','roi','roe'].includes(indicator)) {
    display = fmtPct(raw)
  }

  const badge = diagnoseBadge(indicator, raw)
  const trend = prev ? trendHtml(indicator, prev[indicator], raw) : ''

  return `<td class="value-cell">
    <span class="result-val${raw === null ? ' empty' : ''}">${display}${trend}</span>
    ${badgeHtml(badge)}
  </td>`
}

function diagRow(indicator, allResults, colCount) {
  const ind = allResults[0]
  const text = diagnoseText(indicator, ind)
  if (!text) return ''
  return `<tr class="diag-row">
    <td colspan="${colCount + 1}"><p class="diag-text">${text}</p></td>
  </tr>`
}

function gdeRow(allResults) {
  return allResults.map((ind, i) => {
    const v = ind.gde
    if (v === null) return '<td class="value-cell"><span class="result-val empty">—</span></td>'
    const pv = fmtPct(v)
    const prev = i < allResults.length - 1 ? allResults[i + 1] : null
    const trend = prev ? trendHtml('gde', prev.gde, v) : ''
    const okCS = v <= 0.40 ? 'ok' : 'crit'
    const okInd = v <= 0.50 ? 'ok' : 'crit'
    return `<td class="value-cell">
      <span class="result-val">${pv}${trend}</span>
      <div class="gde-benchmarks">
        <span class="badge ${okCS}">Comércio/Serv ≤40%</span>
        <span class="badge ${okInd}">Indústria ≤50%</span>
      </div>
    </td>`
  }).join('')
}

function roiRow(allResults) {
  return allResults.map((ind, i) => {
    const v = ind.roi
    const prev = i < allResults.length - 1 ? allResults[i + 1] : null
    const trend = prev ? trendHtml('roi', prev.roi, v) : ''
    if (v === null) return '<td class="value-cell"><span class="result-val empty">—</span></td>'
    const pv = fmtPct(v)
    const py = ind.payback !== null ? fmtYears(ind.payback) : '—'
    return `<td class="value-cell">
      <span class="result-val">${pv}${trend}</span>
      <div class="roi-benchmarks">Payback: ${py}</div>
      <div class="roi-benchmarks">Serviço 10–15a · Comércio 15–20a · Indústria 20–25a</div>
    </td>`
  }).join('')
}

const GROUPS = [
  {
    title: 'Liquidez / Solvência',
    rows: [
      { key: 'liqImediata', label: 'Liquidez Imediata', hint: 'Caixa / PC', diag: true },
      { key: 'liqCorrente', label: 'Liquidez Corrente', hint: 'AC / PC', diag: true },
      { key: 'liqSeca',     label: 'Liquidez Seca',     hint: '(AC − Estoque) / PC', diag: false },
      { key: 'gde',         label: 'GDE',               hint: '(LC − LS) / LC', diag: true, custom: 'gde' },
      { key: 'liqGeral',    label: 'Liquidez Geral',    hint: '(AC + RLP) / (PC + PNC)', diag: true },
    ]
  },
  {
    title: 'Alavancagem / Risco',
    rows: [
      { key: 'endGeral',    label: 'Endividamento Geral',           hint: 'CT / Ativo Total', diag: true },
      { key: 'compDivida',  label: 'Composição da Dívida',          hint: 'PC / CT', diag: true },
      { key: 'imobCP',      label: 'Grau de Imobilização CP',       hint: 'AP / PL', diag: true },
      { key: 'imobRNC',     label: 'Grau de Imobilização RNC',      hint: 'AP / (PL + PNC)', diag: true },
    ]
  },
  {
    title: 'Dívida Líquida / EBITDA',
    rows: [
      { key: 'dlEbitda', label: 'DL / EBITDA', hint: 'Input direto do Relatório da Administração', diag: true },
    ]
  },
  {
    title: 'Lucratividade (DRE)',
    rows: [
      { key: 'margBruta', label: 'Margem Bruta (Markup)',   hint: 'Lucro Bruto / Receita de Vendas', diag: true },
      { key: 'margOp',    label: 'Margem Operacional',      hint: 'LAIR / Receita de Vendas', diag: false },
      { key: 'margLiq',   label: 'Margem Líquida',          hint: 'Lucro Líquido / Receita de Vendas', diag: false },
    ]
  },
  {
    title: 'Rentabilidade',
    rows: [
      { key: 'roi', label: 'ROI — Return on Investments', hint: 'Lucro Líquido / Ativo Total', diag: true, custom: 'roi' },
      { key: 'roe', label: 'ROE — Return on Equity',      hint: 'Lucro Líquido / PL', diag: true },
    ]
  },
]

function renderResults() {
  const allResults = state.periods.map(p => calcIndicators(p.inputs))
  const hasAnyValue = allResults.some(r =>
    Object.values(r).some(v => v !== null && typeof v === 'number')
  )

  const container = document.getElementById('results')

  if (!hasAnyValue) {
    container.innerHTML = `<div class="empty-state"><p>Preencha os campos acima para ver os indicadores calculados.</p></div>`
    return
  }

  const colCount = state.periods.length
  const headerCols = state.periods.map(p => `<th>${p.label}</th>`).join('')

  const groupsHtml = GROUPS.map(group => {
    const rowsHtml = group.rows.map(row => {
      let valueCells
      if (row.custom === 'gde') {
        valueCells = gdeRow(allResults)
      } else if (row.custom === 'roi') {
        valueCells = roiRow(allResults)
      } else {
        valueCells = allResults.map((_, i) => valueCell(row.key, allResults, i)).join('')
      }

      const diagHtml = row.diag ? diagRow(row.key, allResults, colCount) : ''

      return `<tr>
        <td class="ind-name">${row.label}<div class="formula-hint">${row.hint}</div></td>
        ${valueCells}
      </tr>${diagHtml}`
    }).join('')

    return `<div class="results-group">
      <p class="results-group-title">${group.title}</p>
      <table class="results-table">
        <thead><tr><th class="ind-col">Indicador</th>${headerCols}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`
  }).join('')

  container.innerHTML = `<h2 class="results-title">Resultados</h2>${groupsHtml}`
}

// ── Init ──────────────────────────────────────────────────────────────────────
renderForm()
