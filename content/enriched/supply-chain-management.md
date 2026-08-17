---
title: Supply Chain Management
slug: supply-chain-management
description: Evolução da logística ao gerenciamento da cadeia de suprimentos, processos de negócio integrados, outsourcing, parcerias estratégicas e ferramentas de gestão de suprimentos.
status: complete
color: purple
---

> [!SUMMARY]
> Supply Chain Management é a gestão integrada dos fluxos de materiais, informações e finanças entre fornecedores, indústria e clientes, com o objetivo de criar valor ao cliente e reduzir o custo logístico total. O aluno precisa dominar: a evolução da logística até o SCM (4 fases), os trade-offs de custo (transporte x estoque x nível de serviço), a fórmula do Custo Logístico Total (CLT), os modais de transporte e Incoterms, os arranjos de distribuição física (milk run, cross-docking, transit point, condomínio industrial), os sistemas de TI (ERP, MRP, S&OP, SCOR, WMS, TMS), os modelos de produção (MTO, MTS, ETO) e os princípios de ESG/Green Supply Chain Management (GSCM).

## Módulo I – História e Evolução da Logística Empresarial à Cadeia de Suprimentos

### Origem militar da logística

Até o final da década de 40, "logística" era um termo predominantemente militar. Antoine-Henri Jomini, oficial do exército de Napoleão Bonaparte, citou o termo em sua obra *Précis de l'art de la guerre* (1837-8), estruturando cinco elementos fundamentais para deslocamento de tropas, invasões e manutenção de territórios conquistados: (1) Estratégia, (2) Grandes táticas, (3) Logística, (4) Engenharia e (5) Táticas menores.

> [!KEY]
> **Frase-símbolo da disciplina:** "Guerreiros amadores discutem estratégia, guerreiros profissionais estudam logística." — Tom Clancy, escritor e historiador norte-americano especializado em temas militares.

- A invasão da Normandia (Dia D) aplicou princípios logísticos descritos por Jomini.
- O Plano Marshall, que reconstruiu a Europa após a 2ª Guerra, foi uma notável aplicação da logística.
- A partir dos anos 50, a corrida espacial (URSS x EUA) trouxe novas técnicas, como o método PERT (Program Evaluation and Review Technique), desenvolvido para viabilizar o Projeto Polaris — um foguete com milhares de componentes produzidos por centenas de fabricantes em diferentes estados americanos.
- Durante a Segunda Guerra, dos cerca de 18.000.000 de militares americanos mobilizados, apenas ~3.000.000 estavam na linha de frente; os 15.000.000 restantes atuavam em suprimento e apoio.

> [!EXAM]
> As **5 classes de suprimento militar** (exército americano), em ordem de prioridade, são um ponto de atenção frequente:
> 1. **Classe 1** — subsistência (água, comida, medicamentos básicos, itens de conforto) — a mais importante.
> 2. **Classe 2** — roupas e materiais de higiene/limpeza, adequados ao clima de operação.
> 3. **Classe 3** — combustíveis, óleos e lubrificantes para máquinas e veículos.
> 4. **Classe 4** — carvão, gás natural, combustíveis de aquecimento, materiais de construção e fortificação.
> 5. **Classe 5** — munições, explosivos, bombas, detonadores, foguetes, mísseis.

### Definição contemporânea de logística

O CSCMP (Council of Supply Chain Management Professionals, ex-CLM), maior referência mundial em cadeia de suprimento, define logística como:

> [!KEY]
> **Logística (CSCMP):** "a parte da administração da cadeia de suprimento que planeja, implementa e controla, de forma eficiente e eficaz, o fluxo direto e reverso e a armazenagem de bens, serviços e informações relacionadas, entre um ponto de origem e um ponto de consumo, com o objetivo de atender aos requisitos do cliente."

São atribuições da área de logística: (1) gerenciar informações sobre necessidades e demandas de clientes, (2) controlar o atendimento de pedidos e (3) manter o rastreamento das entregas e pagamentos correspondentes.

A logística também pode ser vista como quatro pilares interdependentes: **Infraestrutura, Cadeia de suprimentos, Tecnologia e Pessoas**.

### Os quatro subprocessos logísticos

> [!KEY]
> **Os 4 subprocessos logísticos:**
> 1. **Logística de entrada / inbound** — interações e fluxos entre a organização e seus fornecedores.
> 2. **Logística interna / operações internas** — fluxos de materiais, dados e estoques em processo nas linhas produtivas.
> 3. **Logística de distribuição / outbound** — fluxo de produtos acabados do armazém até a entrega ao cliente, incluindo processamento de pedidos.
> 4. **Logística reversa** — fluxos inversos de produtos ou subprodutos entre clientes e organização (recolhas, reciclagem, "logística verde").

A distribuição física costuma receber maior atenção porque, na percepção do cliente final, é a etapa que mais impacta o nível de serviço percebido.

### Da logística ao gerenciamento da cadeia de suprimentos

Antes dos anos 90, a logística nas empresas brasileiras era vista como atividade operacional de menor importância — um "mal necessário" sem grande reflexo nas métricas de negócio, favorecida pela baixa competitividade (proteção contra importações, cartéis que preferiam subir preços a investir em produtividade).

> [!EXAM]
> A abertura de capital na década de 1990 trouxe **três condições fundamentais** que forçaram as empresas brasileiras a se confrontar com padrões mundiais de preço e qualidade: (1) efetivo controle inflacionário, (2) estabilização da moeda e (3) início do processo de globalização.

