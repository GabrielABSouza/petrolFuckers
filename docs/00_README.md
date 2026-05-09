# Hackathon E+ — Plataforma Interativa de Descarbonização (PID)

**Maratona:** 9–10 maio 2026 (sex–sáb)
**Anúncio finalistas:** 15 maio 2026, 19h
**Formato:** híbrido (SP, WeWork — Av. Nações Unidas 14261, 24º) + online
**Equipe:** 3–5 pessoas (já formada)
**Entregável:** pitch + protótipo

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

- [x] Briefing oficial extraído (hackathonbrasil.com.br/hackathon-emais)
- [x] Atlas Industrial 2025 lido (82p, PDF)
- [x] Banco de dados PID mapeado (22 fontes)
- [x] EDA inicial concluída — ver `06_eda_insights.md`
- [x] Dados-chave baixados: ANEEL SIGA (25.407 empreendimentos), ANEEL SIGET (1.160 trechos), ANP Biometano (19 plantas)
- [ ] Acesso direto à PID v2.0 — agente teve HTTP 403; equipe deve testar via navegador
- [ ] Definir trilha (UX / Análise / Aplicação)
- [ ] Definir persona-alvo
- [ ] Convergir em escopo MVP (ver `04` informado por `06`)
