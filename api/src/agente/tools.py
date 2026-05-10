from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

DATA_DIR = Path(__file__).resolve().parents[2] / "data"

_ranking_df: pd.DataFrame | None = None
_features_df: pd.DataFrame | None = None


def _load() -> None:
    global _ranking_df, _features_df
    if _ranking_df is None:
        _ranking_df = pd.read_parquet(DATA_DIR / "mcda_ranking_completo.parquet")
    if _features_df is None:
        _features_df = pd.read_parquet(DATA_DIR / "municipio_features.parquet")


def search_municipio(
    uf: str | None = None,
    fonte: str | None = None,
    top: int = 10,
    min_completeness: float = 0.0,
    municipio_nome: str | None = None,
) -> dict[str, Any]:
    _load()
    top = max(1, min(20, top))

    if municipio_nome:
        nome = municipio_nome.strip().upper()
        feat = _features_df[_features_df["municipio"] == nome]
        if feat.empty:
            return {"error": f"municipio '{nome}' não encontrado"}
        scores = _ranking_df[_ranking_df["municipio"] == nome]
        return {
            "municipio": nome,
            "uf": str(feat.iloc[0]["uf"]),
            "lat": float(feat.iloc[0]["lat"]),
            "lon": float(feat.iloc[0]["lon"]),
            "scores": scores.replace({np.nan: None}).to_dict(orient="records"),
        }

    df = _ranking_df.copy()
    if fonte:
        df = df[df["fonte"] == fonte]
    if uf:
        df = df[df["uf"] == uf.upper()]
    df = df[df["data_completeness"] >= min_completeness]
    df = df[df["score"].notna()].sort_values("score", ascending=False).head(top)
    return {
        "fonte": fonte,
        "uf": uf,
        "total": int(len(df)),
        "items": df.replace({np.nan: None}).to_dict(orient="records"),
    }


TOOL_DISPATCH = {
    "search_municipio": search_municipio,
}


def dispatch(name: str, args: dict[str, Any]) -> dict[str, Any]:
    fn = TOOL_DISPATCH.get(name)
    if fn is None:
        return {"error": f"tool '{name}' não existe"}
    try:
        return fn(**args)
    except Exception as e:
        return {"error": f"{type(e).__name__}: {e}"}
