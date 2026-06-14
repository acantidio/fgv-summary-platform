# Calculadora de Indicadores Fundamentalistas — Design Spec

**Data:** 2026-06-14
**Status:** Aprovado pelo usuário

---

## Visão Geral

Página standalone de ferramenta interativa para calcular e diagnosticar indicadores econômico-financeiros, baseada nos parâmetros de mercado ensinados na disciplina de Análise de Demonstrativos Contábeis (FGV MBA). Permite análise multi-período com diagnósticos textuais no estilo do relatório fundamentalista do professor.

---

## Arquivo

```
docs/calculadora-indicadores/index.html
```

Arquivo único com HTML, CSS e JS embutidos. Não é gerado por `render.js` — é escrito diretamente como página de ferramenta.

---

## Acesso

Card "Ferramentas" adicionado manualmente no hub `docs/index.html`, apontando para `calculadora-indicadores/index.html`. O hub é gerado por `render.js`, então o card será adicionado via um bloco HTML fixo após os cards de matérias, ou como modificação no template do hub.

---

## Design System

Reutiliza exatamente o mesmo design system das páginas de matéria:
- Fontes: DM Sans, DM Serif Display, JetBrains Mono
- CSS variables: `--bg`, `--bg-card`, `--accent`, `--amber-*`, `--teal-*`, `--rose-*`, `--purple-*`, `--border`, etc.
- Back link estilo `← Hub` com `font-family: JetBrains Mono`

**Tecnologia:** HTML/CSS/JS vanilla. Zero dependências externas. JavaScript embutido em `<script>` no final do `<body>`.

---

## Estrutura da Página

```
← Hub                                      (backlink)
──────────────────────────────────────────
Calculadora de Indicadores                 (h1, DM Serif Display)
Análise Fundamentalista · FGV MBA          (subtítulo)
──────────────────────────────────────────
[Gerenciador de Períodos]
  [+ Adicionar Período]  (até 5 períodos)
  Cada período tem: label editável (ex: "2025"), botão ✕ remover

[BLOCO DE INPUTS]
  Seção 1 — DRE
  Seção 2 — BP: Ativo
  Seção 3 — BP: Passivo + PL
  Seção 4 — Ratio Direto

[BLOCO DE RESULTADOS]
  Grupo 1 — Liquidez / Solvência
  Grupo 2 — Alavancagem / Risco
  Grupo 3 — DL / EBITDA
  Grupo 4 — Lucratividade
  Grupo 5 — Rentabilidade
```

---

## Inputs

Os campos seguem a ordem de leitura dos documentos contábeis (DRE de cima pra baixo, BP primeiro Ativo depois Passivo, padrão IFRS).

Cada campo de input possui uma coluna por período. Valores em R$ mil (ou a unidade que o usuário preferir — sem conversão automática, a calculadora opera com os números como inseridos).

### Seção 1 — DRE (documento econômico)

| Campo | Uso nos indicadores |
|---|---|
| Receita de Vendas (Receita Líquida) | Margem Bruta, Margem Operacional, Margem Líquida |
| Lucro Bruto | Margem Bruta |
| LAIR (Lucro Antes do IR) | Margem Operacional |
| Lucro Líquido | Margem Líquida, ROI, ROE |

### Seção 2 — BP: Ativo

| Campo | Uso nos indicadores |
|---|---|
| Ativo Total | Endividamento Geral, ROI |
| Ativo Circulante | Liquidez Corrente, Liquidez Seca, Liquidez Geral |
| &nbsp;&nbsp;Caixa e Equivalentes | Liquidez Imediata |
| &nbsp;&nbsp;Estoque | Liquidez Seca, GDE |
| Realizável a Longo Prazo | Liquidez Geral |
| Investimentos | Ativo Permanente |
| Imobilizado | Ativo Permanente |
| Intangível | Ativo Permanente |

### Seção 3 — BP: Passivo + PL

