# Arquitetura do backend — Radar PID v2

> **Status:** proposta de design técnico para a próxima iteração do Radar PID, sob co-titularidade com o Instituto E+ (Hackathon E+ Transição Energética 2026, regulamento §10.4). v1 (hackathon) é client-side puro com dados mockados; v2 expõe o indicador real via API com queries dinâmicas.
>
> **Audiência:** equipe técnica + Instituto E+ + investidores avaliando viabilidade pós-hackathon.
>
> **Não é spec executável.** É design doc — define stack, contratos e tradeoffs. A implementação efetiva fica para sprints pós-hackathon (cronograma sugerido na §13).

---

## 1. Contexto

### 1.1 v1 (hackathon, entregue 10 mai 2026)
- React 18 + Vite, client-side puro.
- 12 municípios mockados em `web/src/data.js`.
- Score MCDA reimplementado em JS (`web/src/scoring.js`) — duplica a lógica do notebook em Python.
- Sem backend, sem persistência, sem queries dinâmicas.

### 1.2 Indicador real (branch `dados_score_pid`, hardening v1.5)
- 1.938 municípios × 5 fontes = **9.690 (município, fonte) scores** computados em notebook Python.
- 11 colunas no output: `municipio, uf, lat, lon, fonte, score, eco_score, soc_score, env_score, data_completeness, rank`.
- Dados oficiais: ANEEL SIGA + ANP + SIGET. Fator EPE 2023 para CO₂ evitado.
- Distribuição de completude observada: 38% das linhas com 100% das variáveis presentes; 9% com <60%.
- Output: 3 CSVs em `data/processed/` (`municipio_features.csv`, `mcda_ranking_completo.csv`, `mcda_top_fonte_municipio.csv`).

### 1.3 Gap entre v1 e v2
| Aspecto | v1 (hackathon) | v2 (proposto) |
|---|---|---|
| Dataset | 12 mocks JS | 1.938 municípios reais via API |
| Score | Reimplementado em JS | Pré-calculado em Python, servido via API |
| Queries | Hardcoded array | Filtros dinâmicos (UF, fonte, completude, top-N) |
| Persistência | Nenhuma | Postgres |
| Updates | Manual no JS | Re-execução periódica do notebook → reload no DB |
| Geo | Lat/lon média de plantas | PostGIS com centroide IBGE + queries espaciais |

---

## 2. Princípios norteadores

1. **API é fina, indicador é gordo.** O score é pré-calculado offline (notebook Python, agendado). A API só serve queries sobre o dataset estável. Não recomputa nada em runtime.
2. **Cliente confia no servidor para o score.** Front não duplica `scoring.js` — só renderiza o que vem da API. Isso elimina a divergência v1 entre JS e Python.
3. **Atualização é evento, não tráfego.** O dataset muda quando o notebook re-roda (mensal/trimestral). Não é hot path.
4. **Geo é primeira-classe.** Centroide municipal (IBGE), distância a porto/transmissão, overlay com aptidão são queries esperadas. PostGIS é não-negociável.
5. **LGPD-by-design.** Nenhum dado pessoal trafega. Logs anonimizados. Cache pode armazenar resposta livremente.
6. **Open data, open source.** Stack 100% open-source. Deploy em provedor com tier gratuito viável (Supabase/Neon + Railway/Fly.io).

---

## 3. Modelo de dados

### 3.1 Tabelas Postgres (proposta)

