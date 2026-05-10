# Conteúdo a colar em `Dados-gerais-da-solução.docx`

> Quatro perguntas do template oficial. Texto pronto pra colar — revisar antes e enxugar onde fizer sentido pra equipe.

---

## 1. Qual é a viabilidade da solução?

O Radar PID foi construído para ser viável dentro das 37 horas do hackathon **e operacional em produção** ao final do evento. Sustenta-se em quatro frentes:

**Recursos técnicos.** A solução é fullstack:
- **Front-end** — aplicação React 18 + Vite 5 + Tailwind 3, hospedável em qualquer plataforma estática. Build de produção em ~1 segundo, ~566KB JS / 139KB gzip. Suporta tema claro e escuro alinhados à identidade institucional da PID.
- **Back-end** — API REST em Python 3.11 + FastAPI servindo o indicador real em memória (parquet pré-calculado, ~150KB carregado em ~1 segundo). Deploy via Docker no Railway.
- **Agente conversacional** — Gemini 3 Flash Preview com RAG nativo do Google (File Search) sobre os documentos internos do projeto, mais função custom que consulta o indicador. Memória de conversação dentro da sessão.

Custo recorrente em produção: tier gratuito do Railway cobre o backend; Gemini API roda em pay-per-use, com prompt caching. Estimativa para uso institucional moderado (~1.000 conversas/mês): R$ 30–60/mês.

**Recursos de dados.** O indicador foi construído a partir de fontes oficiais do governo brasileiro:
- ANEEL SIGA — 25.407 empreendimentos de geração;
- ANEEL SIGET — 1.160 linhas de transmissão, 2.305 subestações, 10.379 projetos;
- ANP Biometano — 492 registros de capacidade autorizada;
- SAFMaps GeoServer — 72 camadas WFS públicas;
- IBGE SIDRA + GeoServer — referência cartográfica e geometria municipal.

O snapshot atual cobre **1.938 municípios × 5 fontes (Solar, Eólica, Biometano, H2 Verde, Biomassa) = 9.690 scores MCDA** com flag explícita de `data_completeness` por linha (0–1). Distribuição observada: 38% das linhas com 100% das variáveis presentes; 9% com <60% — uma honestidade metodológica que diferencia o Radar de plataformas que silenciam ausência de dado.

**Recursos humanos.** A equipe tem cobertura nas competências exigidas pelo regulamento §3.4 (programação fullstack, design digital, análise de dados, conhecimento em transição energética). A próxima fase exigiria 2 desenvolvedores fullstack + 1 cientista de dados + 1 especialista em política pública — perfil compatível com bolsas de pesquisa do Instituto E+ ou parceria com universidades.

**Riscos mapeados e mitigações.**
- **Cobertura geográfica das fontes.** Variáveis estaduais (transmissão, biometano agregado por UF) hoje aplicadas como municipais — mapeado no roadmap v2 com mitigação por normalização intra-UF.
- **Heterogeneidade de formatos.** ANEEL SIGA usa CSV `;` em latin-1, sem `cd_mun` em todos os casos. Pipeline ETL incremental com chave temporária `municipio_normalizado + uf` resolve.
- **Score sem validação cruzada.** Hoje o ranking é hipótese metodológica não-validada contra dado real (REIDI/FNE-Verde/SUDENE). Mitigação registrada no roadmap como sprint pós-hackathon obrigatório.
- **LGPD.** Sem dado pessoal trafegado — o produto opera sobre agregados municipais. Risco zero quanto a §4.4 do regulamento.

---

## 2. Há soluções similares no mercado? Quais?

Sim, mas nenhuma cobre o mesmo espaço. Mapeamos quatro famílias relevantes para o tema "dados em decisão para transição energética":

**A. Carbon accounting corporativo.** Plataformas que calculam, auditam e reportam emissões de Escopos 1, 2 e 3. Ex.: WayCarbon Ecosystem, Watershed, Persefoni, Sweep, Normative, Microsoft Sustainability Manager, Carbon Hub e CarbonTech. Foco: empresa como unidade de análise, ESG/reporting, conformidade. Lacuna: não respondem "onde investir" no território — focam em "quanto a empresa emite". Segundo o Verdantix Green Quadrant 2026, esse mercado está convergindo (cálculo, data management e reporting viraram comoditizados), e os diferenciais migraram para IA, PCF e operacionalização.

**B. Pegada de produto e LCA.** Soluções como CarbonChain, Makersite, Ecochain e One Click LCA modelam emissões de produto e supply chain. Ensinam padrões de UX (cenário, hotspot, ação recomendada), mas não competem diretamente com a PID — são produto/cadeia, não território.

