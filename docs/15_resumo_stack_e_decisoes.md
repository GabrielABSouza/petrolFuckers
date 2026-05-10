# Radar PID — Stack + Decisões (cheat sheet pro time)

> **Audiência:** integrantes da Equipe 464 lendo pra consolidar nos `.docx` dos jurados ou no roteiro do pitch.
>
> **TL;DR:** Front React/Vite + Back Python/FastAPI + Agente Gemini 3 Flash, indicador real (1.938 municípios × 5 fontes), deploy Vercel (front) + Railway (back).

---

## 1. Stack em 1 tabela

| Camada | Stack | Bibliotecas principais |
|---|---|---|
| Front-end | React 18 + Vite 5 + Tailwind 3 | motion, d3-geo, topojson-client, lucide-react |
| Back-end | Python 3.11 + FastAPI 0.111 | pandas, pyarrow, pydantic, uvicorn |
| Agente IA | Gemini 3 Flash Preview | google-genai SDK + Google File Search nativo |
| Dados | Parquet pré-calculado em memória | snapshot mensal a partir do notebook |
| Deploy | Vercel (front) + Railway (back) | Docker multi-stage pra API |
| Documentação | Markdown em `docs/` | Specs prescritivas em `docs/SPEC_*.md` |

**Bundle:** front ~566 KB JS / 139 KB gzip; back imagem ~250 MB com parquet de 150 KB carregado em RAM.

**Custo operacional estimado em produção:** R$ 30–60/mês (Railway hobby + Gemini API com prompt caching).

---

## 2. Indicador (resumo de 1 página)

- **Cobertura:** 1.938 municípios × 5 fontes (Solar, Eólica, Biometano, H2 Verde, Biomassa) = **9.690 scores**.
- **Fórmula MCDA:** `score = 0,40 × eco + 0,30 × soc + 0,30 × env`.
- **Cada bloco:** média NaN-safe de 2–3 variáveis normalizadas via min-max global.
- **Flag de qualidade:** coluna `data_completeness` (0–1) por linha — 38% das linhas com 100% das variáveis presentes; 9% com <60%.
- **Fontes:** ANEEL SIGA (25.407 empreendimentos), ANP Biometano (492 registros), ANEEL SIGET (1.160 linhas + 2.305 subestações + 10.379 projetos), IBGE Cidades (IDH-M, PIB per capita, taxa de desemprego, % população rural — alimentando o bloco social). CO₂ evitado com fator EPE 2023 (0,06 tCO₂/MWh).
- **Snapshot atual:** 2026-05-10.
- **Pipeline offline:** notebook `scriptAnalysis.ipynb` na branch `dados_score_pid` → 3 parquets em `api/data/`.

---

## 3. Decisões principais

### 3.1 Produto e UX

**1. Identidade visual oficial da PID.** Logo SVG no header, paleta navy + cinder + amber, tipografia Fraunces + Geist + JetBrains Mono. Toggle entre tema escuro (cockpit institucional) e claro (alinhado ao site público da PID), com flip via `[data-theme="light"]` no `<html>` — JSX classNames não mudam, CSS-vars fazem o trabalho.

**2. Header com carrossel de insights motion.** 4 strings rotativas a cada 5 segundos com `AnimatePresence` (pattern AiPets). Conteúdo mistura 4 tipos: ranking-derived, incentivo público, EDA empírico e caso demonstrativo. Reforça narrativa "PID + IA".

**3. Layout em 3 painéis.**
- **Esquerdo (340px):** estado-driven — tutorial / detalhes do município / comparação X vs Y.
- **Centro (flex):** mapa SVG nativo do Brasil com 1.938 municípios coloridos por score.
- **Direito (400px):** agente conversacional sempre aberto.

**4. Microcopy responsável (regulamento §10.13).** Toda comunicação usa "oportunidade candidata", "elegibilidade preliminar", "score de triagem", "priorizar estudo". Vocabulário "garantido", "melhor investimento", "retorno certo" é proibido em todo o produto.

### 3.2 Indicador

**5. Média ponderada simples, não ML.** Decisão deliberada vs Random Forest, GWR, TOPSIS. **Por quê:** explicabilidade radical — usuário entende a fórmula em 1 frase. Defensável em comitê de investimento.

**6. Score por fonte, não score único.** Cada município tem 5 scores (1 por fonte de geração). Cabeça de ranking é "qual fonte rende mais score nesse município".