> [!KEY]
> **Evolução da logística — 4 fases** (adaptado de Wood, 1998):
> 1. Atuação sem integração, produtos padronizados, alta escala, estoques e tempos de entrega elevados, mão de obra pouco qualificada (pós-2ª Guerra).
> 2. Incorporação do **custo total** (e depois **Custo Total de Propriedade — TCO**): aceita-se aumento em um custo individual se houver redução compensatória no custo total (ex.: embalagem mais cara para reduzir custo de transporte via melhor cubagem).
> 3. Incorporação da **flexibilidade** para melhor atender ao cliente, com maior investimento em TI.
> 4. **Gerenciamento da cadeia de suprimento (SCM)** — a partir dos anos 90, integração física e estratégica dos processos, gerando menores custos, menos desperdício e mais valor percebido.

A logística agrega quatro tipos de valor ao cliente: **lugar, tempo, qualidade e conhecimento** sobre a cadeia produtiva — além de eliminar processos que não agregam valor percebido.

### Características de cadeias de suprimento eficientes

1. Redução do número de prestadores e fornecedores.
2. Redução de estoques, sem aumentar o risco de ruptura (stockout).
3. Desenvolvimento de fornecedores, com mais agilidade nas mudanças.
4. Proliferação de novos produtos/serviços em parceria entre clientes e fornecedores (integração externa).

O estabelecimento de **acordos de nível de serviço (SLA — Service Level Agreement)**, com penalidades e bonificações contratuais, tornou-se necessário.

### Trade marketing

O trade marketing desenvolve a interface entre canais de vendas e produtores, adaptando produtos, logística, marketing e políticas comerciais para encantar o cliente no ponto de venda. A distribuição física somada ao trade marketing dá corpo ao processo comercial.

### Outsourcing (terceirização)

Decisões *make or buy* (produzir ou comprar) devem avaliar: capacidade técnica própria e do fornecedor, requisitos de qualidade, prazo, custos, segurança, compliance e questões políticas.

> [!KEY]
> **Principais motivos para terceirizar:**
> - **Redução de custos** — contratar especialistas com maior produtividade em atividades de menor valor agregado (vigilância, limpeza, manutenção).
> - **Core business** — concentrar esforços nas competências centrais.
> - **Conhecimento** — acessar áreas de alta especialização (marketing digital, inovação, marketplace, last mile, picking automático) sem desenvolvê-las internamente.
> - **Escalabilidade** — expandir capacidade sem crescer custos fixos.
> - **Agilidade nas respostas ao mercado** — entrar rápido em mercados favoráveis sem comprometer capex.

### Aquisição pelo menor custo total

A análise de custo total identifica os custos mais relevantes de contratação/aquisição, manuseio e disposição de um bem/serviço (padronização, especificações, transporte, descarte, reciclagem, vida útil, substitutos, revenda). Benefícios: identificar custos elimináveis/transferíveis, comparar fornecedores além do preço, identificar custos reais de negociação e oportunidades de melhoria contínua.

### Parcerias e alianças estratégicas

> [!KEY]
> **Parceria x Aliança:** parceria é uma interação **vertical** (fornecedor/cliente); aliança é uma interação **horizontal** (fornecedor/fornecedor), buscando eliminar redundâncias na cadeia de valor. Relações ganha-perde vêm sendo substituídas por modelos baseados em confiança mútua, risco compartilhado e recompensas geradoras de vantagem competitiva.

### As três atividades primárias da logística

1. **Transporte** — características principais: custo, velocidade e segurança. Absorve, em média, de 1/3 a 2/3 dos custos logísticos da empresa.
2. **Manutenção de estoque** — reduz o hiato entre oferta e demanda; deve manter níveis baixos sem comprometer o abastecimento.
3. **Processamento de pedidos** — ocupa cerca de **50% do ciclo do pedido** (que vai da entrada do pedido até a entrega final). Apesar de custo relativamente menor que transporte e estoque, é atividade-chave por impactar diretamente o nível de serviço e o capital de giro.

### Funções logísticas

**Compras, aquisição e suprimentos (suprimento físico)** — abrange o fluxo de materiais *para* a empresa (o inverso da distribuição física; a distribuição física de uma empresa é o suprimento físico de outra). Atividades-chave: emissão de ordens de compra, transporte até a empresa, manutenção de estoques.

**Administração de materiais, estoques e armazenagem** — tarefas operacionais: recebimento, inspeção/conferência, separação, alocação em prateleiras, consolidação de pedidos. Vantagens de boa gestão de estoques: eficiência nas entregas, melhor uso de equipamentos, redução de custos (via menos desperdício, obsolescência, retrabalho).

**Programação, planejamento e controle da produção (PCP)** — define quando, quanto e onde produzir, além de acompanhar a aderência ao planejado.

> [!KEY]
> **O PCP responde a 4 perguntas:** Quando produzir? Quanto e onde produzir? Em que ordem produzir? A execução está de acordo com o planejamento?

**Distribuição, transportes e administração de tráfego (distribuição física)** — normalmente a atividade mais impactante em custo. Envolve gestão de estoque de produtos acabados, previsão de demanda (com marketing), empacotamento, garantias, atendimento ao cliente, transporte, abastecimento de CDs.

### Arranjos organizacionais de distribuição física

