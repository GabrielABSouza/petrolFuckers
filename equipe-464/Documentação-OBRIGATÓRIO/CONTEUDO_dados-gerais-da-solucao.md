# Conteúdo a colar em `Dados-gerais-da-solução.docx`

> Quatro perguntas do template oficial. Texto pronto pra colar — revisar antes e enxugar onde fizer sentido pra equipe.

---

## 1. Qual é a viabilidade da solução?

O Radar PID foi construído para ser viável dentro das 37 horas do hackathon e escalável depois. A viabilidade se sustenta em três frentes:

**Recursos técnicos.** O protótipo já está funcional como aplicação web de single-page (React 18 + Vite 5 + Tailwind 3). Roda em qualquer navegador moderno, faz o build em ~1 segundo e pode ser hospedado em qualquer plataforma estática (Vercel, Netlify, Hugging Face Spaces) sem custo. O mapa do Brasil é renderizado em SVG puro com `d3-geo` + `topojson-client` a partir do GeoJSON oficial dos 27 estados, simplificado para 226KB. Não há dependência de tiles pagos, API key ou backend — o que elimina custo recorrente e ponto único de falha para a versão de demonstração.

**Recursos de dados.** A solução já tem catalogadas e parcialmente baixadas as bases públicas que vão alimentar a versão completa: ANEEL SIGA (25.407 empreendimentos de geração), ANEEL SIGET (1.160 linhas + 2.305 subestações + 10.379 projetos), ANP Biometano (492 registros de capacidade), SAFMaps GeoServer (72 camadas WFS públicas, incluindo siderúrgicas e indicadores socioambientais) e IBGE SIDRA + GeoServer (9.526 camadas, ~50 features por município). Tudo gratuito, com licença aberta e API estável. A camada de convergência pública (REIDI, SUDENE, FNE, BNDES) usa fontes públicas oficiais com formato CSV/JSON acessível.

**Recursos humanos.** A equipe tem cobertura nas competências exigidas pelo regulamento §3.4 (programação, design digital, análise de dados, conhecimento em transição energética). A divisão de trabalho durante o hackathon foi: dois desenvolvedores no protótipo, design integrado ao código, pesquisa de fontes e benchmark feita em paralelo. A próxima fase (12 meses) exigiria 2 desenvolvedores fullstack + 1 cientista de dados + 1 especialista em política pública e energia — perfil compatível com bolsas de pesquisa do Instituto E+ ou parceria com universidades.

**Riscos mapeados e mitigações.**
- Volume de dados crescendo de 12 municípios mockados para 5.570 reais → migrar render do mapa para canvas (deck.gl) ou agregação por região no zoom-out.
- Bases públicas com formatos heterogêneos (CSV `;`, encoding latin-1, sem `cd_mun` em todos os casos) → ETL incremental por fonte com chave temporária `municipio_normalizado + uf`.
- Convergência entre dados confirmados, proxies e elegibilidade preliminar → microcopy explícito ("triagem", "elegibilidade preliminar, não é parecer jurídico") em todo o produto.

---

## 2. Há soluções similares no mercado? Quais?

Sim, mas nenhuma cobre o mesmo espaço. Mapeamos quatro famílias relevantes para o tema "dados em decisão para transição energética":

**A. Carbon accounting corporativo.** Plataformas que calculam, auditam e reportam emissões de Escopos 1, 2 e 3. Ex.: WayCarbon Ecosystem, Watershed, Persefoni, Sweep, Normative, Microsoft Sustainability Manager, Carbon Hub e CarbonTech. Foco: empresa como unidade de análise, ESG/reporting, conformidade. Lacuna: não respondem "onde investir" no território — focam em "quanto a empresa emite". Segundo o Verdantix Green Quadrant 2026, esse mercado está convergindo (cálculo, data management e reporting viraram comoditizados), e os diferenciais migraram para IA, PCF e operacionalização.

**B. Pegada de produto e LCA.** Soluções como CarbonChain, Makersite, Ecochain e One Click LCA modelam emissões de produto e supply chain. Ensinam padrões de UX (cenário, hotspot, ação recomendada), mas não competem diretamente com a PID — são produto/cadeia, não território.

