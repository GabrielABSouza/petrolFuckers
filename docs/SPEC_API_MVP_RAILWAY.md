# SPEC — API MVP Radar PID (FastAPI + Railway, deploy hoje)

> **Audiência:** agente implementador. Spec prescritiva — implementa exatamente o que está aqui, na ordem em que está.
>
> **Objetivo:** subir uma API pública no Railway hoje (10 mai 2026, antes das 21:59 BRT) que serve o indicador real (1.938 municípios × 5 fontes) via FastAPI lendo parquet em memória. URL pública vai pro pitch como prova de que v2 já está em staging.
>
> **Tempo estimado:** 1,5–2h de implementação local + 30min de deploy/verificação no Railway.
>
> **Escopo:** MVP. Deploy verde + 5 endpoints respondendo. Sem testes automatizados, sem CI, sem auth, sem cache, sem observability além de logs stdout.

---

## 1. Pacto de não-fazer

Você **NÃO PODE**:

1. Adicionar testes pytest, fixtures, CI, GitHub Actions — fora de escopo, perda de tempo hoje.
2. Adicionar Postgres, Redis, ORM (SQLAlchemy), Alembic — DataFrame em memória basta.
3. Adicionar autenticação, API keys, rate limiting custom — Railway tem rate limit de plataforma.
4. Adicionar logging library (structlog, loguru) — `print()` ou logging stdlib basta; Railway captura stdout.
5. Adicionar observability (Sentry, OTel) — fora de escopo hoje.
6. Adicionar endpoints fora dos 5 listados em §3.
7. Mudar o front (`web/`) — front continua com mocks. Conexão front↔API é tarefa separada (se sobrar tempo, fora dessa spec).
8. Tocar em `dados_score_pid` branch — CSVs são copiados de lá pra `main`, mas o branch original não é alterado.

---

## 2. Decisões fechadas

| Decisão | Valor |
|---|---|
| Estrutura | Monorepo: `api/` na raiz de `petrolFuckers`, ao lado de `web/` |
| Branch | `main` (não cria branch separada) |
| Stack | FastAPI 0.110+ + uvicorn + pandas + pyarrow + pydantic v2 |
| Python | 3.11 |
| Fonte de dados | 2 arquivos parquet em `api/data/`, gerados a partir dos CSVs de `origin/dados_score_pid` |
| Framework de deploy | Railway (Docker) |
| Configuração Railway | `api/railway.toml` + Root Directory configurada no painel pra `/api` |
| Porta | `$PORT` (Railway injeta env var; default 8000 em dev) |
| CORS | aberto `*` no MVP — restringir pro domínio do front é v2.1 |
| Snapshot date | hardcoded `"2026-05-10"` no MVP |
| Insights | hardcoded no código (4 strings); endpoint só serve eles |
| NaN em respostas | converter pra `null` (JSON não aceita NaN) |
| README de uso | sim, em `api/README.md` (curto, pra recrutador/jurado conseguir bater curl) |

---

## 3. Endpoints

```
GET  /health
GET  /municipios?uf=&fonte=&top=&min_completeness=
GET  /municipios/{nome}
GET  /ranking?fonte=&top=
GET  /insights
```

Detalhes em §5 (código).

---

## 4. Estrutura de arquivos a criar

```
petrolFuckers/
├── api/                                   ← NOVO
│   ├── README.md
│   ├── pyproject.toml
│   ├── Dockerfile
│   ├── railway.toml
│   ├── .dockerignore
│   ├── .gitignore
│   ├── data/
│   │   ├── mcda_ranking_completo.parquet
│   │   └── municipio_features.parquet
│   └── src/
│       └── main.py
└── (resto do repo, intocado)
```

---

## 5. Etapa-a-etapa

### 5.1 — Gerar os parquets a partir do branch `dados_score_pid`