```sql
-- 1. Município (1.938 linhas)
CREATE TABLE municipio (
    id              SERIAL PRIMARY KEY,
    nome            TEXT NOT NULL,                    -- "PECEM" (uppercase, sem acento)
    nome_display    TEXT NOT NULL,                    -- "Pecém" (humanizado)
    uf              CHAR(2) NOT NULL,
    codigo_ibge     INTEGER UNIQUE,                   -- código municipal IBGE 7 dígitos (futuro)
    centroide       GEOGRAPHY(POINT, 4326) NOT NULL,  -- centroide IBGE (não a média de plantas)
    populacao       INTEGER,                          -- IBGE Censo 2022 (v2.1+)
    pib_pc          NUMERIC(12, 2),                   -- IBGE Sidra (v2.1+)
    idh_m           NUMERIC(4, 3),                    -- Atlas Brasil (v2.1+)
    UNIQUE (nome, uf)
);
CREATE INDEX ON municipio USING GIST (centroide);
CREATE INDEX ON municipio (uf);

-- 2. Features brutas (1.938 linhas — espelha municipio_features.csv)
CREATE TABLE municipio_features (
    municipio_id                    INTEGER PRIMARY KEY REFERENCES municipio(id),
    eco_mw_instalado                NUMERIC,
    eco_mw_outorgado                NUMERIC,
    eco_mw_ocioso                   NUMERIC,
    eco_n_plantas                   INTEGER,
    eco_share_renovavel             NUMERIC(5, 4),
    eco_bio_capacidade_m3d          NUMERIC,
    eco_bio_processado_m3d          NUMERIC,
    eco_bio_n_plantas               INTEGER,
    eco_bio_ociosidade              NUMERIC(5, 4),
    eco_n_linhas_transmissao        INTEGER,            -- atenção: estadual; ver roadmap §1.1
    eco_tensao_media_kv             NUMERIC,            -- estadual
    eco_capacidade_subestacao_mva   NUMERIC,            -- estadual
    soc_diversidade_fontes          INTEGER,
    soc_n_plantas_operacionais      INTEGER,
    env_co2_evitado_t_ano           NUMERIC,
    env_n_projetos_transmissao      INTEGER,            -- estadual
    env_bio_producao_m3             NUMERIC,            -- estadual
    snapshot_data                   DATE NOT NULL       -- quando o dataset foi gerado
);

-- 3. Score MCDA (9.690 linhas — espelha mcda_ranking_completo.csv)
CREATE TABLE mcda_score (
    municipio_id        INTEGER NOT NULL REFERENCES municipio(id),
    fonte               TEXT NOT NULL,                  -- "Solar" | "Eolica" | "Biometano" | "H2 Verde" | "Biomassa"
    score               NUMERIC(6, 4),                  -- NULL quando data_completeness=0
    eco_score           NUMERIC(6, 4),
    soc_score           NUMERIC(6, 4),
    env_score           NUMERIC(6, 4),
    data_completeness   NUMERIC(5, 4) NOT NULL,
    rank                SMALLINT,                       -- rank dentro do município (1-5)
    snapshot_data       DATE NOT NULL,
    PRIMARY KEY (municipio_id, fonte, snapshot_data)
);
CREATE INDEX ON mcda_score (fonte, score DESC);
CREATE INDEX ON mcda_score (municipio_id) WHERE rank = 1;

-- 4. Instrumentos públicos (info-only — NUNCA compõe score, ver SPEC_INDICADOR_HARDENING)
CREATE TABLE instrumento_publico (
    id              SERIAL PRIMARY KEY,
    municipio_id    INTEGER NOT NULL REFERENCES municipio(id),
    categoria       TEXT NOT NULL,                      -- "REIDI" | "SUDENE" | "FNE-Verde" | "BNDES Climate" | etc
    status          TEXT NOT NULL CHECK (status IN ('confirmado','proxy','elegibilidade')),
    justificativa   TEXT NOT NULL,
    fonte_dado      TEXT,                               -- ref da norma/portaria
    valido_desde    DATE,
    valido_ate      DATE                                -- NULL se vigente
);
CREATE INDEX ON instrumento_publico (municipio_id);
```

### 3.2 Convenção de snapshot

Cada re-execução do notebook gera linhas com `snapshot_data` nova. Histórico é preservado.
- `GET /v2/...` retorna sempre o snapshot mais recente por padrão.
- `?as_of=2026-09-30` pode retornar snapshot histórico (futuro).

---

## 4. Decisão de stack — 3 alternativas

### Opção A — Static JSON + CDN

```
notebook → CSV → script de export → JSON em Vercel/S3+CloudFront
                                            │
                                            ▼
                                       client (fetch)
```

| Pro | Con |
|---|---|
| Custo runtime ≈ R$ 0 | Sem queries dinâmicas (filter por UF, top-N exigem download total) |
| Latência <50ms (edge) | Sem geo-queries (distância, overlay) |
| Sem manutenção | Recompute de pesos pesa no cliente (9.690 linhas × pesos custom) |
| Escala trivialmente | Atualização exige redeploy do front |