| Campo | Uso nos indicadores |
|---|---|
| Passivo Circulante | Liquidez Imediata, Corrente, Seca, Geral, Composição da Dívida |
| Passivo Não Circulante | Liquidez Geral, Endividamento Geral, Grau de Imobilização RNC |
| Patrimônio Líquido | Grau de Imobilização CP, Grau de Imobilização RNC, ROE |

### Seção 4 — Ratio Direto

| Campo | Uso |
|---|---|
| Dívida Líquida / EBITDA | Diagnóstico direto por faixa (extraído do Relatório da Administração) |

### Campos Calculados Automaticamente (não são inputs)

- **Capital de Terceiros** = Passivo Circulante + Passivo Não Circulante
- **Ativo Permanente** = Investimentos + Imobilizado + Intangível

---

## Comportamento dos Inputs

- Recálculo em tempo real a cada `input` event — sem botão "Calcular"
- Campos vazios ou inválidos não geram erro: o indicador correspondente exibe `—`
- Aceita números positivos e negativos (ex: Lucro Líquido negativo = prejuízo)
- Separador decimal: vírgula ou ponto (normalização no JS)

---

## Resultados

### Layout

Tabela responsiva com:
- Coluna fixa: nome do indicador + fórmula em tooltip ou subtexto pequeno
- Uma coluna por período com: valor calculado + badge de diagnóstico
- Seta de tendência entre períodos consecutivos (↑ ↓ →), orientada por "o que é melhor para este indicador"
- Frase de diagnóstico dinâmica abaixo dos badges (interpola o valor calculado)

### Grupos e Indicadores

#### Grupo 1 — Liquidez / Solvência

| Indicador | Fórmula | Benchmark |
|---|---|---|
| Liquidez Imediata | Caixa / PC | ✓ ≤ 0,10 · ✗ > 0,10 |
| Liquidez Corrente | AC / PC | ✓ > 1,0 · ⚠ = 1,0 · ✗ < 1,0 |
| Liquidez Seca | (AC − Estoque) / PC | Sem badge isolado — lida com GDE |
| GDE | (LC − LS) / LC | Comércio/Serviço ≤ 40% · Indústria ≤ 50% (ambos exibidos) |
| Liquidez Geral | (AC + RLP) / (PC + PNC) | ✓ ≥ 1,0 · ✗ < 1,0 (com nota contextual) |

#### Grupo 2 — Alavancagem / Risco

| Indicador | Fórmula | Benchmark |
|---|---|---|
| Endividamento Geral | CT / Ativo Total | Sem badge — nota contextual |
| Composição da Dívida | PC / CT | ✓ < 50% · ✗ ≥ 50% |
| Grau de Imobilização CP | Ativo Permanente / PL | ✓ < 1,0 · ✗ ≥ 1,0 |
| Grau de Imobilização RNC | Ativo Permanente / (PL + PNC) | ✓ < 1,0 · ✗ ≥ 1,0 |

#### Grupo 3 — DL / EBITDA

| Faixa | Badge |
|---|---|
| ≤ 2,0 | ✓ Baixo risco |
| 2,0 – 3,0 | ⚠ Risco moderado |
| > 3,0 | ✗ Alto risco |

#### Grupo 4 — Lucratividade (DRE)

| Indicador | Fórmula | Benchmark |
|---|---|---|
| Margem Bruta | Lucro Bruto / Receita de Vendas | Sem badge (sem parâmetro universal) |
| Margem Operacional | LAIR / Receita de Vendas | Sem badge (análise setorial) |
| Margem Líquida | Lucro Líquido / Receita de Vendas | Sem badge |

Frase única agregada exibindo as três margens com seus valores.

#### Grupo 5 — Rentabilidade

**ROI — Return on Investments**
- Fórmula: Lucro Líquido / Ativo Total
- Exibe: % + payback em anos (1 / ROI)
- Benchmarks exibidos simultaneamente: Serviço 10–15a · Comércio 15–20a · Indústria 20–25a
- Badge: ✓/✗ relativo ao setor — como todos os três são exibidos, o badge não é aplicável; exibe apenas payback e o usuário julga