> [!KEY]
> **Milk run** — sistemática de coletas programadas usando um único veículo (normalmente de um operador logístico) para coletar em um ou mais fornecedores, em horários preestabelecidos, entregando no destino determinado. O estoque é transferido para o fornecedor; o cliente busca o que precisa quando precisa. Não é usado para longas distâncias. Origem: leiterias, onde cada fornecedor deixava o leite em local e horário predeterminados. Muito usado por montadoras automotivas no Brasil. Vantagens: redução de custo de transporte, monitoramento do fluxo, menos veículos na planta, agilidade no recebimento, redução de atrasos, menor ocupação de docas, menos pessoal de movimentação, melhor qualidade no manuseio, maior ocupação volumétrica.

> [!KEY]
> **Cross-docking (docagem cruzada)** — operação de rápida movimentação de produtos entre fornecedores e clientes: transbordo **sem estocagem**, chegada e saída no mesmo dia. Reduz custos de distribuição e mantém alto nível de serviço, com mais flexibilidade e menos complexidade nas entregas. Não há picking nem armazenagem — a carga recebida é imediatamente preparada para embarque. Exemplo: encomendas urgentes dos Correios (ECT).

> [!KEY]
> **Transit point** — sistemática semelhante a centros avançados de distribuição, mas **sem existência de estoques**. Baixo investimento, baixa manutenção, gerenciamento simplificado (sem picking nem estocagem).

> [!KEY]
> **Condomínio industrial** — fornecedores se instalam nas proximidades da indústria principal (geralmente uma montadora), abastecendo a linha de produção em tempo e sequência predeterminados. Exemplo clássico: fábrica de caminhões MAN em Resende (RJ).

### Logística reversa

Diz respeito às operações de retorno de materiais, sobras, produtos com defeito, embalagens, ou produtos regulados pela Política Nacional de Resíduos Sólidos (PNRS) — pilhas, baterias, lâmpadas, pneus, defensivos agrícolas. O processo logístico só termina quando embalagens/produtos são recolhidos, tratados, reaproveitados ou descartados.

**Canais reversos de revalorização:** retornar ao fornecedor, revender, recondicionar, reciclar, descartar (coletar → embalar → expedir).

### Missão da logística

> [!KEY]
> **Missão da logística:** disponibilizar o produto **certo**, na quantidade **certa**, no lugar **certo**, no tempo **certo**, ao mínimo custo possível.

### Definição de Supply Chain Management

> [!KEY]
> **SCM** é o conjunto de atividades e processos de gerenciamento de fluxos de bens, serviços, dados financeiros e operacionais entre os agentes da cadeia produtiva e os consumidores finais, para obter vantagens competitivas e agregar valor. Sua finalidade é unir os objetivos de todas as empresas de uma cadeia e sincronizar suas atividades na busca por resultados.

O fluxo de SCM envolve, simultaneamente: **fluxo de materiais** (sub-fornecedor → fornecedor → fábrica → distribuidor → varejista → consumidor), **fluxo financeiro** (sentido inverso) e **fluxo de informações/decisões** (sentido da demanda, sentido da decisão sistêmica, ligando suprimentos, produção, distribuição e consumo).

## Módulo II – Infraestrutura Brasileira, Custos Logísticos, Globalização e Internacionalização da Produção

### Globalização e internacionalização da produção

A globalização amplia oportunidades de produção de bens/serviços e escoamento (ex.: acordo Mercosul–União Europeia, 2020). Multinacionais fragmentam a produção geograficamente, aproveitando custo de mão de obra, economia em deslocamento, facilidades culturais/burocráticas e barreiras tarifárias/alfandegárias, ao mesmo tempo em que ajudam os países afiliados em desenvolvimento tecnológico, infraestrutura, empregos e intercâmbio cultural.

> [!EXAM]
> **Os 4 riscos da internacionalização** são um ponto clássico de prova:
> - **Risco Intercultural** — diferenças de idioma, religião, costumes, comportamento no trabalho e padrões de consumo.
> - **Risco Cambial** — flutuações adversas nas taxas de câmbio, reduzindo o valor dos ativos.
> - **Risco País** — instabilidade política, jurídica e econômica que afeta o mercado e a lucratividade.
> - **Risco Comercial** — prejuízo/fracasso por estratégias mal planejadas (mais grave em mercado estrangeiro).

### Incoterms 2020

> [!KEY]
> **Incoterms** são as 11 regras internacionais de comércio que definem responsabilidades de vendedor e comprador quanto a transporte, seguro e riscos:
> 1. **EXW** (Ex Works / Na Origem) — vendedor disponibiliza no local; comprador contrata transporte e seguro. Todos os modais.
> 2. **FCA** (Free Carrier / Livre no Transportador) — vendedor entrega ao transportador indicado; risco passa ao comprador na entrega. Todos os modais.
> 3. **FAS** (Free Alongside Ship / Livre ao Lado do Navio) — vendedor entrega ao lado do navio no porto. Modal marítimo.
> 4. **FOB** (Free On Board / Livre a Bordo) — vendedor carrega a bordo; risco passa ao comprador a partir daí. Modal marítimo.
> 5. **CPT** (Carriage Paid To / Transporte Pago Até) — exportador paga o transporte até o destino; riscos do comprador a partir do transporte. Todos os modais.
> 6. **CIP** (Carriage and Insurance Paid To) — vendedor cobre custos e riscos até o destino. Todos os modais.
> 7. **CFR** (Cost and Freight / Custo e Frete) — vendedor paga frete marítimo até o porto de destino; risco passa ao cruzar a amurada do navio. Modal marítimo.
> 8. **CIF** (Cost, Insurance and Freight) — como o CFR, mas o vendedor também paga o seguro. Modal marítimo.
> 9. **DAP** (Delivered At Place / Entregue no Local) — vendedor entrega pronta para descarga, sem obrigação de seguro. Todos os modais.
> 10. **DPU** (Delivered At Place Unloaded) — vendedor entrega e descarrega no destino. Todos os modais.
> 11. **DDP** (Delivered Duty Paid / Entregue com Direitos Pagos) — vendedor assume todos os custos e riscos, incluindo tributos. Todos os modais.