**Cabe quando:** dataset é pequeno (1.938 mun é OK pra JSON ≈ 2 MB gzipped) e queries são só GET-tudo-e-filtra-no-cliente.

### Opção B — FastAPI + Postgres + PostGIS (recomendado)

```
notebook → CSVs → loader script → Postgres+PostGIS
                                      │
                                      ▼
                              FastAPI (Python)
                                      │
                                ┌─────┴─────┐
                                ▼           ▼
                            Redis cache    client
```

| Pro | Con |
|---|---|
| Queries SQL dinâmicas (UF, fonte, score range, completude) | Custo runtime (~$15-30/mês fase inicial) |
| PostGIS para geo nativo (distância, ST_Within, ST_Buffer) | Cold start em serverless (~1-2s) |
| Stack Python = consistência com o notebook do indicador | Ops mais complexo (DB managed, migrations, monitoring) |
| Escala via vertical (DB) ou horizontal (API instances) | |

**Cabe quando:** queries dinâmicas, geo, ou ranking server-side são valor real. Stack do time já é Python.

### Opção C — Hono + DuckDB-WASM (edge-first)

```
notebook → CSVs → parquet → R2/S3
                                  │
                                  ▼
                        Hono em Cloudflare Workers
                          (DuckDB-WASM em-process)
                                  │
                                  ▼
                              client (fetch)
```

| Pro | Con |
|---|---|
| Latência global <50ms (edge, sem cold start) | DuckDB-WASM tem limites (~100MB heap), sem PostGIS |
| TS-only (consistência com front) | Pipeline Python do notebook precisaria virar SQL/parquet |
| Custo escalável (free tier Cloudflare) | Ops geo-spatial limitado (precisa pré-processar polígonos) |
| Edge cache nativo | Comunidade menor, debugging mais raro |

**Cabe quando:** edge latency é diferencial e queries são analíticas-puras (sem geo complexo).

### Decisão recomendada

**Opção B — FastAPI + Postgres+PostGIS.**

Justificativa:
1. **Continuidade Python.** O indicador é Python (pandas/numpy). FastAPI mantém consistência stack — o mesmo dev que mexe no notebook mexe na API. Migrar pra TS/DuckDB exige reescrever o pipeline.
2. **PostGIS é diferencial real.** Queries como "municípios <50km de porto" ou "overlay com Atlas Eólico" são roadmap registrado (`docs/13_roadmap_indicador_v2.md`). Postgres+PostGIS resolve isso natively. Static JSON e DuckDB-WASM viram contorcionismo.
3. **Tamanho do dataset cresce.** v2.1 inclui IBGE municipal (PIB pc, IDH, % rural) + filtros de aptidão por raster — multiplica colunas. Static JSON deixa de caber em <2MB; DuckDB-WASM começa a roer heap.
4. **Custo aceitável.** $15-30/mês em fase inicial é trivial. Free tiers (Supabase, Railway) cobrem o MVP.

**Quando reavaliar:**
- Se traffic crescer >100k req/dia → adicionar Redis cache mais agressivo, considerar mover ranking estático pra CDN.
- Se latência global virar bottleneck → adicionar Cloudflare na frente.
- Se a equipe perder o dev Python → considerar Opção C com DuckDB.

---

## 5. Arquitetura proposta (Opção B)

```
┌──────────────────────────────────────────────────────────────────┐
│                        OFFLINE / BATCH                           │
│                                                                  │
│   ANEEL SIGA ─┐                                                  │
│   ANP        ─┼──► Notebook Python ──► CSVs locais              │
│   SIGET      ─┘    (scriptAnalysis.ipynb)                        │
│                              │                                   │
│                              ▼                                   │
│                    loader script (Python)                        │
│                              │                                   │
│                              ▼                                   │
│                    Postgres+PostGIS (managed)                    │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                              ▼      ONLINE                       │
│                     FastAPI (uvicorn)                            │
│                       │                                          │
│                       ▼                                          │
│                   Redis (opcional, query cache)                  │
│                       │                                          │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        ▼
                ┌───────────────┐         ┌──────────────┐
                │  Radar PID    │         │  Parceiros   │
                │  web (front)  │         │  (futuro)    │
                └───────────────┘         └──────────────┘
```

