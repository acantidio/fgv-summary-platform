function safe(v) { return v ?? 0 }
function div(a, b) {
  if (a == null || b == null || b === 0) return null
  return a / b
}

export function calcIndicators(inputs) {
  const { recLiq, lucBruto, lair, ll, at, ac, caixa, estoque,
          rlp, inv, imob, intang, pc, pnc, pl, dlEbitda } = inputs

  const ct = (pc != null || pnc != null) ? safe(pc) + safe(pnc) : null
  const ap = (inv != null || imob != null || intang != null)
    ? safe(inv) + safe(imob) + safe(intang) : null

  const liqCorrente = div(ac, pc)
  const liqSeca = (ac != null && estoque != null && pc != null)
    ? div(ac - estoque, pc) : div(ac, pc)
  const gde = (liqCorrente != null && liqSeca != null && liqCorrente !== 0)
    ? (liqCorrente - liqSeca) / liqCorrente : null

  return {
    ct,
    ap,
    liqImediata: div(caixa, pc),
    liqCorrente,
    liqSeca,
    gde,
    liqGeral: (ac != null || rlp != null) && (pc != null || pnc != null)
      ? div(safe(ac) + safe(rlp), safe(pc) + safe(pnc)) : null,
    endGeral: div(ct, at),
    compDivida: div(pc, ct),
    imobCP: div(ap, pl),
    imobRNC: (ap != null && (pl != null || pnc != null))
      ? div(ap, safe(pl) + safe(pnc)) : null,
    dlEbitda: dlEbitda ?? null,
    margBruta: div(lucBruto, recLiq),
    margOp: div(lair, recLiq),
    margLiq: div(ll, recLiq),
    roi: div(ll, at),
    payback: (ll != null && ll > 0 && at != null && at !== 0) ? at / ll : null,
    roe: div(ll, pl),
  }
}

export function diagnoseBadge(indicator, value) {
  if (value === null || value === undefined) return null
  switch (indicator) {
    case 'liqImediata':  return value <= 0.10 ? 'ok' : 'crit'
    case 'liqCorrente':
      if (value > 1.0) return 'ok'
      if (Math.abs(value - 1.0) < 0.005) return 'warn'
      return 'crit'
    case 'liqSeca':      return null
    case 'gde':          return null
    case 'liqGeral':     return value >= 1.0 ? 'ok' : 'crit'
    case 'endGeral':     return 'neutral'
    case 'compDivida':   return value < 0.50 ? 'ok' : 'crit'
    case 'imobCP':       return value < 1.0 ? 'ok' : 'crit'
    case 'imobRNC':      return value < 1.0 ? 'ok' : 'crit'
    case 'dlEbitda':
      if (value <= 2.0) return 'ok'
      if (value <= 3.0) return 'warn'
      return 'crit'
    case 'margBruta':
    case 'margOp':
    case 'margLiq':      return 'neutral'
    case 'roi':          return null
    case 'roe':
      if (value > 0.1434) return 'ok'
      if (value > 0) return 'warn'
      return 'crit'
    default:             return null
  }
}

function pct(v) {
  if (v === null) return '—'
  return (v * 100).toFixed(2).replace('.', ',') + '%'
}
function dec(v, places = 2) { return v === null ? '—' : v.toFixed(places).replace('.', ',') }

