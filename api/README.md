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
