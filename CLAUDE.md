# Hackathon E+ — Radar PID (Equipe 464)

## Contexto
Hackathon E+ Transição Energética (Instituto E+ + Hackathon Brasil), 9–10 mai 2026.
Tema: "Transforme dados em decisões para acelerar a transição energética do Brasil."
Desafio: evoluir a Plataforma Interativa de Descarbonização (PID).

Equipe: **464**. Formato: híbrido (presencial SP + online).
Entrega final: **dom 10 mai 2026, 21:59 BRT**. Avaliação 11–13 mai. Resultado 14 mai.

## Objetivo da solução
**Radar PID** — camada de inteligência sobre a PID v2 com score MCDA por município, lentes (Investidor / Órgão público), modos (Renováveis / Data Centers IA / Neoindustrialização verde), mapa SVG real do Brasil e Copiloto contextual. Diferencial: camada de **convergência com incentivos públicos** (REIDI, SUDENE, FNE, BNDES, etc.) que a PID atual não tem.

Posicionamento: "A PID atual mostra camadas. O Radar PID recomenda onde agir primeiro."

## Restrições do regulamento (não negociáveis)
- §10.10: NADA pode ser pré-existente ou copiado de outras competições.
- §4.4: LGPD — não vazar dados pessoais nem credenciais em commit/pitch.
- §10.4: IP fica com a equipe e com o Instituto E+ (uso institucional autorizado).
- Logo, nome e paleta da PID **são obrigatórios** no protótipo (orientação da banca).
- Pitch: ≤3min, YouTube **não listado**, link em `equipe-464/link-do-video-pitch--OBRIGATÓRIO.docx`.
- Pasta de entrega final: `equipe-464/`, zipada e enviada até 21:59 do domingo 10/mai.

## Critérios de julgamento (calibram esforço)
- **Documentação (1,0–4,0)**: clareza, completude, consistência → templates `.docx` bem preenchidos pesam.
- **Pitch (1–4)**: impacto, viabilidade, aderência, **inovação (desempate)**, qualidade.
- Tiebreaker primário: nota da documentação.

## Estrutura do repo
- `docs/` — research, EDA, decisões. **Não é entregável**, é insumo.
  - `00_README.md` é o índice canônico. `04_escopo_estrategia.md` é o doc-mestre.
  - `12_decisoes_arquitetura_radar_pid.md` justifica cada escolha do `web/` (consultar antes de mexer em qualquer coisa visual ou de stack).
- `web/` — protótipo React (Vite 5 + Tailwind 3 + Motion 11 + d3-geo + topojson-client + lucide-react).
- `data/raw|processed/` — CSVs ANEEL/ANP + agregações.
- `references/` — PDFs grandes (gitignored).
- `prompts/` — prompts de agentes externos.
- `equipe-464/` — **PASTA DE ENTREGA OFICIAL**. É o que vai pros jurados.

## Entregáveis obrigatórios (em `equipe-464/`)
| Caminho | O que vai dentro |
|---|---|
| `informacoes-da-equipe--OBRIGATÓRIO.doc` | Nº equipe (464) + 5 integrantes (nome/função/email/whatsapp) |
| `link-do-video-pitch--OBRIGATÓRIO.docx` | URL YouTube não-listado |
| `Documentação-OBRIGATÓRIO/Dados-gerais-da-solução.docx` | viabilidade, similares, diferenciais, impactos |
| `Documentação-OBRIGATÓRIO/Sobre parte tecnica da sua solução.docx` | tipo, stack, manual de uso |
| `Código fonte-OBRIGATÓRIO/` | código completo do `web/` (zip ou cópia) + README com `npm i && npm run dev` |
| `Design/Logotipo/` | logo PID (SVG/PNG transparente) |
| `Design/Fluxograma/` | fluxo Lente→Modo→Município→Copiloto |
| `Design/Wireframe/` | wireframe das 3 colunas |
| `Design/Protótipo final -Telas/` | screenshots do `web/` rodando |

## Mapeamento docs/ → templates de entrega
- *Viabilidade* ← `04_escopo_estrategia.md` + `12_decisoes_arquitetura_radar_pid.md`
- *Soluções similares* ← `09_benchmark_mercado.md`
- *Diferenciais* ← `11_convergencia_incentivos_publicos.md` + `12_decisoes_arquitetura_radar_pid.md`
- *Impactos* ← `02_atlas_sintese.md` + `06_eda_insights.md` + `PERSONA.md`
- *Stack* ← `web/package.json`
- *Manual* ← fluxo de `web/src/App.jsx`

Conteúdo já redigido para os templates está em `equipe-464/Documentação-OBRIGATÓRIO/CONTEUDO_*.md` — copiar e colar dentro dos `.docx` correspondentes.

## Convenções de trabalho com o Claude
- PT-BR. Cirúrgico. Reuso > criação. Não inventar features fora do escopo do hackathon.
- Antes de mudar algo no `web/`, ler `docs/12_decisoes_arquitetura_radar_pid.md` — decisões já têm justificativa registrada.
- Logo/nome/paleta da PID são obrigatórios; visual ao redor é livre.
- Toda data relativa ("amanhã", "domingo") deve virar data absoluta (10 mai 2026).
- Não commitar `references/*.pdf` (já gitignored) nem dados sensíveis (LGPD §4.4).
- O que está em `docs/` é insumo, não entregável — não confundir.

## Cronograma de entrega (referência)
- **dom 10 mai, 16:00** — congelamento de features no `web/`.
- **dom 10 mai, 17:00** — gerar screenshots, fluxograma, wireframe, logo.
- **dom 10 mai, 18:30** — preencher templates `.docx` (Documentação + informações da equipe).
- **dom 10 mai, 19:00** — gravar pitch (≤3min) + upload YouTube não-listado.
- **dom 10 mai, 20:30** — copiar `web/` pra `equipe-464/Código fonte-OBRIGATÓRIO/`, zipar pasta inteira.
- **dom 10 mai, 21:59** — DEADLINE submissão.