```bash
cd /Volumes/ExtremePro/hackaton_E+
git fetch origin dados_score_pid

# Cria worktree temporário pra extrair CSVs
git worktree add /tmp/mcda_export origin/dados_score_pid

# Cria pasta de destino
mkdir -p api/data

# Converte CSV → parquet (parquet é menor, mais rápido pra carregar)
python3 << 'PY'
import pandas as pd
src = "/tmp/mcda_export/data/processed"
dst = "api/data"

ranking = pd.read_csv(f"{src}/mcda_ranking_completo.csv")
features = pd.read_csv(f"{src}/municipio_features.csv")

ranking.to_parquet(f"{dst}/mcda_ranking_completo.parquet", index=False, compression="snappy")
features.to_parquet(f"{dst}/municipio_features.parquet", index=False, compression="snappy")

print(f"ranking:  {ranking.shape} → {dst}/mcda_ranking_completo.parquet")
print(f"features: {features.shape} → {dst}/municipio_features.parquet")
PY

# Limpa worktree
git worktree remove /tmp/mcda_export
```

Verificar:
```bash
ls -la api/data/
# Deve ter 2 .parquet, somando ~150-300 KB
```

### 5.2 — `api/pyproject.toml`

```toml
[project]
name = "radar-pid-api"
version = "0.1.0"
description = "API pública do Radar PID — score MCDA municipal de transição energética"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.110,<0.120",
    "uvicorn[standard]>=0.27,<0.40",
    "pandas>=2.0,<3.0",
    "pyarrow>=14,<20",
    "pydantic>=2.5,<3",
]

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[tool.setuptools]
packages = ["src"]
```

### 5.3 — `api/src/main.py`

Crie o arquivo **exatamente** com este conteúdo:

```python
from contextlib import asynccontextmanager
from pathlib import Path

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SNAPSHOT_DATE = "2026-05-10"

INSIGHTS_HEADER = [
    "PA lidera H2 Verde — Pecém com score 0,61, 4 dos top 5 em PA e MG.",
    "REIDI 2025 aprovou 47 novos projetos renováveis, 60% no Nordeste.",
    "Biometano: 51% da capacidade outorgada está ociosa — gargalo a destravar.",
    "Vale do Aço: oportunidade biometano-siderurgia mapeada em 4 municípios.",
]

FONTES_VALIDAS = {"Solar", "Eolica", "Biometano", "H2 Verde", "Biomassa"}


class State:
    ranking: pd.DataFrame = None
    features: pd.DataFrame = None


state = State()


def _to_records(df: pd.DataFrame) -> list[dict]:
    """DataFrame → list[dict] com NaN → None (JSON-safe)."""
    return df.replace({np.nan: None}).to_dict(orient="records")


@asynccontextmanager
async def lifespan(app: FastAPI):
    state.ranking = pd.read_parquet(DATA_DIR / "mcda_ranking_completo.parquet")
    state.features = pd.read_parquet(DATA_DIR / "municipio_features.parquet")
    print(
        f"[radar-pid-api] loaded ranking={state.ranking.shape} "
        f"features={state.features.shape} snapshot={SNAPSHOT_DATE}"
    )
    yield


app = FastAPI(
    title="Radar PID API",
    version="0.1.0",
    description="Score MCDA por município × fonte de energia limpa.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "snapshot_data": SNAPSHOT_DATE,
        "n_municipios": int(state.features.shape[0]),
        "n_scores": int(state.ranking.shape[0]),
    }


@app.get("/municipios")
def list_municipios(
    uf: str | None = Query(None, description="filtra por UF (2 letras)"),
    fonte: str = Query("Solar", description=f"uma de {sorted(FONTES_VALIDAS)}"),
    top: int = Query(100, ge=1, le=2000),
    min_completeness: float = Query(0.0, ge=0.0, le=1.0),
):
    if fonte not in FONTES_VALIDAS:
        raise HTTPException(400, f"fonte inválida; use uma de {sorted(FONTES_VALIDAS)}")

    df = state.ranking[state.ranking["fonte"] == fonte]
    if uf:
        df = df[df["uf"] == uf.upper()]
    df = df[df["data_completeness"] >= min_completeness]
    df = df[df["score"].notna()].sort_values("score", ascending=False).head(top)

    return {
        "snapshot_data": SNAPSHOT_DATE,
        "fonte": fonte,
        "total": int(len(df)),
        "items": _to_records(df),
    }


@app.get("/municipios/{nome}")
def get_municipio(nome: str):
    nome_norm = nome.upper()
    feat = state.features[state.features["municipio"] == nome_norm]
    if feat.empty:
        raise HTTPException(404, f"municipio '{nome}' não encontrado")

    feat_row = feat.iloc[0]
    scores = state.ranking[state.ranking["municipio"] == nome_norm]

    return {
        "municipio": nome_norm,
        "uf": feat_row["uf"],
        "lat": float(feat_row["lat"]),
        "lon": float(feat_row["lon"]),
        "features": _to_records(feat.drop(columns=["municipio", "uf", "lat", "lon"]))[0],
        "scores": _to_records(scores.drop(columns=["municipio", "uf", "lat", "lon"])),
        "snapshot_data": SNAPSHOT_DATE,
    }


@app.get("/ranking")
def ranking(
    fonte: str = Query(..., description=f"uma de {sorted(FONTES_VALIDAS)}"),
    top: int = Query(50, ge=1, le=1000),
):
    if fonte not in FONTES_VALIDAS:
        raise HTTPException(400, f"fonte inválida; use uma de {sorted(FONTES_VALIDAS)}")

    df = state.ranking[
        (state.ranking["fonte"] == fonte) & state.ranking["score"].notna()
    ].sort_values("score", ascending=False).head(top)

    return {
        "snapshot_data": SNAPSHOT_DATE,
        "fonte": fonte,
        "items": _to_records(df),
    }


@app.get("/insights")
def insights():
    return {"snapshot_data": SNAPSHOT_DATE, "items": INSIGHTS_HEADER}
```

