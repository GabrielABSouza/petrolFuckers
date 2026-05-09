# Fontes de dados — PID e bases auxiliares

> Base: anexo `BANCO_DADOS_PID.docx` (22 fontes oficiais) + Atlas 2025 (referências bibliográficas) + PID v2.0.

> **Atualização (09/mai):** descoberto **SAFMaps com GeoServer público** — 72 camadas WFS sobre cadeia SAF brasileira, inclui `steel_plants` com dados de flaring e camadas socioambientais. Ver [`07_safmaps_integration.md`](07_safmaps_integration.md). É a fonte mais alavancada que temos hoje.
>
> **Atualização (09/mai, tarde):** consolidado o ecossistema **IBGE de dados abertos** (APISIDRA + GeoServer 9.526 camadas). Ver [`08_ibge_dados.md`](08_ibge_dados.md) — inclui especificação do dataframe mestre, 15 tabelas SIDRA prioritárias e indicadores derivados pra score MCDA.

## A PID em si

- **URL pública:** https://emaisenergia.org/pid
- **Versão:** 2.0 (out/2025)
- **Conteúdo declarado:** infraestrutura de transporte+energia, biomassa, indústrias existentes e em projeto, projetos de H₂, plantas de biometano, usinas eólicas/hidro/solar/biomassa.
- **Ação imediata da equipe no kickoff:** acessar e fazer inventário do que **já está lá** vs. o que está prometido vs. o que falta.

---

## Fontes territoriais e ambientais

| Fonte | URL | Uso provável |
|---|---|---|
| **BDiA — IBGE** | https://bdiaweb.ibge.gov.br/#/home | Geologia, geomorfologia, pedologia, vegetação 1:250.000. Base de qualquer análise espacial. |
| **MapBiomas** | https://brasil.mapbiomas.org/ | Cobertura/uso da terra, série temporal. Para análise de degradação ou aptidão. |
| **Terrabrasilis (INPE)** | https://terrabrasilis.dpi.inpe.br/ | PRODES/DETER — desmatamento. Sobrepor a clusters propostos para flag de risco socioambiental. |
| **Atlas Nacional Digital — IBGE** | https://www.ibge.gov.br/apps/atlas_nacional/#/home | Camadas socioeconômicas, demografia, infraestrutura. |
| **Observatório do Código Florestal** | https://observatorioflorestal.org.br/ | Conformidade ambiental — útil pra dimensão "transição justa". |

## Fontes agro / florestais

| Fonte | URL | Uso provável |
|---|---|---|
| **PEVS — IBGE** | https://www.ibge.gov.br/estatisticas/economicas/agricultura-e-pecuaria/9105-producao-da-extracao-vegetal-e-da-silvicultura.html | Extração vegetal e silvicultura — biomassa florestal por município. |
| **PAM — IBGE** | https://www.ibge.gov.br/estatisticas/economicas/agricultura-e-pecuaria/9117-producao-agricola-municipal-culturas-temporarias-e-permanentes.html | Produção agrícola municipal — base pra biomassa cana/soja/etc. |
| **Conab — Portal de Informações** | https://portaldeinformacoes.conab.gov.br/produtos-360.html | Dashboards setor agropecuário. |
| **IBÁ — Indústria Brasileira de Árvores** | https://iba.org/publicacoes/ | Florestas plantadas — produção, área, consumo. |

## Estatística geral

| Fonte | URL | Uso provável |
|---|---|---|
| **SIDRA — IBGE** | https://sidra.ibge.gov.br/ | Hub estatístico do IBGE — recortes geográficos customizados, exportável. |

## Energia

| Fonte | URL | Uso provável |
|---|---|---|
| **EPE — Webmap** | https://gisepeprd2.epe.gov.br/WebMapEPE/ | Geração, transmissão, subestações, recursos energéticos. Camada-mãe de infra elétrica. |
| **BEN — Balanço Energético Nacional** | https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/balanco-energetico-nacional-bem | Oferta/consumo nacional anual. |
| **ANP — Painel Etanol** | https://www.gov.br/anp/pt-br/centrais-de-conteudo/paineis-dinamicos-da-anp/paineis-e-mapa-dinamicos-de-produtores-de-combustiveis-e-derivados/painel-dinamico-de-produtores-de-etanol | Unidades produtoras, capacidade, matéria-prima. |
| **ANP — Painel Biodiesel** | https://www.gov.br/anp/pt-br/centrais-de-conteudo/paineis-dinamicos-da-anp/paineis-e-mapa-dinamicos-de-produtores-de-combustiveis-e-derivados/painel-dinamico-de-produtores-de-biodiesel | Idem para biodiesel. |
| **ANP — Painel Biometano** | https://www.gov.br/anp/pt-br/centrais-de-conteudo/paineis-dinamicos-da-anp/paineis-e-mapa-dinamicos-de-produtores-de-combustiveis-e-derivados/painel-dinamico-de-produtores-de-biometano | Idem para biometano. |
| **SIGA — ANEEL** | https://app.powerbi.com/view?r=eyJrIjoiNjc4OGYyYjQtYWM2ZC00YjllLWJlYmEtYzdkNTQ1MTc1NjM2IiwidCI6IjQwZDZmOWI4LWVjYTctNDZhMi05MmQ0LWVhNGU5YzAxNzBlMSIsImMiOjR9 | Sistema de Informações de Geração — usinas em operação e em planejamento. |

## Indústria

| Fonte | URL | Uso provável |
|---|---|---|
| **Instituto Aço Brasil** | https://www.acobrasil.org.br/site/ | Produção, consumo, capacidade siderúrgica. |
| **Observatório Setorial Sebrae** | https://observatorio.sebrae.com.br/ | Dados econômicos por setor e território. |

## Internacionais

| Fonte | URL | Uso provável |
|---|---|---|
| **World Bank Open Data** | https://data.worldbank.org/ | Indicadores comparativos globais. |
| **IRENA** | https://www.irena.org/Data | Capacidade renovável, custos, investimentos por país. |
| **World Steel Association** | https://worldsteel.org/data/ | Aço — produção e comércio global. |

---

## Bases mencionadas no Atlas mas **não** no anexo (gaps)

Identificadas nas referências bibliográficas do Atlas — podem ser pontos de expansão para a equipe:

- **CCEE** — Câmara de Comercialização de Energia Elétrica
- **Biogás Map — CIBiogás**
- **ANM** — Agência Nacional de Mineração (Relatório Anual de Recursos Minerais)
- **ANTAQ** — Agência Nacional de Transportes Aquaviários (logística portuária)
- **ANTT** — Agência Nacional de Transportes Terrestres
- **ABAL / ABIQUIM / ABIVIDRO / ANDA / SNIC** — associações setoriais (alumínio, química, vidro, fertilizantes, cimento)
- **CPRM** — Serviço Geológico do Brasil
- **PNH₂** — Programa Nacional do Hidrogênio (MME)
- **PDE 2033** — Plano Decenal de Expansão de Energia
- **MAPA** — Projeções do Agronegócio 2022–2033
- **IEA / BloombergNEF / Methanol Institute / IATA / ICAO / GCCA / FAO / OECD / UNCTAD / USGS / IAI / EllenMacArthur**

## Critério para escolher fontes (não é "usar todas")

1. **Cabe no MVP de 48h?** Ler doc + parsear + integrar custa caro.
2. **Tem API ou download direto?** Scraping consome tempo demais.
3. **Resolve a tese do projeto?** Dados decorativos não pontuam em "uso inteligente de dados".
4. **Está em granularidade compatível?** Município ≠ ponto geográfico ≠ região.