### 5.1 Componentes

| Componente | Tecnologia | Responsabilidade |
|---|---|---|
| Indicador batch | Python 3.11 + pandas/numpy | Computa score (notebook agendado) |
| DB | Postgres 16 + PostGIS 3.4 (managed: Supabase/Neon/Railway) | Persistência + queries geo |
| Loader | Python script (cron/manual trigger) | CSV → Postgres COPY/upsert |
| API | FastAPI 0.110 + Pydantic v2 + SQLAlchemy 2.0 + asyncpg | HTTP layer, validação, ORM |
| Cache | Redis 7 (opcional na fase MVP) | Query cache por endpoint+params |
| Auth | Nenhum no MVP; API key via header em v2.1+ | Rate limit por IP no início |
| Observability | Structured logs (JSON) + Sentry | Errors + slow queries |
| Deploy API | Railway / Fly.io / Cloud Run | Container Docker multi-stage |
| Deploy DB | Supabase / Neon (free tier) | Postgres managed |

### 5.2 Data flow de update

1. **Trigger:** humano ou cron mensal aciona `make refresh-data`.
2. **Notebook re-roda:** baixa SIGA/ANP/SIGET atualizados, gera 3 CSVs.
3. **Loader script:** valida schema, calcula `snapshot_data = today()`, faz `COPY` em transação:
   ```sql
   BEGIN;
   COPY municipio_features FROM 'municipio_features.csv' WITH (FORMAT csv, HEADER);
   COPY mcda_score FROM 'mcda_ranking_completo.csv' WITH (FORMAT csv, HEADER);
   -- novos snapshots; antigos preservados
   COMMIT;
   ```
4. **API invalida cache** Redis (key namespace `mcda:*`).
5. **Cliente** detecta novo `snapshot_data` no health check e força reload.

---

## 6. Contrato da API

### 6.1 Princípios
- REST + JSON, versionado em `/v2/`.
- Paginação cursor-based em listagens grandes (limit/offset legacy nos MVPs).
- Erros padronizados: `{ "error": { "code": "...", "message": "...", "details": {...} } }`.
- `Cache-Control: public, max-age=3600` em GETs (snapshot é estável até próximo refresh).

### 6.2 Endpoints

#### `GET /v2/health`
```json
{
  "status": "ok",
  "snapshot_data": "2026-05-10",
  "n_municipios": 1938,
  "n_scores": 9690
}
```

#### `GET /v2/municipios`
Listagem filtrada de municípios (com score top da fonte default ou filtrada).

**Query params:**
| Param | Tipo | Default | Descrição |
|---|---|---|---|
| `uf` | str (2 chars) | none | filtra por UF |
| `fonte` | enum | "Solar" | qual fonte rankear |
| `min_score` | float | 0.0 | filtra score ≥ X |
| `min_completeness` | float | 0.0 | filtra `data_completeness` ≥ X |
| `top` | int | 100 | top N por score |
| `bbox` | "minLon,minLat,maxLon,maxLat" | none | bounding box geo (PostGIS ST_MakeEnvelope) |

**Resposta:**
```json
{
  "snapshot_data": "2026-05-10",
  "fonte": "H2 Verde",
  "total": 50,
  "items": [
    {
      "id": 4321,
      "nome": "Pecém",
      "uf": "CE",
      "lat": -3.547,
      "lon": -38.815,
      "score": 0.6094,
      "eco_score": 0.8109,
      "soc_score": 0.2503,
      "env_score": 0.6999,
      "data_completeness": 1.0,
      "rank": 1
    }
  ]
}
```

#### `GET /v2/municipios/{id}`
Detalhes completos de 1 município: features brutas + scores nas 5 fontes + instrumentos.

```json
{
  "id": 4321,
  "nome": "Pecém",
  "uf": "CE",
  "lat": -3.547,
  "lon": -38.815,
  "features": { "eco_mw_instalado": 1234.5, "...": "..." },
  "scores": [
    { "fonte": "H2 Verde", "score": 0.61, "rank": 1, "data_completeness": 1.0, "...": "..." },
    { "fonte": "Solar", "score": 0.45, "rank": 2, "...": "..." }
  ],
  "instrumentos": [
    { "categoria": "REIDI", "status": "confirmado", "justificativa": "..." },
    { "categoria": "SUDENE", "status": "elegibilidade", "justificativa": "..." }
  ],
  "snapshot_data": "2026-05-10"
}
```