**C. Governo e planejamento climático.** ClimateView e ICLEI ClearPath 2.0 ajudam governos locais a montar inventários, simular cenários e priorizar políticas. Google Environmental Insights Explorer publica emissões prediais e potencial solar para cidades. Climate TRACE oferece inventário aberto por ativo via satélite. São o benchmark mais próximo da PID, mas: (i) ClimateView/ClearPath são pagas e voltadas a cidades dos EUA/Europa, (ii) Google EIE não cobre Brasil com profundidade, (iii) Climate TRACE é repositório de dados, não ferramenta de decisão.

**D. Inteligência energética e geoespacial.** TransitionZero (modelagem de sistemas energéticos), Electricity Maps (mix elétrico em tempo real), WattTime (emissões marginais), Kayrros Methane Watch (monitoramento de superemissores). Inspiram conceitos (emissionalidade, transparência, dado satelital), mas não fazem ranking de oportunidades industriais.

**No Brasil.** A própria PID v2 do Instituto E+ é referência principal — entrega exploração geográfica, camadas de infraestrutura, energia, indústria e hidrogênio. Não entrega ranking, recomendação, simulação, score, exportação estruturada nem relatório acionável por persona. WayCarbon e Carbon Hub atuam no país com foco corporativo. Não encontramos no mercado uma camada de inteligência sobre dados públicos territoriais voltada a decisão de investimento industrial e política pública convergentes.

---

## 3. Quais são os seus diferenciais?

A proposta única de valor do Radar PID é:

> **Transformar dados públicos territoriais em recomendações acionáveis para decisão industrial e política pública, sobre uma camada de convergência com instrumentos públicos brasileiros que nenhuma outra solução cobre.**

**Diferencial 1 — Camada de convergência pública.** Para cada município, o Radar mostra quais instrumentos públicos podem destravar investimento (REIDI, SUDENE, SUDAM, FNE, FNO, FCO, BNDES, leilões ANEEL, Transferegov, Obrasgov, Novo PAC, REDATA). Esses instrumentos aparecem como badges agrupadas em 5 categorias (fiscal, financiamento, leilão, obra, política), com microcopy explícito ("elegibilidade preliminar, não é parecer jurídico"). Nenhuma plataforma de carbon accounting brasileira ou internacional cruza energia limpa com esses incentivos. É o nosso espaço defensável.

**Diferencial 2 — Score MCDA explicável e ponderável.** Cada município tem um score de 0–100 baseado em 6 critérios: energia renovável, acesso à rede, demanda local, segurança socioambiental, impacto regional, infraestrutura digital. A média ponderada é a fórmula deliberadamente escolhida (e não regressão geográfica, random forest ou TOPSIS) porque é defensável em uma frase, alinhada com o estado-da-arte das ferramentas comerciais (Watershed, ClimateView) e funciona com 12 municípios mockados ou 5.570 reais.

**Diferencial 3 — Duas lentes, três modos.** Um toggle de "Lente" troca o tom do produto entre **Investidor** (foco em due diligence, ROI, risco) e **Órgão público** (foco em justiça territorial, atração de capital, política industrial). Combinado com 3 modos de análise (Renováveis gerais / Data centers IA / Neoindustrialização verde), o usuário tem 6 visões distintas com pre-sets de pesos diferentes — sem ter que aprender metodologia.

**Diferencial 4 — Comparação como protagonista.** Quando o usuário ativa comparação, a sidebar inteira vira um painel "X vs Y" com confronto por critério em barras espelhadas, instrumentos comuns vs exclusivos, verdict automático em uma frase e crosshair pontilhado no mapa para o segundo município. Tabelas comparativas existem em outras ferramentas — comparação como **estado de primeira classe** do produto, não.

**Diferencial 5 — Copiloto contextual.** Painel direito sempre aberto, dedicado a um agente conversacional que lê o estado da aplicação (lente, modo, município, comparação) e responde com briefing automático, diferencia dado confirmado de proxy e elegibilidade preliminar, e foca explicitamente em incentivos públicos. Outras ferramentas têm chat genérico; o Copiloto PID é especializado em traduzir dado público brasileiro em próximo passo de due diligence.