### Infraestrutura logística brasileira e custos logísticos

> [!EXAM]
> Números centrais sobre custo logístico no Brasil, muito cobrados:
> - Custo de transporte representa cerca de **60% dos custos logísticos totais** no Brasil (e até **70%** em alguns segmentos).
> - Os custos logísticos totais superam **12,0% do PIB brasileiro**, contra **7,6% nos EUA** — a operação brasileira é **58% mais onerosa** (ILOS, 2021).
> - Comparação CEL-COPPEAD: o estoque no Brasil chega a ser **86% mais caro** que nos EUA.
> - No Brasil existem mais de **70 tipos de tributos** (municipais, estaduais, federais). O que mais impacta a cadeia de suprimentos é o **ICMS**, com **27 legislações estaduais diferentes** (uma por Estado) e acordos bilaterais entre eles.

Fatores que encarecem a logística brasileira: infraestrutura de transporte/portuária/alfandegária deficiente, impostos em cascata, condições macroeconômicas desfavoráveis (alto custo tributário e de capital, inflação elevada), e a tentativa de otimizar modais aumentando a necessidade de estoque para transportar em lotes maiores. Nos EUA, por comparação: o modal rodoviário é usado majoritariamente para integração entre modais, há foco em bens elaborados, e cresce a participação de bens intangíveis na balança comercial.

Programas de concessão de portos, ferrovias, hidrovias e rodovias vêm melhorando a eficiência, especialmente para commodities de menor valor agregado.

### Modais de transporte

> [!KEY]
> **Os 5 modais de transporte:** Rodoviário, Ferroviário, Aquaviário, Dutoviário e Aéreo. A escolha considera capacidade, custo, velocidade, disponibilidade, frequência, confiabilidade e regularidade, cruzados com os atributos do produto (valor agregado, forma, volume/peso, perecibilidade, segurança, temperatura, periculosidade).

- **Rodoviário** — ~60% das cargas transportadas no Brasil; um dos mais usados no mundo. Compete com o aéreo em cargas pequenas/curtas distâncias (< 300 km) e com o ferroviário em grandes distâncias/cargas médias (< 25 toneladas). Mais adequado para coleta/entrega de última milha (*last mile*). Em 1950: ferrovias 29%, rodovias 38%, cabotagem 32%. A partir de 1957 (indústria automobilística no Brasil), o governo priorizou investimento rodoviário.
- **Ferroviário** — adequado a grandes distâncias e boa otimização de custos, útil para baratear exportação de commodities. Gargalo histórico: carga/descarga. Recuperação a partir da privatização (anos 2000), com investimentos recentes relevantes.
- **Aquaviário** — subdividido em marítimo (navegação de longo curso, entre países; e cabotagem, ao longo da costa/entre portos fluviais e costeiros) e hidroviário/interior (rios, lagos — produtos pesados, volumosos, baixo valor agregado, predominante no Norte e extremo Sul/Lagoa dos Patos). Brasil tem ~7.500 km de costa navegável. Baixo custo, grande capacidade, menor poluição — maior potencial de crescimento no Brasil. Classificação da carga portuária (Antaq): granel sólido (minério, grãos), granel líquido (combustíveis, óleos) e carga geral (siderúrgicos). **TEU** (twenty-foot equivalent unit) é a unidade padrão de contêiner de 20 pés.
- **Dutoviário** — transporta petróleo/derivados (oleodutos), gás natural (gasodutos), grãos e minério (mineirodutos), água (aquedutos). Maior oleoduto do mundo: **Druzhba** (Rússia–Bielorrússia, ramais para Polônia/Alemanha e Ucrânia/Hungria/Eslováquia/Rep. Tcheca, ~8.900 km). Maior gasoduto da América Latina: **Gasbol** (3.150 km total, 2.593 km em território brasileiro).
- **Aéreo** — menor tempo em trânsito em longas distâncias, mas custo elevado (última posição em volume transportado). Mais adequado para mercadorias de alto valor, perecíveis ou entregas emergenciais.

**Intermodalidade / multimodalidade** — uso combinado de mais de um modal, aproveitando as melhores características de cada um. No transporte multimodal, um único operador é responsável, frente ao embarcador, da origem ao destino final.

### Canais de distribuição

Canal de distribuição é o caminho que os produtos percorrem das empresas aos consumidores. **Intermediários:** distribuidores/agentes (compram do fabricante e revendem, com processamento de pedidos, armazenagem, crédito e treinamento), varejistas (vendem em pequenas quantidades ao consumidor final), atacadistas (compram em grande volume, ganham em escala) e brokers/corretores (remunerados por comissão, não manuseiam nem têm posse da mercadoria).

