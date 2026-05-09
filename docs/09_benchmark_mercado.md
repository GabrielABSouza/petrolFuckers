# Benchmark de mercado — carbono, transição energética e decisão acionável

> Data: 09/mai/2026  
> Objetivo: entender soluções que transformam dados ambientais/carbono em decisão para empresas, governos e coletivos, e identificar o espaço de diferenciação da nossa proposta para a PID.

## 1. Leitura do nosso ponto de partida

A documentação atual aponta para uma oportunidade clara: a PID já entrega exploração geográfica, mas não entrega uma camada de decisão. Ela mostra camadas de infraestrutura, energia, indústria e hidrogênio; não entrega ranking, recomendação, simulação, score, exportação estruturada ou relatório acionável por persona.

### Dados locais já disponíveis

| Base | Arquivo | Granularidade | Estrutura | Uso direto no MVP |
|---|---:|---|---|---|
| ANEEL SIGA geração | `data/raw/ANEEL_SIGA_empreendimentos-geracao.csv` | Empreendimento | 25.407 registros; CSV `;`; decimal brasileiro; coords, fonte, fase, potência, município | Oferta renovável, pipeline, mismatch energia x indústria |
| ANEEL SIGET linhas | `data/raw/ANEEL_SIGET_linhas-transmissao.csv` | Linha/subestação origem-destino | 1.160 registros; tensão, extensão, status, UFs | Proximidade/conectividade elétrica |
| ANEEL SIGET subestações | `data/raw/ANEEL_SIGET_subestacoes.csv` | Equipamento de subestação | 2.305 registros; tipo, tensão, UF, status | Nó de infraestrutura elétrica |
| ANEEL SIGET projetos | `data/raw/ANEEL_SIGET_transmissao-projetos.csv` | Obra/módulo | 10.379 registros; situação, datas, receita, módulos | Pipeline de transmissão |
| ANP Biometano capacidade | `data/raw/ANP_Biometano_capacidade.csv` | Planta x mês | 492 registros; capacidade autorizada, processamento, utilização | Ociosidade de biometano e matchmaking industrial |
| ANP Biometano produção | `data/raw/ANP_Biometano_producao.csv` | UF x mês | 228 registros; produção mensal | Série de produção e validação macro |
| SAFMaps WFS | GeoServer público documentado em `docs/07_safmaps_integration.md` | Ponto/linha/polígono | GeoJSON; camadas de siderurgia, flaring, biomassa, logística e risco socioambiental | Diferencial ESG + indústria georreferenciada |
| IBGE | APIs SIDRA/GeoServer documentadas em `docs/08_ibge_dados.md` | Município/UF/setor | JSON e WFS; código IBGE como chave | `master_df` municipal para score multicritério |

### Estrutura analítica recomendada

O produto deve consumir os dados como duas famílias:

1. **Tabela municipal mestre**: uma linha por município (`cd_mun`), com colunas de energia, biometano, indústria, PIB, população, biomassa, infraestrutura e risco socioambiental.
2. **Camadas geoespaciais pontuais/lineares**: plantas industriais, plantas de biometano, linhas de transmissão, gasodutos, ferrovias, aeroportos, portos, áreas protegidas e polígonos de risco.

Isso favorece um MVP de score/recomendação: o usuário escolhe uma persona e um objetivo, ajusta pesos, e recebe top oportunidades com justificativas rastreáveis.

## 2. Mapa de mercado

O mercado não é homogêneo. Existem quatro famílias relevantes.

### A. Carbon accounting corporativo

Soluções focadas em calcular, auditar e reportar emissões corporativas de Escopos 1, 2 e 3.