### 5.4 — `api/Dockerfile`

```dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY pyproject.toml ./
RUN pip install fastapi==0.111.0 'uvicorn[standard]==0.30.1' pandas==2.2.2 pyarrow==16.1.0 pydantic==2.7.1

COPY src/ ./src/
COPY data/ ./data/

EXPOSE 8000

CMD uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

### 5.5 — `api/railway.toml`

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "uvicorn src.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 60
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

### 5.6 — `api/.dockerignore`

```
__pycache__/
*.pyc
.venv/
.env
.env.*
*.md
.git/
.gitignore
```

### 5.7 — `api/.gitignore`

```
__pycache__/
*.pyc
.venv/
.env
.env.*
.pytest_cache/
dist/
build/
*.egg-info/
```

### 5.8 — `api/README.md`

```markdown
# Radar PID API

API pública do Radar PID — score MCDA por município × fonte de energia limpa.

## Stack

FastAPI + pandas + pyarrow. Serve um snapshot estático carregado em memória na inicialização.

## Endpoints

- `GET /health` — status + tamanho do dataset
- `GET /municipios?fonte=Solar&uf=CE&top=50&min_completeness=0.7` — lista filtrada
- `GET /municipios/{nome}` — features + 5 scores de 1 município (nome em uppercase, sem acento)
- `GET /ranking?fonte=H2 Verde&top=20` — ranking puro
- `GET /insights` — 4 insights rotativos

## Rodar local

```bash
cd api
python -m venv .venv && source .venv/bin/activate
pip install fastapi uvicorn[standard] pandas pyarrow pydantic
uvicorn src.main:app --reload --port 8000
```

Abre `http://localhost:8000/docs` pra ver Swagger UI.

## Atualização do dataset

O dataset vem do notebook em `dados_score_pid` branch.
Pra atualizar:

```bash
# Re-rode o notebook em dados_score_pid, depois:
python3 -c "
import pandas as pd
ranking = pd.read_csv('../data/processed/mcda_ranking_completo.csv')
features = pd.read_csv('../data/processed/municipio_features.csv')
ranking.to_parquet('data/mcda_ranking_completo.parquet', index=False)
features.to_parquet('data/municipio_features.parquet', index=False)
"
git add data/ && git commit -m "chore(api): refresh dataset" && git push
```

Railway redeploya automaticamente.

## Versão

0.1.0 — MVP hackathon E+ (10 mai 2026). Snapshot: 2026-05-10.
```

### 5.9 — Teste local antes de commitar

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi 'uvicorn[standard]' pandas pyarrow pydantic
uvicorn src.main:app --port 8000 &
sleep 3

# Testes via curl
curl -s http://localhost:8000/health | python3 -m json.tool
curl -s 'http://localhost:8000/municipios?fonte=Solar&top=3' | python3 -m json.tool
curl -s 'http://localhost:8000/ranking?fonte=H2%20Verde&top=5' | python3 -m json.tool
curl -s http://localhost:8000/insights | python3 -m json.tool

# Mata o uvicorn
kill %1
deactivate
```