> [!KEY]
> **Propriedades dos canais:** **Extensão** (nº de intermediários entre fabricante e consumidor — canal nível 0 = venda direta, sem intermediários; nível 1 = com um varejista) e **Amplitude**: distribuição **exclusiva** (uma única empresa credenciada por região — produtos de alto valor/grifes), **seletiva** (mais de uma empresa por região, produtos que exigem treinamento de venda) e **intensiva** (máxima penetração de mercado — commodities e produtos de baixo valor agregado).

## Módulo III – Ferramentas e Fatores de Sucesso em Supply Chain Management

### Trade-offs (trocas compensatórias) na cadeia de suprimentos

> [!KEY]
> **Trade-off logístico** é a troca compensatória entre custos logísticos conflitantes: o aumento de um custo pode ser compensado pela redução de outro. O estudo dos trade-offs busca o ponto ótimo entre custo total mínimo e nível de serviço ótimo.

- **Trade-off do nível de serviço** — depende de transporte, armazenagem, gestão de estoques, processamento de pedidos e informação/produção. Quanto maior o nível de serviço, menor o custo de perda de vendas (mas maior o custo com transporte/estoque).
- **Trade-off do custo total** — analisa transporte, estoque, processamento de pedidos e armazenagem de forma **integrada**, não isoladamente. Estoque insuficiente gera perda de vendas, reduz nível de serviço e aumenta o custo logístico total.
- **Trade-off do estoque** — custo de transporte cai quando pontos de estoque ficam mais próximos/numerosos (lotes maiores), mas exige estocar mais ou por mais tempo. Mais pontos de estoque bem distribuídos aumentam o nível de serviço.

Os efeitos do trade-off são avaliados por impacto no **custo total** ou na **receita de vendas** — a melhora de eficiência ocorre quando a diferença entre receita e custo aumenta após a decisão.

> [!KEY]
> **Custo de oportunidade logístico** — custo associado à renúncia de rentabilidade por ter investido recursos em uma alternativa (ex.: estoque elevado) em vez de outra. Percebido sobretudo em operações com estoques altos (OPEX) ou ativos logísticos caros (CAPEX).

**Custo do excesso x custo da falta:** quanto maior o custo do excesso de um item (vs. custo da falta), menor deve ser o estoque de segurança; quanto menor o custo do excesso (vs. custo da falta), maior deve ser o estoque de segurança para evitar stockout. Indústrias tendem a produzir mais para estoque (cobrir incertezas de demanda); o varejo opera com estoques de segurança menores.

> [!EXAM]
> **Exemplo de análise de custo total/trade-off (Fornaciari et al., 2003)** — clássico de prova: a empresa Fabrica S.A. compara duas transportadoras para 10 lotes de 100 unidades do produto X (custo unitário R$ 100,00). Empresa "A" cobra R$ 4,00/lote, mas avaria 3 unidades por lote (perda de 3% do custo total, ou 30 unidades em 10 lotes). Empresa "B" cobra R$ 5,00/lote, sem avarias.
> - Diferença de custo de transporte: R$ 5,00 − R$ 4,00 = **R$ 1,00** por lote (1% do custo do produto).
> - Perda sistemática por lote da empresa "A": R$ 3,00 − R$ 1,00 = **R$ 2,00** de desvantagem líquida.
> - Conclusão: trocar para a empresa "B" é vantajoso — essa é uma **análise de custos incrementais (ou marginais)**.

### Custo Logístico Total (CLT)

> [!KEY]
> **Fórmula do Custo Logístico Total:**
> `CLT = CAM + CTRA + CE + CMI + CTI + CTRI + CDL + CDNS + CAD`
> Onde: **CAM** = armazenagem e movimentação de materiais; **CTRA** = transporte (todos os modais/intermodal); **CE** = embalagens; **CMI** = manutenção de inventários; **CTI** = tecnologia da informação; **CTRI** = tributos não recuperáveis; **CDL** = custos decorrentes de lotes; **CDNS** = custos decorrentes do nível de serviço; **CAD** = administração logística.
>
> Forma alternativa (agrupada por processo): `CLT = CLOGAba + CLOGGPla + CLOGDis` (custos logísticos do Abastecimento + da Planta + da Distribuição). O CLT **não** é a simples soma de custos individuais — é o resultado líquido dos trade-offs entre eles, e deve ser minimizado respeitando o nível de serviço definido.

**Elementos de custos logísticos** (visão detalhada): (1) armazenagem e movimentação, (2) manutenção de inventário, (3) transporte, (4) embalagens, (5) tecnologia da informação, (6) tributários, (7) decorrentes de lotes, (8) decorrentes do nível de serviço, (9) associados aos processos logísticos.

**Custos de manutenção de inventário** incluem: custo de oportunidade (remuneração do capital), custo do serviço de inventário (seguros e impostos), custo de risco (deterioração, obsolescência, quebra, extravio, furto/roubo). Motivos para manter estoque: incerteza de demanda e de fornecimento, economia de escala. Motivos para reduzir estoque: diversidade crescente de produtos, redução de ciclos de vida, elevado custo do capital.

**Custos de transporte** dividem-se em: **fixos** (depreciação, remuneração do capital, pessoal, seguro, IPVA, custos administrativos — variam em função do tempo) e **variáveis** (pneus, combustível, lubrificantes, manutenção, lavagem — variam em função da distância percorrida).