| Solução | O que faz | Valor gerado | Similaridade com a nossa tese | Lacuna para nós explorarmos |
|---|---|---|---|---|
| [CarbonTech / CarbonCore](https://carbontech.eco/carboncore/) | Calcula pegada por pilares: energia, água, gás, transporte, alimentação, reciclagem, internet; conecta coletivos, empresas e setor público | Medição, monitoramento, compensação e engajamento via coletivos | Alta no discurso de transformação social e ação coletiva | Parece mais orientada a pegada residencial/coletiva e compensação; menos a decisão industrial locacional |
| [WayCarbon Ecosystem](https://waycarbon.com/solution/transition/ecosystem/) | Plataforma multimodular para descarbonização, risco climático, reporting e cadeia de fornecedores | Decisão robusta para empresas complexas e governos, com consultoria acoplada | Alta no Brasil e na ponte público/privado | Pode ser percebida como enterprise/consultoria; não como ferramenta pública e explorável da PID |
| [Carbon Hub](https://carbonhub.com.br/) | Inventário GEE, reporte ESG, descarbonização com MACC, MRV digital e créditos | Cobertura completa da jornada Net Zero no Brasil | Média; forte em conformidade e créditos | Menos posicionada em GIS industrial/powershoring |
| [Watershed](https://watershed.com/platform) | Mede, reporta e aciona descarbonização; fatores de emissão, lineage, benchmarks e IA | De compliance para eficiência operacional e estratégia | Média; transforma dado em ação | Foco corporativo global, não em clusters industriais brasileiros |
| [Persefoni](https://www.persefoni.com/product/carbon-accounting) | Carbon accounting auditável, Escopos 1-3, financiadas, supplier engagement e IA | Governança, transparência e reporte regulatório | Média | Não resolve localização industrial/infra pública |
| [Sweep](https://www.sweep.net/) | Centraliza dados ESG/carbono, reporting, fornecedores e priorização de ações | Sustentabilidade como performance, custo e risco | Média | Menos foco em mapa, território e política industrial |
| [Normative](https://normative.io/platform/) | Carbon accounting, PCF, supplier engagement, redução e CSRD | Cálculo granular e planos de redução | Média | Foco em empresa/cadeia de valor, não em política territorial |
| [Microsoft Sustainability Manager](https://www.microsoft.com/sustainability/microsoft-sustainability-manager) | Plataforma corporativa de dados ambientais, dashboards, reporting e Copilot | Integração enterprise e relatórios multi-framework | Baixa/média | Genérica e dependente de stack enterprise |

**Leitura de mercado:** segundo a [Verdantix Green Quadrant 2026](https://www.verdantix.com/venture/report/green-quadrant--enterprise-carbon-management-software-2026), o mercado de carbon management está convergindo: cálculo, data management e reporting viraram básicos. Os diferenciais estão indo para IA, produto/PCF e operacionalização da descarbonização. Isso reforça que um MVP só de dashboard ou inventário seria fraco.

### B. Pegada de produto, LCA e cadeia de suprimentos

Soluções que transformam dados de produto e fornecedor em pegada de carbono, hotspots e cenários de redesenho.

| Solução | O que faz | Valor gerado | O que podemos aprender |
|---|---|---|---|
| [CarbonChain](https://www.carbonchain.com/scenario-analysis) | Modela emissões de cadeias de commodities, fornecedores, rotas e cenários | Benchmark de fornecedores, cotação de baixo carbono, CBAM | Cenário + comparação é mais valioso que cálculo isolado |
| [Makersite](https://makersite.io/) | Product Lifecycle Intelligence: custo, carbono, compliance e risco de supply chain | Trade-offs de materiais, fornecedores e ecodesign | Score precisa explicar trade-off, não só dar nota |
| [Ecochain](https://ecochain.com/product/) | LCA/PCF automatizado com cenários, comparação e relatórios | Hotspot analysis e decisões de melhoria de produto | "Hotspot + ação recomendada" é o padrão de UX vencedor |
| [One Click LCA](https://oneclicklca.com/en-us/software/design-construction) | LCA para construção, carbono incorporado e comparação de alternativas | Decisão cedo no design, antes de travar custo | Simulação rápida antes de investimento é narrativa forte |

**Leitura para nós:** essa família não compete diretamente com a PID, mas ensina o formato de valor: comparar opções, mostrar hotspot, explicar o porquê e gerar relatório defensável.

### C. Governo, cidades e planejamento climático

Soluções que ajudam governos a montar inventários, planos climáticos, cenários e monitoramento.

| Solução | O que faz | Valor gerado | Similaridade com PID |
|---|---|---|---|
| [ClimateView](https://www.climateview.global/en/platform) | Plataforma para governos criarem inventários, cenários, políticas, dashboards e planos de transição | Transforma metas climáticas em planos monitoráveis | Alta na persona pública e em cenários |
| [ICLEI ClearPath 2.0](https://icleiusa.org/clearpath-2/) | Plataforma de ação climática para governos locais dos EUA, powered by ClimateView | Inventário, modelagem, metas, projetos e dashboards públicos | Alta como referência de governo local |
| [Google Environmental Insights Explorer](https://sustainability.google/progress/projects/environmental-insights-explorer/) | Dados de emissões prediais, transporte, potencial solar e clima para cidades | Baixa barreira de entrada para ação climática municipal | Média; usa dados geoespaciais para política pública |
| [Climate TRACE](https://climatetrace.org/about) | Inventário aberto de emissões por fonte/ativo usando observação direta, satélite e dados industriais | Transparência e accountability de emissões | Média; útil como inspiração de dado aberto e rastreabilidade |

**Leitura para nós:** aqui está o benchmark mais próximo para órgãos públicos. O padrão não é "ver mapa"; é "inventariar, simular, priorizar ação, acompanhar progresso e comunicar publicamente".

### D. Inteligência energética/geoespacial

Soluções que não são "carbon accounting", mas viram insumo decisivo para ações de descarbonização.

| Solução | O que faz | Valor gerado | Uso como inspiração |
|---|---|---|---|
| [TransitionZero](https://www.transitionzero.org/) | Software e dados abertos para modelagem de sistemas energéticos e cenários | Reduz tempo/custo de planejamento energético | Linguagem forte: tornar modelagem acessível e transparente |
| [Electricity Maps](https://www.electricitymaps.com/) | API de mix elétrico, intensidade de carbono, preços, carga e previsões | Aplicações em tempo real e decisão por intensidade de carbono | Sinal temporal de carbono pode enriquecer score energético futuro |
| [WattTime](https://watttime.org/data-science/data-signals/) | Dados de emissões marginais da rede para deslocar carga e maximizar emissões evitadas | Otimização operacional por local e horário | Conceito de "emissionalidade" é útil para evitar projetos bonitos mas pouco adicionais |
| [Kayrros Methane Watch](https://www.kayrros.com/products-methane-watch-for-regulators/) | Monitoramento geoespacial/satélite de superemissores de metano para reguladores | Fiscalização e melhoria de inventários | Mostra valor de ativo georreferenciado + ação regulatória |

## 3. Onde a nossa solução pode ser diferente

O espaço mais promissor não é disputar com plataformas de inventário GEE. Elas são robustas, caras, corporativas e focadas em dados internos de empresas. Nossa oportunidade é outra:

> **Transformar dados públicos territoriais da transição energética brasileira em recomendações acionáveis para decisão industrial e política pública.**

### White space defensável

| Dimensão | Mercado atual | Nossa oportunidade |
|---|---|---|
| Unidade de análise | Empresa, produto, fornecedor, cidade | Município, cluster industrial, planta, infraestrutura |
| Pergunta respondida | "Quanto eu emito?" | "Onde devo agir/investir primeiro?" |
| Dados principais | ERP, contas, fornecedores, surveys, fatores de emissão | ANEEL, ANP, IBGE, SAFMaps, PID, infraestrutura, risco socioambiental |
| Output típico | Inventário, relatório, dashboard, disclosure | Ranking, recomendação, mapa de oportunidade, justificativa, relatório por local |
| Persona | Sustentabilidade, financeiro, compliance | Investidor industrial, gestor estadual, planejador público, indústria intensiva |
| Diferencial social | ESG/reporting | Transição justa: risco socioambiental + emprego + território + energia limpa |

## 4. Implicações para o MVP

### Posicionamento recomendado

Evitar: "calculadora de pegada de carbono" ou "dashboard ESG".

Usar: **radar de oportunidades de descarbonização industrial para o Brasil**.

Uma formulação possível:

> "A PID mostra onde estão os recursos. Nossa camada mostra onde agir primeiro, por que aquele lugar importa e qual decisão pública ou privada destrava mais descarbonização com mais benefício social."

### Funcionalidades que o benchmark sugere

1. **Score explicável** por município/cluster, com pesos ajustáveis.
2. **Comparação lado a lado** entre localidades candidatas.
3. **Hotspots e recomendações**, não apenas camadas de mapa.
4. **Relatório acionável** para uma persona: investidor ou gestor estadual.
5. **Rastreabilidade das fontes** em cada nota: ANEEL, ANP, IBGE, SAFMaps.
6. **Camada de transição justa**: risco socioambiental, renda, IDH, trabalho escravo/infantil, áreas protegidas.

### Narrativas de pitch mais fortes

| Narrativa | Benchmark que sustenta | Por que funciona |
|---|---|---|
| "De mapa para decisão" | ClimateView, ClearPath, Watershed | Mostra evolução natural da PID |
| "De inventário para ação" | CarbonTech, WayCarbon, Normative, Sweep | Alinha com mercado, mas evita ser genérico |
| "Hotspot + recomendação" | Ecochain, Makersite, CarbonChain | Traduz dados complexos em decisão |
| "Transição justa por design" | SAFMaps + Climate TRACE + CarbonTech | Diferencia de carbon accounting corporativo |
| "Benchmark territorial de clusters" | TransitionZero + PID + Atlas E+ | Casa com powershoring e política industrial |

## 5. Recomendação objetiva

O MVP deve mirar **uma camada de inteligência sobre a PID**, não uma plataforma ESG completa.

Melhor escopo:

> **Score e recomendador de oportunidades de descarbonização industrial por município/cluster, começando por biometano + indústria intensiva em gás, com camada de risco socioambiental.**

Por quê:

- Usa dados reais já disponíveis: ANP biometano, ANEEL, SAFMaps, IBGE.
- Evita competir com gigantes de carbon accounting.
- Responde a uma decisão concreta: onde conectar oferta de energia limpa/biometano com demanda industrial.
- Gera valor para empresa e governo ao mesmo tempo.
- Tem narrativa social: redução de emissões, aproveitamento de infraestrutura existente, desenvolvimento regional e cautela socioambiental.

## 6. Próximas perguntas para fechar estratégia

1. A persona principal será **investidor industrial** ou **gestor estadual**?
2. O MVP vai priorizar **biometano-indústria** ou **score amplo de powershoring**?
3. A demonstração final será uma comparação de localidades ou um fluxo de recomendação com input do usuário?
4. O relatório final precisa sair como PDF/HTML exportável ou basta tela + pitch?
5. Quais fontes entram no primeiro corte: ANEEL + ANP + SAFMaps + IBGE, ou excluímos IBGE para acelerar?
