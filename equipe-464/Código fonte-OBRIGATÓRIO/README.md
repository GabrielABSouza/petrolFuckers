# Radar PID — código-fonte (Equipe 464)

Camada de inteligência sobre a Plataforma Interativa de Descarbonização (PID) do Instituto E+, desenvolvida para o Hackathon E+ Transição Energética (9–10 mai 2026).

Solução fullstack: front React + back FastAPI + agente Gemini 3 Flash.
Repositório público: https://github.com/GabrielABSouza/petrolFuckers

---

## Estrutura (monorepo)

```
petrolFuckers/
├── web/                       ← Front-end React/Vite (SPA)
│   ├── public/                # logos PID (SVG), favicon
│   ├── src/
│   │   ├── App.jsx            # orquestrador + componentes inline
│   │   ├── BrazilMap.jsx      # mapa SVG do Brasil + d3-geo
│   │   ├── Copiloto.jsx       # painel direito conversacional (chama /agente/chat)
│   │   ├── data.js            # mocks de municípios + INSIGHTS_HEADER
│   │   ├── scoring.js         # motor MCDA local (mock — back já serve real)
│   │   ├── brazil_topo.json   # geometria estados IBGE (226KB)
│   │   ├── index.css          # Tailwind + tokens CSS-var dual-theme
│   │   └── main.jsx           # entrada React
│   ├── tailwind.config.js     # design tokens (paleta PID + dark/light)
│   ├── package.json
│   └── .env.example           # VITE_API_BASE
│
├── api/                       ← Back-end FastAPI (Python)
│   ├── src/
│   │   ├── main.py            # FastAPI app + 5 endpoints da API
│   │   └── agente/
│   │       ├── config.py      # leitura de .env (Gemini API key etc)
│   │       ├── sessions.py    # memória in-memory por session_id (TTL 30min)
│   │       ├── tools.py       # search_municipio (custom function)
│   │       ├── llm.py         # cliente Gemini + agent loop
│   │       └── router.py      # POST /agente/chat
│   ├── data/
│   │   ├── mcda_ranking_completo.parquet   # 9.690 (mun × fonte) scores
│   │   └── municipio_features.parquet      # 1.938 mun × 21 features
│   ├── scripts/
│   │   └── setup_file_search.py            # bootstrap one-time do RAG
│   ├── pyproject.toml
│   ├── Dockerfile             # multi-stage build pro Railway
│   ├── railway.toml           # config de deploy
│   └── .env.example           # GEMINI_API_KEY, GEMINI_MODEL, STORE_ID
│
├── docs/                      # documentação interna (decisões, EDA, specs)
└── equipe-464/                # entregáveis oficiais pro Hackathon
```

---

## Como rodar localmente

Pré-requisitos: Node.js ≥ 18, Python ≥ 3.11.

### 1. Backend (terminal 1)

```bash
cd api
python -m venv .venv
source .venv/bin/activate     # macOS/Linux
# .venv\Scripts\activate      # Windows
pip install -e .

# Configurar credenciais
cp .env.example .env
# Editar .env: preencher GEMINI_API_KEY (https://aistudio.google.com/apikey)

# Bootstrap one-time do File Search (cria store + indexa 5 docs)
python scripts/setup_file_search.py
# Output imprime: GEMINI_FILE_SEARCH_STORE_ID=fileSearchStores/...
# Cole essa linha em api/.env

# Subir o servidor
uvicorn src.main:app --reload --port 8000
# API em http://localhost:8000
# Swagger UI em http://localhost:8000/docs
```

### 2. Frontend (terminal 2)

```bash
cd web
npm install

# Apontar pro backend local
echo "VITE_API_BASE=http://localhost:8000" > .env

# Subir o dev server
npm run dev
# Front em http://localhost:5173
```

### 3. Testar

Abra `http://localhost:5173` no navegador. Selecione um município no mapa. No painel direito (Copiloto), pergunte:
- "Quais os top 3 municípios em H2 Verde?" → agente chama `search_municipio`
- "Como o score é calculado?" → agente chama File Search
- "E em Pará?" (após 1ª pergunta) → memória de sessão preserva contexto

---

## Build e deploy

### Frontend
```bash
cd web
npm run build      # gera dist/
npm run preview    # serve em http://localhost:4173
```
Hospedável em qualquer CDN estática (Vercel, Netlify, Cloudflare Pages).

### Backend (Railway)
1. Conectar repositório no painel Railway: New Project → Deploy from GitHub repo.
2. Configurar **Root Directory** = `/api` no Service Settings.
3. Adicionar Variables:
   - `GEMINI_API_KEY=...`
   - `GEMINI_MODEL=gemini-3-flash-preview`
   - `GEMINI_FILE_SEARCH_STORE_ID=fileSearchStores/...`
