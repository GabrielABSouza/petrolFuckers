from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .llm import chat_turn

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
    try:
        out = chat_turn(sid, req.message, req.context.model_dump() if req.context else None)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"agent error: {e}")
    return ChatResponse(**out)