**ROE — Return on Equity**
- Fórmula: Lucro Líquido / Patrimônio Líquido
- Compara com rendimento real do Tesouro Nacional: **14,34%** (18,6% − IPCA 4,26%, referência 2025)
- ✓ ROE > 14,34% · ⚠ 0% < ROE ≤ 14,34% · ✗ ROE < 0%

---

## Frases de Diagnóstico Dinâmicas

Cada indicador possui frases template por estado que seguem o padrão textual do relatório fundamentalista do professor. Os valores calculados são interpolados nas frases (`{valor}`, `{anos}`, etc.).

### Liquidez Imediata
- **✓** "Identificamos eficiente política de gestão de caixa, com volume reduzido de recursos em tesouraria ({valor}), evidenciando que o capital está empregado no giro operacional do negócio."
- **✗** "Identificamos ineficiente política de gestão de caixa, mantendo alto volume de recursos em tesouraria ({valor}), o que significa que o capital encontra-se estagnado em caixa e equivalentes, e não empregado no giro operacional do negócio."

### Liquidez Corrente
- **✓** "No que tange à capacidade de honrar suas dívidas de curto prazo, verifica-se folga financeira ({valor}), revelando-se com alta capacidade de solvência."
- **⚠** "No que tange à capacidade de honrar suas dívidas de curto prazo, a empresa opera no ponto de equilíbrio ({valor}), sem folga financeira — trabalha de graça."
- **✗** "No que tange à capacidade de honrar suas dívidas de curto prazo, identifica-se insuficiência financeira ({valor}), sinalizando risco de solvência no curto prazo."

### GDE (Grau de Dependência do Estoque)
- **✓** "Foi observado baixo grau de dependência dos estoques ({valor}), demonstrando concentração de recursos abaixo do padrão de mercado nesse item do capital de giro."
- **✗** "Foi observado elevado grau de dependência dos estoques ({valor}), sinalizando que a liquidez da empresa está fortemente atrelada à realização do estoque."

### Liquidez Geral
- **✓** "Em se tratando da capacidade de liquidar suas dívidas de curto e longo prazo, observa-se conformidade, com o índice apresentando-se acima da unidade ({valor})."
- **✗** "Em se tratando da capacidade de liquidar suas dívidas de curto e longo prazo, o índice ({valor}) apresenta-se abaixo da unidade. Caso a liquidez corrente seja adequada, isso pode indicar que o endividamento está alocado majoritariamente no longo prazo — o que é positivo para o negócio."

### Endividamento Geral
- **Sempre** "Quanto à análise de estrutura de capital, a empresa opera com {valor} de dependência de capital de terceiros no financiamento do ativo. Operar alavancado não é problema desde que haja prazo — quanto mais alongado o perfil, mais barato o capital."

### Composição da Dívida
- **✓** "A maior parte do endividamento tem viés de longo prazo ({valor}), contribuindo para reduzir o custo do capital financiado e ampliar o fôlego financeiro das operações."
- **✗** "A maior parte do endividamento tem viés de curto prazo ({valor}), o que contribui para onerar o custo do capital financiado e reduzir o fôlego financeiro das operações."

### Grau de Imobilização CP
- **✓** "Quanto ao grau de imobilização do patrimônio líquido, nota-se que o capital próprio foi suficiente para cobrir as aplicações efetuadas no ativo permanente ({valor}), evidenciando adequada alocação de recursos."
- **✗** "Quanto ao grau de imobilização do patrimônio líquido, o capital próprio não foi suficiente para cobrir as aplicações efetuadas no ativo permanente ({valor}), evidenciando dependência de capital de terceiros para financiar ativos fixos."

### Grau de Imobilização RNC
- **✓** "Considerando os recursos não correntes (PL + PNC), a cobertura do ativo permanente ({valor}) mostra-se adequada, sem necessidade de recorrer ao capital de curto prazo."
- **✗** "Considerando os recursos não correntes (PL + PNC), a cobertura do ativo permanente ({valor}) é insuficiente, indicando que a empresa recorreu ao capital de curto prazo para financiar ativos de longo prazo."

