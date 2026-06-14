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

export function diagnoseBadge(indicator, value) { return null }
export function diagnoseText(indicator, indicators) { return null }
export function trendArrow(indicator, prev, curr) { return null }
