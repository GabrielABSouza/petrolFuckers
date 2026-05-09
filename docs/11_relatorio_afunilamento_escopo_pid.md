# Relatório de Afunilamento de Escopo — Radar PID

> **Data:** 09 mai 2026  
> **Objetivo:** documentar o processo de delimitação da solução, os dados que sustentam decisão e as escolhas que viabilizam um MVP defensável em 37h.

---

## 1. Por que fizemos essa delimitação

### 1.1 O problema inicial

A proposta original ("Radar PID de Investimentos em Energia Limpa") incluía:

- Score de atratividade territorial para municípios/clusters
- Demo com data centers de IA (soberania digital)
- Múltiplas dimensões: energia, rede, logística, demanda estratégica, risco socioambiental

**Risco identificado:** dependência de dados que não tínhamos confirmados (fibra, IXPs, latência, disponibilidade hídrica, temperatura, incentivos fiscais específicos para data centers).

### 1.2 A pergunta que motivou o afunilamento

> *"E se a solução fosse delimitada para os locais onde os nossos dados fossem capazes de sustentar?"*

Isso exigiu um mapeamento honesto: onde nossos dados respondem com precisão vs. onde precisaríamos de proxies ou dados externos não confirmados.

### 1.3 O objetivo da delimitação

| Objetivo | Resultado esperado |
|----------|-------------------|
| **Viabilidade técnica** | Garantir que todo o score seja calculável com dados disponíveis em até 37h |
| **Defensibilidade na banca** | Eliminar vulnerabilidades do tipo "e os dados de X?" |
| **Transparência metodológica** | Tornar explícito o que entra no cálculo e o que fica fora (por quê) |
| **Aderência ao desafio** | Manter foco na PID e transição energética, sem desvio para "política de IA" ou "consultoria B2B" |
| **Impacto social** | Priorizar substituição fóssil real e biometano ocioso (benefício direto a comunidades/produtores) |

---

## 2. Como chegamos aqui — o processo

### 2.1 Etapas do discovery