> [!KEY]
> **TCO (Total Cost of Ownership / Custo Total de Propriedade)** — ferramenta para entender os custos totais de aquisição de um bem/serviço de um fornecedor específico.
> - `IDF (Índice de Desempenho de Fornecedores) = (Custos de não conformidade + Preço de Compra) / Preço de Compra`
> - `TCO = Preço de Proposta × IDF`

### Fundamentos de custos e ponto de equilíbrio

> [!KEY]
> **Terminologia de custos:**
> - **Custo** — valor de bens/serviços consumidos na produção de outros bens/serviços.
> - **Despesa** — valor de bens/serviços **não** relacionados diretamente à produção, consumidos em um período (ex.: frete em uma indústria).
> - **Gasto** — valor de bens/serviços adquiridos pela empresa, direta ou indiretamente relacionados à produção.
> - **Perda** — valor de bens/serviços consumidos de forma anormal e involuntária (ex.: danos por sinistro).
> - **Custo fixo** — não varia com o volume de produção/transporte/armazenagem (ex.: aluguel do galpão, seguro do veículo, salário do almoxarife).
> - **Custo variável** — proporcional ao volume produzido/transportado/armazenado (ex.: embalagem, combustível, pneu, óleo lubrificante).

> [!KEY]
> **Ponto de Equilíbrio (break-even)** — ponto em que a receita operacional se iguala ao total de custos e despesas (Receita = Custo Total; Lucro = 0).
> - `Ponto de Equilíbrio Físico: PEF = CF / (P − CVU)` — onde CF = custo fixo, P = preço de venda unitário, CVU = custo variável unitário.
> - `Ponto de Equilíbrio Monetário: PEM = PEF × P`, ou `PEM = CF / (1 − (CV total / Vendas totais))`
> - `Margem de Contribuição: MC = (P − CVU) × Q` e `Margem de Contribuição Unitária: MCU = MC / Q = P − CVU`

> [!EXAM]
> **Exercícios resolvidos de ponto de equilíbrio (repetição do formato típico de prova):**
> - P = R$ 12, CVU = R$ 9, CF = R$ 300.000 → `PEF = 300.000 / (12−9) = 100.000 unidades`
> - P = R$ 7,5, CVU = R$ 5, CF = R$ 1.500 → `PEF = 1.500 / (7,5−5) = 600 unidades`
> - Vendas totais R$ 1.000.000, custos variáveis totais R$ 550.000, custos fixos R$ 292.500 → `PEM = 292.500 / (1 − 0,55) = 292.500 / 0,45 = R$ 650.000`

### Risco, incerteza e valor esperado

> [!KEY]
> **Risco x Incerteza:** em uma situação de **risco**, a distribuição de probabilidades dos eventos é **conhecida**; em situação de **incerteza**, essa distribuição **não é conhecida**. (Institute of Risk Management: risco é "a combinação da probabilidade de um evento e sua consequência, positiva ou negativa". Guia PMBOK: "evento ou condição incerta que, se ocorrer, tem efeito positivo ou negativo em escopo, prazo, custo ou qualidade".)

> [!KEY]
> **Valor Esperado E(x):** `E(x) = P(sucesso) × Impacto do sucesso + P(insucesso) × Impacto do insucesso`, onde `P(x) = nº de sucessos / nº de tentativas`.

> [!EXAM]
> **Exemplos resolvidos de valor esperado:**
> - Aposta em dado (prêmio R$ 4 se acertar, custo R$ 1 da aposta): `E(x) = 1/6 × (+R$4) + 5/6 × (−R$1) = −R$0,17` (perda média por aposta).
> - Multa de estacionamento (10% de chance de multa de R$ 200): `E(x) = 10% × (−R$200) + 90% × (R$0) = −R$20` (perda média por parada).

O **coeficiente de correlação de Pearson (r)** mede a relação entre duas variáveis quantitativas, entre -1 e 1: próximo de 1 = correlação linear positiva forte; próximo de -1 = correlação negativa/inversa forte; próximo de 0 = sem relação.

### Modelagem de processos e tecnologia da informação aplicada ao SCM

As empresas vêm substituindo modelos tradicionais por processos redesenhados com **IoT, Big Data, Inteligência Artificial e Blockchain**, buscando negócios centrados no cliente.

> [!KEY]
> **ERP (Enterprise Resource Planning)** — sistema central integrado que conecta todas as áreas da empresa (financeiro, contabilidade, contas a pagar/receber, folha, produção, estoques, distribuição, fornecedores, notas fiscais). Principais fornecedores: **Totvs, Oracle, SAP**. Implantação segue fases: identificação de necessidades → definição de escopo → avaliação de opções de mercado → avaliação de infraestrutura → migração de dados → transferência de tecnologia → testes → treinamento → suporte/atualizações.

> [!KEY]
> **MRP (Manufacturing/Material Resource Planning)** — módulo do ERP que calcula a quantidade de materiais necessários à manufatura, com base em demanda, lista de componentes e saldos de estoque, definindo o momento de reposição. **MRP II** amplia essa lógica para os impactos futuros da produção em engenharia e finanças.

> [!KEY]
> **S&OP (Sales and Operations Planning)** — processo de planejamento integrado, liderado pela alta administração, com reuniões periódicas (mensais) entre marketing, comercial, finanças, produção, logística e diretoria, avaliando histórico de vendas e tendências de mercado.
> **Fases do S&OP:** 1) Coleta de dados; 2) Planejamento de demandas; 3) Planejamento das operações de produção e logística; 4) Análise de cenários e tendências; 5) Reunião executiva.

