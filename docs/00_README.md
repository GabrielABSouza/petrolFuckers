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