**Esperado:**
- `/health` retorna `{"status": "ok", "n_municipios": 1938, "n_scores": 9690}`
- `/municipios?fonte=Solar&top=3` retorna 3 itens com `score` numérico
- `/ranking?fonte=H2 Verde&top=5` retorna top 5 (Pecém deve aparecer)
- `/insights` retorna os 4 insights

Se algum endpoint falhar, **pare** e devolva pro humano.

### 5.10 — Commit + push

```bash
cd /Volumes/ExtremePro/hackaton_E+
git add api/
git status   # confirmar todos os files de api/ stagged

git commit -m "$(cat <<'EOF'
feat(api): MVP FastAPI servindo indicador via Railway

- /health, /municipios, /municipios/{nome}, /ranking, /insights
- DataFrame em memória (parquet ~150KB), lifecycle FastAPI
- CORS aberto, healthcheck via Railway
- Dataset: 1938 municípios × 5 fontes (snapshot 2026-05-10)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

## 6. Deploy no Railway (passo humano)

> Esta seção é pro Gabriel rodar no painel do Railway, não pro agente. O agente PARA aqui após push e devolve pro humano.

### 6.1 Criar serviço no Railway

1. Acessar https://railway.app/new
2. Login (GitHub)
3. **New Project** → **Deploy from GitHub repo** → escolher `petrolFuckers`
4. **Configure Service:**
   - **Root Directory:** `/api`
   - **Watch Paths:** `api/**` (opcional — só rebuilda quando mexer em `api/`)
   - **Environment Variables:** nenhuma necessária no MVP
5. **Deploy**

Railway detecta `Dockerfile` e builda automaticamente. Build leva ~3-5min.

### 6.2 Gerar URL pública

1. No painel do serviço → **Settings** → **Networking** → **Generate Domain**
2. URL gerada: `radar-pid-api-production-XXXX.up.railway.app`
3. (Opcional) custom domain: `api.radarpid.org` — exige DNS, **fora de escopo hoje**.

### 6.3 Verificar

```bash
URL="https://radar-pid-api-production-XXXX.up.railway.app"  # cola a URL real

curl -s $URL/health | python3 -m json.tool
curl -s "$URL/ranking?fonte=H2%20Verde&top=5" | python3 -m json.tool
curl -s "$URL/municipios/PECEM" | python3 -m json.tool
```

Se todos retornam 200 + JSON válido, **deploy verde**.

### 6.4 Adicionar URL ao pitch

- Slide do pitch: "v2 já está em staging: `radar-pid-api-production-XXXX.up.railway.app/docs` (Swagger UI navegável)".
- Mencionar nos `equipe-464/Documentação-OBRIGATÓRIO/CONTEUDO_sobre-parte-tecnica.md` se quiser fortalecer a entrega técnica.

---

## 7. Critério de aceite (DONE template)

```
DONE — API MVP no Railway

Local:
- [x] §5.1 parquets gerados em api/data/ (~150KB cada)
- [x] §5.2 pyproject.toml
- [x] §5.3 src/main.py com 5 endpoints
- [x] §5.4 Dockerfile
- [x] §5.5 railway.toml
- [x] §5.6/.7 dockerignore + gitignore
- [x] §5.8 README.md
- [x] §5.9 todos os 4 endpoints respondem 200 em local
- [x] §5.10 commit + push em main

Aguardando humano:
- [ ] §6.1 criar serviço Railway com Root Directory=/api
- [ ] §6.2 gerar URL pública
- [ ] §6.3 verificar com curl
- [ ] §6.4 adicionar URL ao pitch + docs/CONTEUDO
```

---

## 8. Rollback

```bash
cd /Volumes/ExtremePro/hackaton_E+
git revert <hash do commit feat(api)>
git push origin main
```

No Railway: **Settings** → **Delete Service** se quiser remover o deploy.

---

## 9. Resumo executivo (1 frase)

API FastAPI fina lendo 2 parquets (1938 mun + 9690 scores) em memória, deploy via Dockerfile no Railway com 5 endpoints (/health, /municipios, /ranking, /insights), sem auth/cache/DB no MVP — pronto pra entrar no pitch como "v2 já está no ar".
