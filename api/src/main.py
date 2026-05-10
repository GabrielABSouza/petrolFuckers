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
    version="0.2.0",
    description="Score MCDA por município × fonte de energia limpa + Agente Copiloto.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
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


from src.agente.router import router as agente_router  # noqa: E402
app.include_router(agente_router)