#### `GET /v2/ranking`
Ranking puro por fonte.

**Query params:** `fonte` (req), `top` (default 50), `min_completeness`, `uf` opcional.

#### `GET /v2/instrumentos/{municipio_id}`
Instrumentos públicos aplicáveis ao município (info-only, sem score derivado).

#### `GET /v2/insights`
4 insights rotativos (substitui o array hardcoded `INSIGHTS_HEADER` do front).
```json
{
  "snapshot_data": "2026-05-10",
  "items": [
    "PA lidera H2 Verde — Pecém com score 0,61, 4 dos top 5 em PA e MG.",
    "REIDI 2025 aprovou 47 novos projetos renováveis, 60% no Nordeste.",
    "Biometano: 51% da capacidade outorgada está ociosa — gargalo a destravar.",
    "Vale do Aço: oportunidade biometano-siderurgia mapeada em 4 municípios."
  ]
}
```
Os insights podem ser semi-gerados (ranking-derived) na hora do load, ou hardcoded num arquivo separado curado pela equipe.

### 6.3 Endpoints futuros (v2.1+)

- `POST /v2/score/custom` — recalcula com pesos customizados (`{eco: 0.5, soc: 0.2, env: 0.3}`). **Aceitar com ressalva:** a recomputação volta a ser hot path. Limitar a usuários autenticados.
- `GET /v2/aptidao/{municipio_id}` — aptidão geográfica derivada de Atlas Eólico/PVGIS/PAM (após implementar §1.4 do roadmap).
- `GET /v2/historico/{municipio_id}` — séries temporais por snapshot.
- `WS /v2/live` — push de updates quando snapshot muda (low priority).

---

## 7. Deployment

### 7.1 Stack de produção

| Camada | Provedor primário | Backup | Justificativa |
|---|---|---|---|
| DB | **Neon** (Postgres serverless) | Supabase, Railway | Free tier 500MB, branching (test envs grátis), bom autoscale |
| API | **Railway** (Docker) | Fly.io, Cloud Run | Free tier $5 crédito, deploy fácil via Git push |
| Cache | **Upstash Redis** (serverless) | Redis Cloud | Free tier 10k req/dia |
| CDN | **Cloudflare** (em frente da API) | n/a | Free, cache de GETs, DDoS protection |
| Logs | **Sentry** + stdout JSON | Logtail | Free tier 5k events/mês |

Total estimado fase MVP: **R$ 0–50/mês** dependendo de tráfego.

### 7.2 Imagem Docker (multi-stage)

```dockerfile
FROM python:3.11-slim AS base
ENV PIP_NO_CACHE_DIR=1 PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

FROM base AS deps
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen --no-dev

FROM base AS runtime
COPY --from=deps /app/.venv /app/.venv
COPY src/ ./src/
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 7.3 Migrations

- **Alembic** para versionar schema.
- Política: nunca destrutivo em produção sem feature flag. Adições são forward-compatible (nullable + default), depreciações em duas etapas.

---

## 8. Atualização do indicador

### 8.1 Cadência
- **Mensal** (1º dia de cada mês) automatizado via GitHub Actions cron + manual override.
- **Sob demanda** quando ANEEL/ANP soltam release importante (ex: novos leilões).

### 8.2 Pipeline
```
GitHub Action (cron) ──► provisiona runner ──► roda notebook ──► pytest valida CSVs
                                                                       │
                                                                       ▼
                                                     loader script → Neon (snapshot novo)
                                                                       │
                                                                       ▼
                                                           POST /v2/admin/cache-flush
                                                                       │
                                                                       ▼
                                                              Slack notification