### DL / EBITDA
- **✓** "Consolidando a análise financeira mediante o ratio Dívida Líquida/EBITDA de {valor}, a empresa apresenta baixo fator de risco e elevada capacidade de solvência."
- **⚠** "O ratio Dívida Líquida/EBITDA de {valor} indica risco moderado, demandando atenção ao ritmo de geração de caixa frente ao endividamento."
- **✗** "O ratio Dívida Líquida/EBITDA de {valor} sinaliza elevado fator de risco e possível insolvência, indicando que a geração de caixa é insuficiente frente ao endividamento total."

### Margens (frase única agregada)
- **Sempre** "No que concerne à avaliação econômica, a empresa apresenta margem bruta de {MB}, margem operacional de {MO} e margem líquida de {ML}."

### ROI
- **Com lucro** "Avaliando conjuntamente DRE e BP, o retorno sobre os investimentos totais (ROI) é de {valor}, com tempo de recuperação (payback) de {anos} anos."
- **Com prejuízo** "A empresa apresenta prejuízo líquido no período, inviabilizando o cálculo do payback sobre os ativos totais."

### ROE
- **✓** "Podemos concluir sobre a total cobertura do custo de oportunidade do capital — o rendimento líquido gerado aos investidores ({valor}) supera o rendimento real dos Títulos do Tesouro Nacional (14,34%), evidenciando geração de valor econômico."
- **⚠** "A empresa aufere lucro, porém o retorno sobre o capital próprio ({valor}) não supera o rendimento real dos Títulos do Tesouro Nacional (14,34%), sinalizando destruição de valor econômico para os acionistas."
- **✗** "A empresa apresenta prejuízo no período, com ROE negativo ({valor}). De nada adianta auferir receita se não há geração de valor — o capital estaria melhor alocado em renda fixa."

---

## Badges de Diagnóstico

| Badge | Cor | CSS class |
|---|---|---|
| ✓ Adequado | Teal | `.badge-ok` |
| ⚠ Atenção | Amber | `.badge-warn` |
| ✗ Crítico | Rose | `.badge-crit` |

---

## Setas de Tendência

Exibidas entre períodos consecutivos. A direção é orientada pelo que é "melhor" para cada indicador:

| Indicador | ↑ é... |
|---|---|
| Liquidez Imediata | Ruim (mais dinheiro parado) |
| Liquidez Corrente | Bom |
| Liquidez Seca | Bom |
| GDE | Ruim (mais dependência) |
| Liquidez Geral | Bom |
| Endividamento Geral | Neutro |
| Composição da Dívida | Ruim (mais CP) |
| Grau de Imobilização CP | Ruim |
| Grau de Imobilização RNC | Ruim |
| DL / EBITDA | Ruim |
| Margens | Bom |
| ROI | Bom |
| ROE | Bom |

Seta colorida: verde quando a tendência é favorável, vermelha quando desfavorável, cinza quando neutra ou variação < 1%.

---

## Lógica JS (estrutura modular)

```
calcIndicators(inputs)          → objeto com todos os 15 indicadores calculados
diagnoseBadge(indicator, value) → 'ok' | 'warn' | 'crit' | 'neutral'
diagnoseText(indicator, value, allValues) → string com a frase dinâmica
trendArrow(indicator, prev, curr) → '↑' | '↓' | '→' + cor
renderResults(periods, results)  → atualiza o DOM da tabela de resultados
```

Toda a lógica de cálculo e diagnóstico é pura (sem efeitos colaterais), facilitando testes manuais no console.

---

## O que está fora do escopo

- Exportação para PDF ou Excel
- Persistência de dados (localStorage ou backend)
- Comparação entre empresas diferentes
- Gráficos ou visualizações (além das setas de tendência)
- Integração com o `render.js` ou com o pipeline de matérias