**C. Governo e planejamento climático.** ClimateView e ICLEI ClearPath 2.0 ajudam governos locais a montar inventários, simular cenários e priorizar políticas. Google Environmental Insights Explorer publica emissões prediais e potencial solar para cidades. Climate TRACE oferece inventário aberto por ativo via satélite. São o benchmark mais próximo da PID, mas: (i) ClimateView/ClearPath são pagas e voltadas a cidades dos EUA/Europa, (ii) Google EIE não cobre Brasil com profundidade, (iii) Climate TRACE é repositório de dados, não ferramenta de decisão.

**D. Inteligência energética e geoespacial.** TransitionZero (modelagem de sistemas energéticos), Electricity Maps (mix elétrico em tempo real), WattTime (emissões marginais), Kayrros Methane Watch (monitoramento de superemissores). Inspiram conceitos (emissionalidade, transparência, dado satelital), mas não fazem ranking de oportunidades industriais brasileiras.

**No Brasil.** A própria PID v2 do Instituto E+ é referência principal — entrega exploração geográfica, camadas de infraestrutura, energia, indústria e hidrogênio. Não entrega ranking, recomendação, score MCDA, agente conversacional especializado em incentivos públicos brasileiros, nem deploy operacional consultável em produção. WayCarbon e Carbon Hub atuam no país com foco corporativo. **Não encontramos no mercado uma camada de inteligência sobre dados públicos territoriais voltada a decisão de investimento industrial e política pública convergentes, com agente especializado em incentivos federais brasileiros.**

---

## 3. Quais são os seus diferenciais?

A proposta única de valor do Radar PID é:

> **Transformar dados públicos territoriais em recomendações acionáveis para decisão industrial e política pública, com indicador MCDA transparente e agente especializado em incentivos públicos brasileiros, sobre a única solução nacional que combina cobertura municipal completa, deploy operacional e explicabilidade radical.**

**Diferencial 1 — Indicador MCDA real, com flag explícita de qualidade do dado.** Cada município brasileiro recebe um score 0–1 por fonte de energia limpa (Solar, Eólica, Biometano, H2 Verde, Biomassa), calculado por média ponderada de três blocos (econômico 40%, social 30%, ambiental 30%). Ao contrário de modelos de "caixa-preta" (Random Forest, GWR, TOPSIS), a fórmula é defensável em uma frase e auditável por qualquer revisor técnico. **Cada linha do dataset traz uma coluna `data_completeness` (0–1)** indicando que fração das variáveis tinha valor real — quando ausente, não é silenciada com zero, mas explicitada. Esse rigor é raro em plataformas comerciais e essencial para uso em decisão pública.

**Diferencial 2 — Agente Copiloto especializado em incentivos públicos brasileiros.** Painel direito sempre aberto, conectado a um agente Gemini 3 Flash com duas capacidades:
- **Função custom `search_municipio`** — consulta a API REST do indicador em tempo real, retornando rankings filtrados por fonte, UF, completude.
- **File Search nativo** — RAG gerenciado pelo Google sobre cinco documentos internos do projeto (decisões de arquitetura, escopo, EDA empírica, camada de incentivos, persona). O agente responde perguntas metodológicas ("como o score é calculado", "por que essa fórmula", "quais limitações") com fundamento documental.

A memória da sessão preserva contexto entre turnos — o usuário pode dizer "e em PA?" depois de um ranking nacional e o agente entende a referência.

**Diferencial 3 — Camada de incentivos públicos como informação contextual, não score.** Para cada município, o produto exibe instrumentos públicos aplicáveis (REIDI, SUDENE, SUDAM, FNE, FNO, FCO, BNDES, leilões ANEEL, Transferegov, Obrasgov, Novo PAC, REDATA) com microcopy explícito de status: confirmado / proxy / elegibilidade preliminar. **Decisão deliberada: incentivos não compõem o score MCDA.** Somá-los introduziria viés cumulativo (município já bem ranqueado em viabilidade técnica viraria ainda mais bem ranqueado por ter REIDI). Lado-a-lado preserva interpretabilidade — o usuário sabe o que é técnica e o que é política.

**Diferencial 4 — Operacional em produção, não só protótipo.** Fim do hackathon: backend FastAPI deployado no Railway, agente Gemini ao vivo respondendo perguntas, 1.938 municípios consultáveis via API REST pública. Não é demo — é base de v2 que o Instituto E+ pode continuar evoluindo no dia 11 de maio.

**Diferencial 5 — Stack 100% open-source com custo operacional desprezível.** React, FastAPI, pandas, PostgreSQL (futuro), Docker, Railway free tier. Sem dependência de tile pago, sem API key proprietária além de Gemini (com prompt caching). Estimativa de custo mensal em fase MVP: R$ 30–60. Defensável em apresentação ao Instituto E+ como continuidade financeiramente viável.