```

### 8.3 Validação automática (pytest)
- Schema check: 11 colunas em `mcda_ranking_completo.csv`, tipos corretos.
- Sanity: 1.900 ≤ n_municipios ≤ 2.000; 9.500 ≤ n_scores ≤ 10.000.
- Drift: `data_completeness.mean()` não cai >5pp vs snapshot anterior.
- Score: `0 ≤ score ≤ 1`, NaN em <2% das linhas.
- Falha em qualquer assertion ⇒ rollback (não dá COMMIT) + page humano.

---

## 9. Segurança / LGPD

### 9.1 LGPD
- **Sem dado pessoal.** Toda informação é municipal agregada (geração de energia, projetos, instrumentos públicos). LGPD não se aplica ao dataset.
- Logs: rotacionados 30 dias, sem PII (não logamos IP completo — só /24).
- Telemetria opcional via Plausible/Umami (anonimizada) em vez de GA.

### 9.2 Auth
- **MVP:** open API, rate limit por IP (10 req/min via Cloudflare).
- **v2.1:** API key opcional via header `X-API-Key` (Supabase Auth ou roll-your-own).
- **v3:** OAuth com Instituto E+ como provider, scopes por tipo de query.

### 9.3 Inputs
- Pydantic valida todos os params (tipos, ranges, enum).
- Queries SQL parametrizadas via SQLAlchemy (zero risco de injection).
- Sem upload de file no MVP.

### 9.4 Secrets
- Connection strings em env vars (Railway Secrets).
- Nunca em git (já gitignored: `.env`, `.env.local`).
- Rotação trimestral.

---

## 10. Cache + performance

### 10.1 Targets
- p50 latency: <100ms (sem cache).
- p95 latency: <300ms (sem cache).
- Cache hit ratio: >70% após warmup.

### 10.2 Camadas de cache
1. **Cloudflare CDN** — TTL 1h em GETs, invalidado por header `Cache-Tag` quando `snapshot_data` muda.
2. **Redis (Upstash)** — query result cache, TTL 24h, key = hash(method+path+sorted(query_params)).
3. **Postgres** — índices em `(fonte, score DESC)`, `(municipio_id) WHERE rank=1`, GIST em centroide.

### 10.3 Hot queries (otimizar primeiro)
- `GET /v2/municipios?fonte=Solar&top=50` (homepage do front)
- `GET /v2/municipios/{id}` (clique no mapa)
- `GET /v2/ranking?fonte=H2 Verde` (leaderboard)

Pré-aqueça essas no deploy (warmup script que faz N requisições "padrão" pra popular Redis).

---

## 11. Migração mock → prod (front)

### 11.1 Estratégia: feature flag por env

```js
// web/src/api.js (novo)
const API_BASE = import.meta.env.VITE_API_BASE; // undefined em dev mock

