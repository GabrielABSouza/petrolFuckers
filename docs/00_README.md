# Hackathon E+ — Plataforma Interativa de Descarbonização (PID)

**Maratona:** sáb 9 → dom 10 maio 2026, **09:00 → 22:00** (~37h líquidas) — fonte: regulamento §2.1
**Entrega final:** dom 10 mai, **21:59h** — pasta + vídeo pitch ≤3min no YouTube (não listado)
**Anúncio dos vencedores:** 14 maio 2026 (live)
**Formato:** híbrido (SP, WeWork — Av. Nações Unidas 14261, 24º) + online via Discord
**Equipe:** 3–5 pessoas (já formada)
**Regulamento oficial:** `references/regulamento-hackathon-e-mais.pdf`

---

## Índice de documentos

| # | Doc | Quando ler |
|---|---|---|
| 01 | [Briefing do hackathon](01_briefing.md) | Onboarding. Regras, datas, critérios, trilhas, premiação. |
| 02 | [Síntese do Atlas E+](02_atlas_sintese.md) | Antes de ideação. Tese do E+, indústrias-alvo, clusters, Powershoring/Consenso de Belém. |
| 03 | [Fontes de dados](03_fontes_dados.md) | Catálogo das 22 bases oficiais + PID. |
| 04 | [Escopo e estratégia](04_escopo_estrategia.md) | **Documento mestre**. Framework de 7 decisões + alternativas. |
| 05 | [Perguntas abertas](05_perguntas_abertas.md) | Gaps a fechar com mentor/organização. |
| 06 | [EDA insights](06_eda_insights.md) | **Análise empírica** das fontes baixadas. Mismatches energia↔indústria, pontos cegos da PID, 3 caminhos de MVP. |
| 07 | [SAFMaps integration](07_safmaps_integration.md) | **Achado crítico** — 72 camadas WFS públicas (UNICAMP/Embraer/Boeing/Agroicone). Inclui `steel_plants` com dados de flaring + camadas socioambientais (slavery_likely, child_labour, mhdi). |
| 08 | [IBGE dados abertos](08_ibge_dados.md) | **Especificação do dataframe mestre** — APIs validadas (APISIDRA + GeoServer 9.5k camadas), 15 tabelas SIDRA prioritárias, ~50 features por município, indicadores derivados pra score MCDA. |
| 09 | [Benchmark de mercado](09_benchmark_mercado.md) | Soluções comparáveis (CarbonTech, WayCarbon, Watershed, ClimateView, Google EIE etc.) + espaço de diferenciação para a PID. |
| 11 | [Convergência pública](11_convergencia_incentivos_publicos.md) | Camada de incentivos, licitações, financiamento público e obras para cruzar oportunidade energética com instrumentos governamentais. |
| 12 | [Decisões de arquitetura — Radar PID](12_decisoes_arquitetura_radar_pid.md) | **Por que o protótipo `web/` ficou do jeito que ficou.** Decisões de produto, UX, layout, estética, stack técnica, arquitetura de componentes, trade-offs aceitos. Útil pra defesa do pitch. |

## Estrutura física do repo

| Pasta | Conteúdo |
|---|---|
| `docs/` | Documentação estratégica e analítica (este diretório). |
| `data/raw/` | CSVs brutos (ANEEL SIGA, ANEEL SIGET, ANP Biometano). |
| `data/processed/` | Sumários e agregações (`ANEEL_SIGA_resumo.json`, `agente_eda_findings.md`). |
| `prompts/` | Prompts usados em agentes externos. |
| `references/` | PDF/docx grandes — gitignored, só local. |

---

## Status

- [x] Briefing oficial extraído (hackathonbrasil.com.br/hackathon-emais + regulamento PDF)
- [x] Regulamento oficial lido — datas e critérios reais consolidados em `01_briefing.md`
- [x] Atlas Industrial 2025 lido (82p, PDF)
- [x] Banco de dados PID mapeado (22 fontes)
- [x] EDA inicial concluída — ver `06_eda_insights.md`
- [x] Dados-chave baixados: ANEEL SIGA (25.407 empreendimentos), ANEEL SIGET (1.160 trechos), ANP Biometano (19 plantas)
- [x] Estrutura real da PID v2.0 documentada via LEIAME oficial (`references/PID-LEIAME-v.2.pdf`)
- [ ] Inspecionar PID ao vivo via navegador (DevTools → ver se há layer service REST exposto)
- [ ] Definir trilha (UX / Análise / Aplicação)
- [ ] Definir persona-alvo
- [ ] Convergir em escopo MVP (ver `04` informado por `06`)
