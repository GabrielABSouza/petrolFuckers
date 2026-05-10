from __future__ import annotations

import logging
import traceback
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .llm import chat_turn

log = logging.getLogger("radar-pid.agente")
router = APIRouter(prefix="/agente", tags=["agente"])


class ChatContext(BaseModel):
    municipio_selecionado: str | None = None
    modo: str | None = None


class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str = Field(..., min_length=1, max_length=2000)
    context: ChatContext | None = None


class Citation(BaseModel):
    title: str | None = None
    uri: str | None = None


class ChatResponse(BaseModel):
    session_id: str
    message: str
    citations: list[Citation] = []
    tools_used: list[str] = []


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    sid = req.session_id or str(uuid.uuid4())
    log.info("chat sid=%s msg=%r ctx=%s", sid, req.message[:120], req.context.model_dump() if req.context else None)
    try:
        out = chat_turn(sid, req.message, req.context.model_dump() if req.context else None)
    except RuntimeError as e:
        log.exception("agent RuntimeError")
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        # Loga stack inteiro nos logs (uvicorn / Railway) pra postmortem.
        tb = traceback.format_exc()
        log.error("agent crashed sid=%s\n%s", sid, tb)
        # Resposta amigável pro usuário — sem jargão técnico.
        return ChatResponse(
            session_id=sid,
            message=(
                "Não consegui responder agora — pode refazer a pergunta? "
                "Se quiser ajudar a investigar, tenta uma versão mais específica "
                "(ex: \"top 3 H2 Verde em PA\" em vez de \"e essas cidades?\")."
            ),
            citations=[],
            tools_used=[],
        )
    return ChatResponse(**out)