**7. Tratamento NaN-safe + flag `data_completeness`.** Variável ausente não vira zero — propaga como NaN, e cada linha carrega uma flag explícita (0–1) indicando que fração das variáveis tinha valor real. **Honestidade metodológica vs alucinação por silenciamento.**

**8. Camada de incentivos públicos como informação contextual.** REIDI, SUDENE, FNE, BNDES e correlatos aparecem como badges com status (confirmado / proxy / elegibilidade preliminar). **Decisão deliberada de não somar ao score MCDA:** somá-los introduziria viés cumulativo (município já bem ranqueado em viabilidade técnica viraria ainda mais bem ranqueado por ter incentivo). Lado-a-lado preserva interpretabilidade.

### 3.3 Backend e agente

**9. FastAPI Python + parquet em RAM.** Volume é trivial (9.690 linhas, ~150 KB). Lifecycle FastAPI carrega parquet uma vez na inicialização. Latência de query <30ms. Postgres+PostGIS entram quando o dataset crescer (registrado no design doc do backend v2).

**10. Agente Gemini 3 Flash Preview com 3 capacidades.**
- **Função custom `search_municipio`** — consulta o indicador em tempo real, retorna rankings filtrados (UF, fonte, completude).
- **Google File Search nativo** — RAG gerenciado pelo Google sobre 5 documentos internos (decisões de arquitetura, escopo, EDA empírica, camada de incentivos, persona). Responde perguntas metodológicas com fundamento documental.
- **Web search de convergência pública** — busca em tempo real sobre instrumentos públicos federais (REIDI, SUDENE, FNE, BNDES Climate Fund), notícias setoriais e mudanças regulatórias, com citações de fonte.

**11. Memória in-memory por session_id.** Dict em RAM com TTL 30min, máximo 20 turnos por sessão. Suficiente pra MVP; v2.1 persiste em Postgres/Redis.

### 3.4 Operacional

**12. Vercel (front) + Railway (back).** Vercel é otimizado pra estático com edge cache; Railway pra processo Python com Docker. Free tier de ambos cobre o MVP. CORS aberto (`*`) hoje — restringido pra v2.1.

---

## 4. Diferenciais defensáveis (frente a benchmark)

1. **Indicador MCDA real com flag explícita de qualidade** (`data_completeness`). Raro em plataformas comerciais.
2. **Agente especializado em incentivos públicos brasileiros** com RAG sobre docs internos + busca web em tempo real. WayCarbon / ClimateView / Climate TRACE não cruzam isso.
3. **Camada de incentivos como info-only.** Decisão metodológica defensável em apresentação.
4. **Operacional em produção, não só protótipo.** Backend e agente respondendo via API pública no fim do hackathon.
5. **Stack 100% open-source com custo desprezível.**
6. **Estética institucional alinhada com a PID original** (logo + paleta + tipografia + dual theme).

---

## 5. Escopo do MVP (o que fica pra v2)

- **Variáveis estaduais (transmissão, biometano agregado por UF) normalizadas intra-UF** ou movidas pra contexto, em vez de aplicadas como municipais.
- **Filtro de aptidão geográfica por fonte** (overlay com Atlas Eólico CEPEL + Global Solar Atlas + IBGE PAM).
- **Validação cruzada do score** contra realização (REIDI 2020-2025, FNE-Verde, SUDENE) — defensabilidade metodológica do método.
- **Robust scaling no min-max** (winsorize 5/95) pra mitigar achatamento por outliers (Itaipu, Belo Monte).
- **Persistência de memória do agente** cross-session (Postgres/Redis).
- **Testes automatizados, CI, observability profunda.**

Cada item está detalhado em `docs/13_roadmap_indicador_v2.md` ou `docs/14_arquitetura_backend_v2.md` com mitigação, custo e fontes de dados necessárias.

---

## 6. Onde encontrar cada coisa no repo

| Item | Caminho |
|---|---|
| Front-end SPA | `web/` |
| Back-end API + Agente | `api/` |
| Notebook do indicador | branch `dados_score_pid`, `scr/scriptAnalysis.ipynb` |
| Decisões de UX/produto | `docs/12_decisoes_arquitetura_radar_pid.md` |
| Roadmap do indicador | `docs/13_roadmap_indicador_v2.md` |
| Design backend v2 | `docs/14_arquitetura_backend_v2.md` |
| Specs prescritivas | `docs/SPEC_*.md` |
| Conteúdo p/ jurores | `equipe-464/` |