> [!KEY]
> **Modelo SCOR (Supply Chain Operations Reference)** — modelo de referência (desenvolvido em 1996 pela PRTM, endossado pelo Supply Chain Council) para diagnosticar e comparar o desempenho operacional da cadeia de suprimentos, baseado em 4 pilares: modelagem de processos, medições de desempenho, melhores práticas e habilidades. **5 etapas do SCOR:** **Plan** (planejamento — avaliar insumos, riscos, lacunas de abastecimento), **Source** (abastecimento — avaliação de fornecedores, negociação, pedidos, recebimento), **Make** (fabricação — transformação de insumos em produtos/serviços), **Deliver** (entrega — cumprimento de cronogramas; pontualidade é um KPI central), **Return** (retorno — fluxo reverso, recolha de defeitos/embalagens/resíduos).

> [!KEY]
> **Estratégias de produção — MTO, MTS, ETO:**
> - **MTO (Make to Order)** — produto confeccionado após o pedido do cliente. Também chamado "gestão de suprimentos Pull" (sistema puxado). Vantagens: menos desperdício, mais eficiência, maior customização. Desvantagens: vendas irregulares, prazos longos, dependência de disponibilidade de matéria-prima. Uso típico: peças aeronáuticas, navegação, petróleo, equipamentos pesados.
> - **MTS (Make to Stock)** — grandes volumes produzidos para estoque, com base em previsão de vendas; exige padronização de processos, boa previsão e baixo custo operacional. Risco: erro de previsão gera encalhe ou ruptura.
> - **ETO (Engineer to Order)** — o projeto do produto é criado no momento do pedido, com envolvimento total da engenharia do fabricante; típico de bens de capital.

### Negócios eletrônicos B2B e B2C

> [!KEY]
> **B2B (Business to Business)** — transações entre empresas (ex.: fornecedor de insumo químico para indústria de fertilizantes). O e-commerce B2B centraliza fornecedores cadastrados em plataformas fechadas (acesso por senha), agilizando cotação e identificação de fornecedores. Movimentou ~**R$ 2,4 trilhões no Brasil em 2019**; 93% dos consumidores B2B preferem comprar online (Forrester Research).
>
> **B2C (Business to Consumer)** — atendimento direto ao consumidor final (ex.: Americanas, Submarino, Shoptime). O modelo **Omnichannel** permite comprar pelo e-commerce e retirar na loja física. Vantagens do B2C: menor investimento inicial que loja física, alta escalabilidade, ferramentas de gestão como **CRM**. Riscos: confiança do consumidor (fraude, segurança), concorrência com grandes players (Amazon, Alibaba), e necessidade de logística eficiente (estoques bem localizados evitando ruptura).

### E-procurement e e-sourcing

> [!KEY]
> **E-procurement** — aquisição de bens/serviços por meio eletrônico, com fornecedores cadastrados cumprindo requisitos técnicos/administrativos. Facilita planejamento de produção e programação logística. Facilidades: busca de fornecedores, banco de dados, melhor controle de estoques, redução de custos e burocracia, mais produtividade/transparência/velocidade, padronização, menos erros.
>
> **E-sourcing** — plataforma para identificar simultaneamente grupos de fornecedores por categoria de suprimento (em vez de cotar individualmente), unificando o processo com mais assertividade. Pode incluir **e-leilão** (leilão reverso) para avaliar melhores lances.
> **E-informing** — troca de informações entre vendedores e compradores, gerando banco de dados, sem necessariamente fechar negócio.

### Procurement — estratégias de contratação

> [!KEY]
> **Spend Analysis** — conjunto organizado de informações que responde: O que eu compro? De quem eu compro? Quando eu compro? Quanto eu gasto? — base para definir toda a estratégia de compras.
>
> **Instrumentos de negociação (abordagem estruturada do mercado):**
> - **RFI (Request for Information)** — usado para mapear o mercado, identificar fornecedores/produtos/processo de fabricação em diferentes geografias.
> - **RFQ (Request for Quotation)** — usado para coletar preços/ofertas válidas com intenção de contratação.
> - **RFP (Request for Proposal)** — similar ao RFQ, mas o fornecedor dá informações relevantes do processo/utilização/características do produto ou serviço.

### Tecnologia da informação aplicada à operação

- **Código de barras** — associa o produto a atributos (descrição, preço), permite remarcação dinâmica, baixa automática de estoque na venda, e reduz tempo de espera no checkout.
- **RFID (Radio Frequency Identification)** — etiqueta inteligente baseada em *transponders* (transmissor/receptor de microchip com antena), comunicando-se por radiofrequência.
- **WMS (Warehouse Management System)** — gerencia o endereçamento do armazém (rua, coluna, andar/apartamento).
- **TMS (Transportation Management System)** — dimensiona equipes de entrega, controla manutenção/custos de frota, otimiza roteirização, apoia auditoria de fretes e dá rastreabilidade/segurança à frota.

### Avaliação do desempenho para qualidade, produtividade e competitividade