export async function fetchMunicipios(params = {}) {
  if (!API_BASE) {
    const { MUNICIPIOS } = await import('./data');
    return { items: MUNICIPIOS, snapshot_data: 'mock' };
  }
  const url = new URL(`${API_BASE}/v2/municipios`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const r = await fetch(url);
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
}
```

### 11.2 Etapas
1. **Sprint pós-hackathon:** API entra em staging com dataset real.
2. **Front em dev** já consome staging via `VITE_API_BASE=https://api-staging.radarpid.org`. Mock data fica como fallback offline.
3. **Comparação visual:** snapshot dos top-50 com mock vs API. Discrepâncias documentadas.
4. **Cutover gradual:** 10% do tráfego → 50% → 100% (LaunchDarkly ou env flag).
5. **Mock fica deprecated:** removido do `data.js` em release v2.0 estável.

---

## 12. Custo estimado

| Item | Provedor | Tier inicial | Custo/mês | Limite até cobrar |
|---|---|---|---|---|
| Postgres | Neon | Free | R$ 0 | 500 MB storage, 100h compute |
| API Compute | Railway | Hobby | R$ 25 | 8 GB RAM, 100 GB egress |
| Redis | Upstash | Free | R$ 0 | 10k req/dia |
| CDN | Cloudflare | Free | R$ 0 | tráfego ilimitado |
| Logs | Sentry | Developer | R$ 0 | 5k events/mês |
| Domínio | Cloudflare Registrar | n/a | R$ 50/ano (~R$ 5/mês) | n/a |
| **Total MVP** | | | **R$ 30/mês** | até ~10k usuários únicos/mês |

Quando escalar (>50k usuários únicos/mês):
- Postgres → Neon Scale (R$ 90/mês) ou Supabase Pro (R$ 125/mês).
- API → Railway Pro (R$ 100/mês) ou Cloud Run (pay-per-request, ~R$ 50-200/mês).
- Total: R$ 200-400/mês.

---

## 13. Roadmap de implementação

| Sprint | Duração | Entregável |
|---|---|---|
| **Sprint 0** — setup | 3 dias | Repo backend `radar-pid-api`, scaffold FastAPI, Dockerfile, CI básico, Neon free DB provisionada |
| **Sprint 1** — schema + loader | 1 semana | Migrations Alembic, loader Python que ingere os 3 CSVs, smoke tests |
| **Sprint 2** — endpoints core | 1 semana | `/health`, `/municipios`, `/municipios/{id}`, `/ranking`, com paginação e validação Pydantic |
| **Sprint 3** — geo + cache | 1 semana | PostGIS queries (`bbox`, distância a porto), Redis cache layer, CDN config |
| **Sprint 4** — front integration | 1 semana | Front consome API via env flag, comparação mock vs API, cutover controlado |
| **Sprint 5** — observability + hardening | 1 semana | Sentry, structured logs, rate limit, runbook ops, alertas |

**Total para v2.0 production-ready: ~6 semanas (1 dev FT) ou 10-12 semanas (1 dev meio-período).**

Sprints 6+ (paralelos): integração IBGE socioeconômico, filtros de aptidão geográfica (ver `docs/13_roadmap_indicador_v2.md`).

---

## 14. Open questions / riscos

### 14.1 Open questions
- **Quem hosta o domínio?** Sub do `emaisenergia.org` ou domínio próprio (`radarpid.org.br` / `radarpid.com.br`)? — discutir com Instituto E+.
- **Custo é coberto pelo Instituto E+ ou pela equipe?** Free tier funciona até ~10k usuários; depois precisa orçamento mensal definido.
- **Releases públicos do dataset:** o snapshot mensal vai ser disponibilizado via download (CSV/parquet)? Argumento pro: open data, transparência. Argumento contra: cliente baixa e não usa API.
- **Quem escreve os insights rotativos?** Equipe técnica ou time de comunicação E+?

### 14.2 Riscos
- **Notebook → API drift.** Se alguém muda a fórmula no notebook sem atualizar testes da API, o snapshot pode quebrar contracts. **Mitigação:** schema validation no loader + golden-set tests (top-50 esperado por fonte).
- **PostGIS aprendizado.** Time pode não ter experiência. **Mitigação:** sprint 0 inclui training session de 1 dia + pareamento com consultor externo se necessário.
- **Rate limit insuficiente.** Se um parceiro fizer scraping agressivo, esgota tier free. **Mitigação:** Cloudflare WAF + rate limit por ASN, não só IP.
- **Schema migration breaking.** Mudar `mcda_score` exige cuidado com snapshots históricos. **Mitigação:** sempre adicionar coluna nova nullable + janela de coexistência.

---

## 15. Decisões fechadas (sumário)

| Decisão | Valor |
|---|---|
| Stack | FastAPI + Postgres+PostGIS + Redis (Opção B) |
| DB managed | Neon (Postgres serverless) |
| Deploy API | Railway |
| Cache CDN | Cloudflare em frente da API |
| Atualização do dataset | Mensal via cron, manual override; snapshot histórico preservado |
| Auth | Open MVP, API key em v2.1, OAuth em v3 |
| LGPD | N/A (sem dado pessoal); telemetria anonimizada |
| Score recompute | **NÃO em hot path.** Pré-calculado offline. Custom-weights só em endpoint dedicado autenticado (v2.1+) |
| Incentivos públicos | Endpoint dedicado, NUNCA somam ao score |
| Estratégia de migração | Feature flag por env, cutover gradual |
| Custo target | <R$ 30/mês no MVP, <R$ 400/mês em escala 50k MAU |

---

## 16. Resumo executivo (1 frase)

API REST fina (FastAPI) sobre Postgres+PostGIS, com indicador pré-calculado offline em snapshots mensais, Redis+Cloudflare em camadas de cache e migração feature-flagged do front mock pra dataset real — production-ready em ~6 sprints e ~R$ 30/mês na fase MVP.