4. Generate Domain → URL pública.

---

## Stack

### Front-end
- React 18.3.1 + Vite 5.4.11
- Tailwind CSS 3.4.15 + PostCSS + Autoprefixer
- Motion 11.11.0 (animações)
- d3-geo 3.1.1 + topojson-client 3.1.0 (mapa SVG)
- lucide-react 0.460.0 (ícones)

### Back-end
- Python 3.11
- FastAPI 0.111 + uvicorn 0.30
- pandas 2.2 + pyarrow 16
- google-genai 2.0 (SDK oficial Gemini)
- python-dotenv

### IA
- Gemini 3 Flash Preview (modelo conversacional)
- Google File Search (RAG nativo)

Detalhes completos em `equipe-464/Documentação-OBRIGATÓRIO/CONTEUDO_sobre-parte-tecnica.md`.

---

## Endpoints da API

```
GET  /health                         status + tamanho do dataset
GET  /municipios                     lista filtrada (uf, fonte, top, min_completeness)
GET  /municipios/{nome}              detalhes de 1 município (features + 5 scores)
GET  /ranking                        ranking puro por fonte
GET  /insights                       4 insights rotativos (substitui hardcoded)
POST /agente/chat                    conversa com o Copiloto Gemini
```

Schemas completos via Swagger UI em `/docs` quando o backend está rodando.

---

## Indicador (snapshot atual)

- **Cobertura:** 1.938 municípios × 5 fontes (Solar, Eólica, Biometano, H2 Verde, Biomassa) = 9.690 scores.
- **Fórmula MCDA:** `score = 0,40 × eco + 0,30 × soc + 0,30 × env`. Cada bloco é a média (NaN-safe) de 2–3 variáveis normalizadas via min-max global.
- **Flag de qualidade:** coluna `data_completeness` (0–1) por linha. 38% das linhas com 100% das variáveis presentes; 9% com <60%.
- **Snapshot date:** 2026-05-10 (hardcoded no MVP; v2 vira coluna no DB).
- **Pipeline offline:** notebook `scriptAnalysis.ipynb` na branch `dados_score_pid` consolida ANEEL SIGA + ANP Biometano + ANEEL SIGET → 3 parquets em `api/data/`.

---

## Decisões arquiteturais

Todas justificadas em `docs/`. Consultar antes de mexer em escolha de stack, layout, paleta ou estrutura de dados:

- `docs/12_decisoes_arquitetura_radar_pid.md` — decisões de produto e UX.
- `docs/13_roadmap_indicador_v2.md` — gaps metodológicos identificados e roadmap pós-hackathon.
- `docs/14_arquitetura_backend_v2.md` — design de longo prazo do backend (Postgres+PostGIS quando o volume crescer).
- `docs/SPEC_API_MVP_RAILWAY.md` — spec executável da API atual.
- `docs/SPEC_AGENTE_COPILOTO_GEMINI.md` — spec executável do agente Copiloto.
- `docs/SPEC_INDICADOR_HARDENING_V1_5.md` — spec do hardening NaN-safe + data_completeness.

---

## Limitações conhecidas (v2.0)

- **Convergência pública ainda mockada** (esquema servido pelo back; preenchimento real REIDI/SUDENE/FNE/BNDES é roadmap pós-hackathon).
- **Variáveis estaduais aplicadas como municipais** (transmissão, biometano agregado por UF) — registrado no roadmap v2.
- **Score social ainda é proxy** (substituição por IBGE Cidades real planejada).
- **Sem filtro de aptidão geográfica** por fonte (overlay com Atlas Eólico CEPEL + Global Solar Atlas + IBGE PAM no roadmap).
- **Agente sem grounding em busca web** (Gemini 3 Flash hoje não permite combinar `googleSearch` + `fileSearch` no mesmo request; priorizamos fileSearch). Roadmap: fallback via função custom chamando Google Custom Search API.
- **Sem testes automatizados, CI ou observability profunda** — escopo deliberadamente fora do MVP, registrado no design doc do backend v2.

---

## Licença e originalidade

Código original desenvolvido durante o Hackathon E+ Transição Energética 2026, em conformidade com regulamento §10.10 (nada pré-existente, nada copiado de outras competições). Bibliotecas de terceiros são open-source com licenças permissivas (MIT/Apache).

Propriedade intelectual da solução é co-titularidade entre a equipe e o Instituto E+, conforme regulamento §10.4. O E+ pode evoluir o produto com ou sem a equipe (preferindo com).