**Diferencial 6 — Estética institucional, não SaaS genérico.** Aesthetic Bloomberg/IPEA/Atlas editorial, paleta navy + amber alinhada com a PID original, tipografia Fraunces + Geist + JetBrains Mono, hairlines em vez de cards arredondados. Sinaliza "ferramenta séria de decisão" para o público técnico do E+, não "produto consumer". É o que diferencia visualmente uma ferramenta que governos e investidores tomam a sério.

---

## 4. Quais os possíveis impactos?

**Impacto direto — economia de tempo e capital em decisão locacional.** Hoje, um investidor industrial gasta 4 a 6 meses em due diligence locacional para decidir onde instalar uma planta de hidrogênio verde, fertilizantes verdes, aço verde ou data center sustentável: levanta dados de oferta energética (ANEEL), infraestrutura de transmissão (ANEEL SIGET), demanda local (PIB, pop. ocupada), risco socioambiental (Terrabrasilis, Código Florestal), incentivos fiscais (SUDENE, REIDI), histórico de financiamento público (BNDES) — cada um em uma fonte diferente, formato diferente, granularidade diferente. O Radar PID consolida esses sinais em uma única tela em segundos. Mesmo que a decisão final continue exigindo due diligence completa, a triagem dos top-N candidatos pode reduzir o ciclo inicial em **80% do tempo** e direcionar consultoria onde realmente importa.

**Impacto público — política industrial verde acelerada.** Para gestores estaduais e federais (MDIC, MME, secretarias de desenvolvimento econômico), o Radar inverte a pergunta: "Onde uma política pública teria mais chance de atrair capital privado?". Mostra municípios com alto potencial técnico mas baixa dinâmica econômica — exatamente os que mais se beneficiariam de transferências federais e instrumentos regionais. Apoia a tese do **Powershoring** e do **Consenso de Belém** ao tornar visível, em mapa interativo, onde a convergência entre energia limpa, demanda industrial e instrumentos públicos é mais densa.

**Impacto institucional — evolução natural da PID.** O Radar não substitui a PID; ela é a base de dados georreferenciados. O que adicionamos é uma **camada de inteligência** que transforma exploração em decisão. Para o Instituto E+, isso amplia o público da PID de "técnicos que sabem ler camadas GIS" para "tomadores de decisão que querem direção" — sem perder rigor metodológico, já que toda recomendação é rastreável até a fonte (ANEEL, ANP, IBGE, SAFMaps, MME, BNDES).

**Impacto socioambiental — transição justa por design.** O critério de **segurança socioambiental** está embutido no MCDA (não opcional), com peso diferenciado por modo. Usa dados do SAFMaps para risco de trabalho escravo, infantil, IDH, áreas protegidas. Significa que regiões com forte potencial técnico mas alta vulnerabilidade social aparecem com score realista, não inflado. Diferente de uma "calculadora de pegada de carbono" que mede só CO₂, o Radar PID embute a pergunta "esse projeto respeita o território?" no próprio score.

**Alcance potencial.** A PID v2 já é a referência pública para descarbonização industrial no Brasil. O Radar como camada complementar tem potencial de atender:
- ~500 investidores institucionais e fundos de impacto que avaliam capex em transição energética no Brasil;
- 27 secretarias estaduais de desenvolvimento econômico + ~100 municípios em zonas SUDENE/SUDAM com agenda de atração de investimento;
- Instituto E+ e parceiros (BNDES, MME, MDIC) como ferramenta de política industrial;
- Universidades e pesquisadores em economia política da transição energética, hoje sem ferramenta nacional aberta para análise comparativa de clusters.

**Métrica de sucesso de longo prazo.** O sucesso final da solução não se mede pelo número de cliques na ferramenta — se mede pela **carteira de projetos efetivamente decididos** com auxílio do Radar (capex alocado, instrumentos públicos acionados, empregos gerados em municípios de baixa dinâmica econômica). A telemetria do produto deve registrar, com consentimento do usuário, qual recomendação levou a qual ação posterior — fechando o loop entre dado público e decisão real.