export function diagnoseText(indicator, ind) {
  switch (indicator) {
    case 'liqImediata': {
      if (ind.liqImediata === null) return null
      const v = dec(ind.liqImediata)
      return ind.liqImediata <= 0.10
        ? `Identificamos eficiente política de gestão de caixa, com volume reduzido de recursos em tesouraria (${v}), evidenciando que o capital está empregado no giro operacional do negócio.`
        : `Identificamos ineficiente política de gestão de caixa, mantendo alto volume de recursos em tesouraria (${v}), o que significa que o capital encontra-se estagnado em caixa e equivalentes, e não empregado no giro operacional do negócio.`
    }
    case 'liqCorrente': {
      if (ind.liqCorrente === null) return null
      const v = dec(ind.liqCorrente)
      if (ind.liqCorrente > 1.0) return `No que tange à capacidade de honrar suas dívidas de curto prazo, verifica-se folga financeira (${v}), revelando-se com alta capacidade de solvência.`
      if (Math.abs(ind.liqCorrente - 1.0) < 0.005) return `No que tange à capacidade de honrar suas dívidas de curto prazo, a empresa opera no ponto de equilíbrio (${v}), sem folga financeira — trabalha de graça.`
      return `No que tange à capacidade de honrar suas dívidas de curto prazo, identifica-se insuficiência financeira (${v}), sinalizando risco de solvência no curto prazo.`
    }
    case 'liqSeca': return null
    case 'gde': {
      if (ind.gde === null) return null
      const v = pct(ind.gde)
      return ind.gde <= 0.40
        ? `Foi observado baixo grau de dependência dos estoques (${v}), demonstrando concentração de recursos abaixo do padrão de mercado nesse item do capital de giro.`
        : `Foi observado elevado grau de dependência dos estoques (${v}), sinalizando que a liquidez da empresa está fortemente atrelada à realização do estoque.`
    }
    case 'liqGeral': {
      if (ind.liqGeral === null) return null
      const v = dec(ind.liqGeral)
      return ind.liqGeral >= 1.0
        ? `Em se tratando da capacidade de liquidar suas dívidas de curto e longo prazo, observa-se conformidade, com o índice apresentando-se acima da unidade (${v}).`
        : `Em se tratando da capacidade de liquidar suas dívidas de curto e longo prazo, o índice (${v}) apresenta-se abaixo da unidade. Caso a liquidez corrente seja adequada, isso pode indicar que o endividamento está alocado majoritariamente no longo prazo — o que é positivo para o negócio.`
    }
    case 'endGeral': {
      if (ind.endGeral === null) return null
      return `Quanto à análise de estrutura de capital, a empresa opera com ${pct(ind.endGeral)} de dependência de capital de terceiros no financiamento do ativo. Operar alavancado não é problema desde que haja prazo — quanto mais alongado o perfil, mais barato o capital.`
    }
    case 'compDivida': {
      if (ind.compDivida === null) return null
      const v = pct(ind.compDivida)
      return ind.compDivida < 0.50
        ? `A maior parte do endividamento tem viés de longo prazo (${v}), contribuindo para reduzir o custo do capital financiado e ampliar o fôlego financeiro das operações.`
        : `A maior parte do endividamento tem viés de curto prazo (${v}), o que contribui para onerar o custo do capital financiado e reduzir o fôlego financeiro das operações.`
    }
    case 'imobCP': {
      if (ind.imobCP === null) return null
      const v = dec(ind.imobCP)
      return ind.imobCP < 1.0
        ? `Quanto ao grau de imobilização do patrimônio líquido, nota-se que o capital próprio foi suficiente para cobrir as aplicações efetuadas no ativo permanente (${v}), evidenciando adequada alocação de recursos.`
        : `Quanto ao grau de imobilização do patrimônio líquido, o capital próprio não foi suficiente para cobrir as aplicações efetuadas no ativo permanente (${v}), evidenciando dependência de capital de terceiros para financiar ativos fixos.`
    }
    case 'imobRNC': {
      if (ind.imobRNC === null) return null
      const v = dec(ind.imobRNC)
      return ind.imobRNC < 1.0
        ? `Considerando os recursos não correntes (PL + PNC), a cobertura do ativo permanente (${v}) mostra-se adequada, sem necessidade de recorrer ao capital de curto prazo.`
        : `Considerando os recursos não correntes (PL + PNC), a cobertura do ativo permanente (${v}) é insuficiente, indicando que a empresa recorreu ao capital de curto prazo para financiar ativos de longo prazo.`
    }
    case 'dlEbitda': {
      if (ind.dlEbitda === null) return null
      const v = dec(ind.dlEbitda)
      if (ind.dlEbitda <= 2.0) return `Consolidando a análise financeira mediante o ratio Dívida Líquida/EBITDA de ${v}, a empresa apresenta baixo fator de risco e elevada capacidade de solvência.`
      if (ind.dlEbitda <= 3.0) return `O ratio Dívida Líquida/EBITDA de ${v} indica risco moderado, demandando atenção ao ritmo de geração de caixa frente ao endividamento.`
      return `O ratio Dívida Líquida/EBITDA de ${v} sinaliza elevado fator de risco e possível insolvência, indicando que a geração de caixa é insuficiente frente ao endividamento total.`
    }
    case 'margBruta': {
      if (ind.margBruta === null && ind.margOp === null && ind.margLiq === null) return null
      return `No que concerne à avaliação econômica, a empresa apresenta margem bruta de ${pct(ind.margBruta)}, margem operacional de ${pct(ind.margOp)} e margem líquida de ${pct(ind.margLiq)}.`
    }
    case 'margOp':
    case 'margLiq':
      return null
    case 'roi': {
      if (ind.roi === null) return null
      if (ind.roi < 0) return `A empresa apresenta prejuízo líquido no período, inviabilizando o cálculo do payback sobre os ativos totais.`
      const anos = ind.payback !== null ? dec(ind.payback, 1) + ' anos' : '—'
      return `Avaliando conjuntamente DRE e BP, o retorno sobre os investimentos totais (ROI) é de ${pct(ind.roi)}, com tempo de recuperação (payback) de ${anos}.`
    }
    case 'roe': {
      if (ind.roe === null) return null
      const v = pct(ind.roe)
      if (ind.roe > 0.1434) return `Podemos concluir sobre a total cobertura do custo de oportunidade do capital — o rendimento líquido gerado aos investidores (${v}) supera o rendimento real dos Títulos do Tesouro Nacional (14,34%), evidenciando geração de valor econômico.`
      if (ind.roe > 0) return `A empresa aufere lucro, porém o retorno sobre o capital próprio (${v}) não supera o rendimento real dos Títulos do Tesouro Nacional (14,34%), sinalizando destruição de valor econômico para os acionistas.`
      return `A empresa apresenta prejuízo no período, com ROE negativo (${v}). De nada adianta auferir receita se não há geração de valor — o capital estaria melhor alocado em renda fixa.`
    }
    default: return null
  }
}

const HIGHER_IS_BETTER = {
  liqImediata: false,
  liqCorrente: true,
  liqSeca:     true,
  gde:         false,
  liqGeral:    true,
  endGeral:    null,
  compDivida:  false,
  imobCP:      false,
  imobRNC:     false,
  dlEbitda:    false,
  margBruta:   true,
  margOp:      true,
  margLiq:     true,
  roi:         true,
  roe:         true,
}

export function trendArrow(indicator, prev, curr) {
  if (prev === null || prev === undefined || curr === null || curr === undefined) return null
  const diff = curr - prev
  const threshold = Math.abs(prev) * 0.01
  if (Math.abs(diff) <= threshold) return { symbol: '→', favorable: null }
  const up = diff > 0
  const dir = HIGHER_IS_BETTER[indicator] ?? null
  const favorable = dir === null ? null : (dir === up)
  return { symbol: up ? '↑' : '↓', favorable }
}