```
┌─────────────────────────────────────────────────────────────────────┐
│  FASE 1: INVENTÁRIO DE DADOS (docs/07_discovery_data_transicao_energetica.md) │
├─────────────────────────────────────────────────────────────────────┤
│  • Mapeamos 8 arquivos principais em data/raw e data/processed      │
│  • ANEEL SIGA: 25.407 empreendimentos de geração                    │
│  • ANEEL SIGET: 1.160 linhas, 2.305 subestações, 10.379 projetos    │
│  • ANP Biometano: 19 plantas, 492 registros mensais de capacidade   │
│  • Identificamos: base forte em OFERTA energética, fraca em DEMANDA │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  FASE 2: ANÁLISE DE RISCOS (docs/09_red_team_riscos_solucao_score_pid.md)    │
├─────────────────────────────────────────────────────────────────────┤
│  • Postura adversarial: onde a solução de score pode quebrar?       │
│  • Falha 1: impacto social indireto demais                          │
│  • Falha 2: persona "investidor industrial" pode soar desalinhada   │
│  • Falha 3: dados críticos faltam (demanda, logística, risco)       │
│  • Falha 4: falsa precisão do score (pipeline ≠ realidade)          │
│  • Conclusão: não é seguro apresentar como "plataforma para investidores"     │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  FASE 3: EXPLORAÇÃO ALTERNATIVA (docs/10_discovery_solucoes_fora_da_caixa.md)│
├─────────────────────────────────────────────────────────────────────┤
│  • 6 ideias fora da caixa com impacto social mais direto            │
│  • Bioenergia rural, resiliência municipal, saúde pública, etc.     │
│  • Viabilidade: bioenergia rural e resiliência municipal = ALTA     │
│  • Impacto direto > impacto indireto para hackathon                 │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  FASE 4: ANÁLISE DA PROPOSTA EXTERNA (consultor)                             │
├─────────────────────────────────────────────────────────────────────┤
│  • Proposta: "Radar PID de Investimentos em Energia Limpa"          │
│  • Demo: data centers de IA (soberania digital)                     │
│  • Risco identificado: dados extras não estruturados (fibra, IXP,   │
│    latência, hídrica, temperatura, incentivos DC)                   │
│  • Sugestão do consultor: "infraestrutura para vetores estratégicos,│
│    data center como demo de alto impacto"                           │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  FASE 5: DELIMITAÇÃO (este documento)                                        │
├─────────────────────────────────────────────────────────────────────┤
│  • Pergunta-chave: onde os dados PID SUSTENTAM decisão?             │
│  • Mapeamento honesto: sim vs. não vs. proxy                          │
│  • Foco: substituição fóssil + biometano ocioso (dados fortes)      │
│  • Exclusões explícitas por falta de dados                          │
│  • Score reduzido a 4 dimensões 100% cobertas pelos dados           │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Critérios de inclusão/exclusão

| Critério para INCLUIR no score | Critério para EXCLUIR do score |
|-------------------------------|------------------------------|
| Dado disponível em ANEEL SIGA, SIGET ou ANP | Dado que exige integração pesada não confirmada |
| Granularidade municipal ou estadual | Granularidade exige geocodificação massiva não disponível |
| Série temporal atualizada (2026) | Dado defasado ou anual demais |
| Não depende de proxy complexo | Dependência de múltiplos proxies sobrepostos |

---

## 3. O que nossos dados sustentam — tabela de oportunidades

### 3.1 Regiões com dados fortes de energia + infraestrutura

| Região/Cluster | Dados Disponíveis | Oportunidade Validada | Confiança |
|----------------|-------------------|----------------------|-----------|
| **Nordeste renovável** (BA, RN, PI, CE) | 57,2 GW eólica+solar operacional; 65,4 GW em pipeline; SIGET mostra transmissão | Powershoring solar/eólico + substituição de térmicas a óleo | **Alta** |
| **Vale do São Francisco** (Juazeiro-BA, Petrolina-PE) | Pipeline solar forte; UTE fóssil próxima; biometano ocioso em PE | Substituição fóssil + biometano industrial | **Alta** |
| **Borborema/Cariri** (Açu-RN, Cajazeiras-PB) | 2,8+ GW eólico operacional/pipeline; biometano potencial | Clusters de energia limpa + biocombustível | **Média/Alta** |
| **Minas Gerais Norte** (Buritizeiro, Arinos, Janaúba) | 10.821 MW pipeline renovável; maior concentração do país | Powershoring + atração industrial verde | **Alta** |
| **Polo fluminense** (RJ/Comperj) | 9.276 MW UTE fóssil (maior do Brasil); gás natural dominante | Substituição/offset fóssil com biometano/renováveis | **Alta** |
| **Sistemas isolados** (AM, RR, AP, etc.) | SIGA identifica locais fora do SIN | Renovação diesel → solar/biometano | **Média** |

**Fonte dos dados:** `docs/07_discovery_data_transicao_energetica.md` seções 3.1 (geração), 3.2 (UTE fóssil), 3.4 (biometano) + `data/processed/ANEEL_SIGA_resumo.json`

### 3.2 O que NOSSOS DADOS realmente respondem

| Pergunta | Resposta com dados PID | Confiabilidade | Fonte |
|----------|------------------------|----------------|-------|
| **Quanto MW renovável existe aqui?** | SIGA: operação vs. pipeline por município, fonte (UFV, EOL, UHE, etc.) | ✅ **Precisa** | ANEEL SIGA — potência outorgada em Kw |
| **Há transmissão para escoar?** | SIGET: linhas, subestações, tensão por UF; extensão em km | ✅ **Disponível** (proxy de prontidão) | ANEEL SIGET |
| **Quanta capacidade de biometano está ociosa?** | 795.957 m³/d ociosos; 19 plantas identificadas por estado | ✅ **Precisa** | ANP Biometano (capacidade vs. produção) |
| **Quanto fóssil existe para substituir?** | 3.113 UTEs, 31.359 MW fóssil; detalhado por combustível (gás, óleo, carvão) e UF | ✅ **Precisa** | ANEEL SIGA |
| **Quais municípios têm combo energia+infra?** | Cruzamento SIGA+SIGET+IBGE (malha municipal) | ✅ **Viável** | Join por UF + município |
| **Onde há risco socioambiental?** | ❌ **NÃO TEMOS** — apenas proxies (Amazônia, territórios) | ❌ Fraca | Dependência de Funai/Incra/MapBiomas |
| **Qual a demanda industrial local?** | ❌ **NÃO TEMOS** granular — apenas `agente_eda_findings.md` (manual) | ❌ Fraca | Dados agregados IBGE, não CNAE/planta |
| **Como está a logística (portos, ferrovias)?** | ❌ **NÃO TEMOS** dados estruturados | ❌ Ausente | Antaq não integrada |

**Explicação:** Essa tabela separa honestamente o que sabemos de fato do que precisaríamos assumir. Isso permite que o pitch declare limitações de forma transparente, o que aumenta credibilidade técnica.

---

## 4. A solução delimitada

### 4.1 Nome e tese

**Nome:** Radar de Oportunidades Energéticas — Priorização de Territórios para Transição

**Tese:** Municípios e clusters onde a interseção de **oferta renovável operacional**, **infraestrutura de transmissão** e **biometano ocioso** cria condições reais (não projetadas) para substituição fóssil ou atração de carga limpa.

### 4.2 Estrutura do score (4 dimensões com dados confirmados)

| Dimensão | Peso | O que mede | Fonte de dados | Por que incluímos |
|----------|------|-----------|----------------|-------------------|
| **Energia Limpa Disponível** | 40% | MW solar/eólica **operacional** (não pipeline); densidade por área/população | ANEEL SIGA (`DscFaseUsina = "Operação"`) | Dado mais robusto; evitamos falha do red team sobre "pipeline falso" |
| **Prontidão de Conexão** | 30% | Extensão de linhas >230kV; proximidade a subestação | ANEEL SIGET | Mostra viabilidade técnica de escoamento; não supõe investimento futuro |
| **Gás Renovável Ocioso** | 20% | Capacidade ociosa de biometano (autorizado − utilizado) no estado/município | ANP Biometano | Maior sinal de oportunidade real: 33,5% de uso, 66,5% ocioso |
| **Carga Fóssil Substituível** | 10% | MW de UTE fóssil operacional próxima | ANEEL SIGA | Âncora de impacto: substituição real de emissões |

**Soma dos pesos:** 100%  
**Todas as fontes:** confirmadas disponíveis em `data/raw/` e `data/processed/`  
**Granularidade:** municipal (com join via UF + município)

### 4.3 O que EXPLICITAMENTE excluímos (por falta de dados)

| Exclusão | Motivo | Risco se incluíssemos |
|----------|--------|----------------------|
| ❌ Previsão de demanda industrial futura | Dados de consumo são agregados; não temos CNAE/planta granular | Score vira "wishful thinking" |
| ❌ Custos de logística multimodal | Não temos Antaq estruturada; portos/ferrovias sem geocodificação | Proxy inválido, banca questiona |
| ❌ Análise de mercado consumidor | Demanda não mapeada espacialmente | "Onde está a cliente?" — sem resposta |
| ❌ Risco socioambiental detalhado | SIGA não tem coordenadas precisas de todas as usinas; Funai/Incra não integrados | Falsa precisão de "risco baixo/alto" |
| ❌ Disponibilidade hídrica, temperatura | Dados não baixados no projeto | Viola critério de "dados que sustentam" |
| ❌ Infraestrutura de telecom (fibra, IXP, latência) | Não confirmamos acesso a NIC.br/Anatel | Demo de data center inviável |

**Explicação:** Essa tabela de exclusões é tão importante quanto as inclusões. Ela demonstra consciência metodológica e protege contra críticas na banca do tipo "e os dados de X?"

### 4.4 Demo sugerido (com dados sustentados)

**"Vale do São Francisco: da fóssil à renovável"**

| Elemento | Dado PID | Narrativa |
|----------|----------|-----------|
| Juazeiro-BA | 3.262 MW pipeline solar confirmado em construção/não iniciada | "Energia limpa sendo construída aqui" |
| Petrolina-PE | 1.773 MW UTE fóssil (gás/óleo) operacional | "Térmica fóssil consumindo e emitindo" |
| Transmissão | SIGET mostra linhas 230kV+ na região | "Rede existe para escoar renovável" |
| Biometano | 795.957 m³/d ocioso em PE (estado) | "Gás renovável disponível para substituir parte da térmica" |

**O que mostramos:** "Aqui há energia limpa operacional/pipeline, infraestrutura existente e gás renovável ocioso para substituir geração fóssil — reduzindo emissões e gerando valor para produtores rurais de biometano."

**O que não prometemos:** "Aqui é o melhor lugar para um data center" (faltam dados de telecom, hídrica, temperatura)

---

## 5. Como as críticas do red team são mitigadas

| Crítica do Red Team (doc 09) | Como o escopo delimitado responde |
|------------------------------|-----------------------------------|
| **"Impacto social indireto demais"** | Foco em **substituição fóssil real** (saúde local, emissões evitadas) e **biometano ocioso** (economia para produtores rurais). Cadeia curta: `dado → priorização → ação de substituição → benefício ambiental/econômico` |
| **"Dados que não existem"** | **Zero dependência** de dados não confirmados. Tudo vem de ANEEL SIGA, SIGET, ANP, IBGE malha. |
| **"Parece consultoria B2B"** | Frame como **camada pública de priorização**: "onde o Brasil deve priorizar recursos públicos de transição?" — gestores públicos e formuladores, não apenas investidores privados |
| **"Score pode virar ranking de MW"** | Inclui **infraestrutura (SIGET)** e **biometano (ANP)**, não apenas energia. Dimensão de "carga fóssil substituível" âncora o impacto ambiental |
| **"Falsa precisão"** | Score com **4 dimensões apenas**, todas com fonte explícita; sem normalizações complexas; pesos declarados; transparência total |
| **"Persona investidor industrial"** | Expandido para: gestor público (onde priorizar recursos), formulador de política (onde incentivar), comunidade (onde há biometano ocioso para aproveitar) |

---

## 6. Limitações honestas (para declarar no pitch)

> *"Nosso radar mostra onde há condições técnicas reais de energia limpa, transmissão e biometano. Não incluímos ainda demanda industrial granular, logística multimodal ou risco socioambiental detalhado — esses são próximos passos para a camada, quando dados adicionais forem integrados."

**Por que isso é valorizado:**
- Demonstra consciência epistemológica (sabemos o que não sabemos)
- Protege contra perguntas técnicas que quebram o pitch
- Posiciona a solução como "camada v1.0" com roadmap claro

---

## 7. Resumo executivo do afunilamento

| Aspecto | Antes (proposta ampla) | Depois (delimitado) |
|---------|----------------------|---------------------|
| **Escopo** | Score de atratividade industrial + demo data centers | Score de priorização de transição + demo substituição fóssil real |
| **Dimensões** | 6+ (energia, rede, logística, demanda, risco, socioambiental) | 4 (energia operacional, transmissão, biometano, fóssil substituível) |
| **Dependências externas** | Alta (fibra, IXP, latência, hídrica, temperatura) | **Zero** — só dados PID confirmados |
| **Risco de "e os dados?"** | Alto | **Baixo** — todos os dados estão em mãos |
| **Impacto social** | Indireto (via investidor → indústria → emprego) | **Direto** (biometano → produtores; menos fóssil → saúde local) |
| **Viabilidade 37h** | Questionável | **Alta** — join SIGA+SIGET+ANP+IBGE é técnicamente simples |
| **Defensibilidade** | Média (muitas suposições) | **Alta** (transparência total de fontes e limitações) |

---

## 8. Próximos passos imediatos

1. **Validar join SIGA-SIGET-ANP-IBGE:** testar cruzamento por (UF, município)
2. **Definir thresholds:** o que é "alto" vs. "baixo" em cada dimensão?
3. **Criar mock do score:** 5-10 municípios com cálculo manual para validar lógica
4. **Preparar slide de limitações:** demonstrar consciência metodológica na apresentação

---

*Documento produzido como registro do processo de afunilamento para garantir transparência metodológica e viabilidade técnica do MVP.*