> [!KEY]
> **KPIs (Key Performance Indicators)** medem o nível de serviço acordado em um SLA. Exemplos: custo dos suprimentos, saving em compras, prazo médio de pagamento, lead time de entregas, evolução de preços, pontualidade de entregas.
>
> **OFCT (Order Fulfillment Cycle Time)** — tempo do ciclo de atendimento do pedido, da emissão à entrega; especialmente relevante em e-commerce, mede a satisfação/experiência de compra.
>
> **OTIF / DIFOT (On Time In Full / Delivery In Full On Time)** — indicador mais abrangente que o nível de serviço de entrega simples; considera posicionamento/gestão de estoques, tempo de entrega, monitoramento de transportadora, tempo de manufatura, fornecimento de matéria-prima e a cadeia de varejo/distribuidores/atacadistas.

## Módulo IV – Sustentabilidade em Supply Chain Management

### ESG e a cadeia de suprimentos verde (GSCM)

> [!KEY]
> **GSCM (Green Supply Chain Management)** integra desenvolvimento industrial e proteção ambiental, aplicando as melhores práticas de **ESG (Environmental, Social and Governance)**. A gestão sustentável começa pelo **ambiente interno** (conscientização, legislação ambiental, tratamento de resíduos, uso de insumos e energia) e se propaga ao **ambiente externo**: a **empresa focal** (que define as regras) exige que sua cadeia de fornecedores adote a mesma política ambiental — inclusive fornecedores secundários. Exemplos: Samsung e Whirlpool realizam auditorias anuais em fornecedores, com possibilidade de eliminação em caso de não conformidade.
>
> Ações típicas de GSCM: gestão ambiental interna, desenvolvimento de fornecedores verdes, certificações ambientais, ecodesign, redesenho de embalagens, criação de indicadores, logística reversa e reciclagem.

> [!EXAM]
> **Citação de prova:** Larry Fink (CEO da BlackRock), carta de 2022: "A maioria dos stakeholders (...) agora espera que as empresas desempenhem um papel na descarbonização da economia global. Poucas coisas afetarão as decisões de alocação de capital (...) mais do que a eficiência com que você navegará na transição energética global."

### Logística verde

> [!KEY]
> **Logística verde** redesenha os processos logísticos (transporte, armazenamento, distribuição) para reduzir o impacto ambiental. Elementos: empacotamento verde, uso intensivo de recursos e reciclagem, carga/descarga verde, armazenamento verde, transporte verde, distribuição urbana verde, gestão de informação.
>
> **Logística reversa x Logística verde** — não são sinônimos: a logística **reversa** trata de devolução de produtos, remanufatura e retorno comercial/vendas; a logística **verde** trata de redução de embalagens, poluição sonora/do ar e impactos ambientais, com reciclagem e embalagens reutilizáveis como pontes entre as duas.
>
> **Etapas da logística verde:** compras (materiais ecológicos, seleção de fornecedores limpos), armazenagem/embalagens (recipientes recicláveis/reutilizáveis), transporte/distribuição (métodos mais limpos, consolidação de embarques), logística reversa e gestão de resíduos (descarte responsável, separação e preparação).

### Ecodesign

> [!KEY]
> **Ecodesign** — estratégia de gestão para ações sustentáveis na concepção, produção, distribuição e uso de produtos, reduzindo o uso de recursos naturais não renováveis. **Princípios:** materiais de baixo impacto ambiental; eficiência energética; qualidade e durabilidade (favorecendo a **economia circular** em vez da economia linear "adquirir–consumir–descartar"); modularidade (peças substituíveis, menos descarte); reaproveitamento/reutilização.

### Capacidade dinâmica da cadeia de suprimentos sustentável

Pontos centrais: gestão de relacionamento com clientes, gestão de serviço ao cliente, gestão de pedidos, gestão de demanda (sentido da informação, da ação interna e da resposta), gestão do fluxo de fabricação (processos mais limpos), desenvolvimento de produtos sustentáveis (reutilizáveis/recicláveis) e gestão de compras/fornecedores alinhada aos princípios de GSC.

### Impacto de crises pandêmicas e humanitárias

A pandemia de Covid-19 evidenciou os riscos de fechamento de fronteiras, portos e aeroportos, com forte impacto em fretes, combustíveis e armazenamento, e desequilíbrio entre demanda reprimida e disponibilidade de equipamentos na retomada. Outras crises que afetam cadeias globais: instabilidade política Rússia–Ucrânia, barreiras tarifárias EUA–China, e crises humanitárias no Oriente Médio e na África (governos ditatoriais, guerras civis).

## Perguntas de Recall

> [!RECALL]
> Quais são as 4 fases da evolução da logística até o SCM, segundo Wood (1998), e o que caracteriza cada uma?

> [!RECALL]
> Escreva a fórmula do Custo Logístico Total (CLT) por elementos de custo e explique o que significa dizer que ele "não é apenas um simples somatório".

> [!RECALL]
> Diferencie cross-docking, transit point e milk run quanto à existência de estoque e ao número de veículos envolvidos.

> [!RECALL]
> Um produto é vendido a R$ 20, tem custo variável unitário de R$ 14 e custo fixo total de R$ 90.000. Calcule o Ponto de Equilíbrio Físico (PEF).

> [!RECALL]
> Explique a diferença entre MTO, MTS e ETO, e dê um exemplo de produto adequado a cada estratégia.

> [!RECALL]
> O que diferencia logística reversa de logística verde? Dê um exemplo de atividade específica de cada uma.

> [!RECALL]
> Segundo o CSCMP, qual é a definição de logística? Cite as três atividades primárias e explique por que o processamento de pedidos é considerado atividade-chave mesmo tendo custo relativamente baixo.