**Diferencial 6 — Estética institucional, não SaaS genérico.** Identidade visual herdada da PID original (logo oficial, paleta navy-cinder-amber, tipografia Fraunces + Geist + JetBrains Mono), com toggle entre tema escuro (cockpit institucional) e claro (alinhado ao site público da PID). Texturas de grain noise + scan-lines + topo-dots reforçam a estética de ferramenta de decisão séria, não produto consumer. Sinaliza ao público técnico do E+ que esta é uma ferramenta para tomadores de decisão, não uma vitrine.

---

## 4. Quais os possíveis impactos?

**Impacto direto — economia de tempo e capital em decisão locacional.** Hoje, um investidor industrial gasta 4 a 6 meses em due diligence locacional para decidir onde instalar uma planta de hidrogênio verde, fertilizantes verdes, aço verde ou data center sustentável: levanta dados de oferta energética (ANEEL), infraestrutura de transmissão (ANEEL SIGET), demanda local (PIB, pop. ocupada), risco socioambiental (Terrabrasilis, Código Florestal), incentivos fiscais (SUDENE, REIDI), histórico de financiamento público (BNDES) — cada um em uma fonte diferente, formato diferente, granularidade diferente. O Radar PID consolida esses sinais em uma única tela em segundos, e o agente conversacional explica cada decisão de score com fundamento. Mesmo que a decisão final continue exigindo due diligence completa, **a triagem dos top-N candidatos pode reduzir o ciclo inicial em ~80% do tempo** e direcionar consultoria onde realmente importa.

**Impacto público — política industrial verde acelerada.** Para gestores estaduais e federais (MDIC, MME, secretarias de desenvolvimento econômico), o Radar inverte a pergunta: "Onde uma política pública teria mais chance de atrair capital privado?". Mostra municípios com alto potencial técnico mas baixa dinâmica econômica — exatamente os que mais se beneficiariam de transferências federais e instrumentos regionais. Apoia a tese do **Powershoring** e do **Consenso de Belém** ao tornar visível, em mapa interativo, onde a convergência entre energia limpa, demanda industrial e instrumentos públicos é mais densa.

**Impacto institucional — evolução natural da PID.** O Radar não substitui a PID; ela é a base de dados georreferenciados. O que adicionamos é uma **camada de inteligência** que transforma exploração em decisão. Para o Instituto E+, isso amplia o público da PID de "técnicos que sabem ler camadas GIS" para "tomadores de decisão que querem direção" — sem perder rigor metodológico, já que toda recomendação é rastreável até a fonte (ANEEL, ANP, IBGE, MME, BNDES) e o agente cita os documentos internos no qual fundamenta cada resposta.

**Impacto socioambiental — transição justa por design.** O bloco de critérios sociais está embutido no MCDA (peso 30%), e a flag `data_completeness` impede que municípios com dado ausente pareçam "ótimos" silenciosamente. Diferente de uma "calculadora de pegada de carbono" que mede só CO₂, o Radar PID embute a pergunta "esse projeto respeita o território?" no próprio score — e quando o dado social é ausente, sinaliza explicitamente. O roadmap v2 substitui os proxies sociais atuais por dados IBGE Cidades reais (IDH-M, PIB pc, taxa de desemprego, % população rural).

**Alcance potencial.** A PID v2 é referência pública para descarbonização industrial no Brasil. O Radar como camada complementar tem potencial de atender:
- ~500 investidores institucionais e fundos de impacto que avaliam capex em transição energética no Brasil;
- 27 secretarias estaduais de desenvolvimento econômico + ~100 municípios em zonas SUDENE/SUDAM com agenda de atração de investimento;
- Instituto E+ e parceiros (BNDES, MME, MDIC) como ferramenta de política industrial;
- Universidades e pesquisadores em economia política da transição energética, hoje sem ferramenta nacional aberta para análise comparativa de clusters.

**Métrica de sucesso de longo prazo.** O sucesso final não se mede pelo número de cliques na ferramenta — se mede pela **carteira de projetos efetivamente decididos** com auxílio do Radar (capex alocado, instrumentos públicos acionados, empregos gerados em municípios de baixa dinâmica econômica). A telemetria do produto deve registrar, com consentimento do usuário, qual recomendação levou a qual ação posterior — fechando o loop entre dado público e decisão real.

> **Nota de microcopy.** Toda comunicação do produto usa linguagem de **triagem e priorização**, não de garantia: "oportunidade candidata", "elegibilidade preliminar", "score de triagem", "priorizar estudo", "não substitui parecer técnico, jurídico ou financeiro" (regulamento §10.13).
