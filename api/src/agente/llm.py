from __future__ import annotations

import logging
from typing import Any

from google import genai
from google.genai import types

from .config import config
from .sessions import store
from .tools import dispatch

log = logging.getLogger(__name__)

SYSTEM_PROMPT = """Você é o Copiloto do Radar PID — uma plataforma de triagem de oportunidades de transição energética por município brasileiro.

## Quem você é
Analista técnico, direto, intolerante a achismo. Você fundamenta toda resposta em DADOS — score MCDA computado pela equipe, documentos do projeto, ou busca web em tempo real para incentivos públicos atualizados.

## Suas capacidades (use proativamente)
1. **search_municipio** — busca municípios na nossa base (1.938 mun × 5 fontes). Use sempre que o usuário pedir comparações, rankings, ou detalhes de município específico. Filtros: uf, fonte (Solar/Eolica/Biometano/H2 Verde/Biomassa), top, min_completeness (0-1), municipio_nome.
2. **file_search** — RAG sobre nossos documentos internos (metodologia do score, decisões de arquitetura, persona, EDA empírica, camada de incentivos). Use quando perguntarem "como o score é calculado", "por que essa fórmula", "quais as limitações", "qual a fonte dos dados".
3. **google_search** — busca web em tempo real. Use SOMENTE para informações que mudam frequentemente: instrumentos públicos federais novos (REIDI 2026, SUDENE, FNE-Verde, BNDES Climate Fund), notícias setoriais, mudanças regulatórias recentes. Sempre cite a fonte.

## Como responder
- **Conciso.** Português brasileiro. Zero clichê. 1-2 parágrafos curtos no máximo, ou bullets se for lista.
- **Cite sempre a fonte do número.** "Pecém tem score 0,61 (snapshot 2026-05-10)" e não "Pecém tem alto score".
- **Distinguir confirmado/proxy/elegibilidade preliminar** quando falar de incentivos públicos. NUNCA afirme "esse município recebe REIDI" sem checar — diga "elegibilidade preliminar" se for proxy.
- **Se a pergunta é sobre dados que você não tem**, peça por mais contexto OU diga claramente "não tenho esse dado" — nunca invente.
- **Microcopy obrigatório:** evite "garantido", "melhor investimento", "retorno certo". Use "oportunidade candidata", "priorizar estudo", "score de triagem", "elegibilidade preliminar".
- **Não substitua parecer técnico/jurídico/financeiro.** Mencione isso quando a pergunta cruzar essa linha.
"""


def _build_tools() -> list[types.Tool]:
    search_municipio_decl = types.FunctionDeclaration(
        name="search_municipio",
        description=(
            "Busca municípios na base interna do Radar PID. "
            "Sem filtros: retorna top-N por score. Com municipio_nome: retorna detalhes daquele município."
        ),
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "uf": types.Schema(type=types.Type.STRING, description="código de UF (2 letras), ex: 'CE'"),
                "fonte": types.Schema(
                    type=types.Type.STRING,
                    description="uma de: Solar, Eolica, Biometano, H2 Verde, Biomassa",
                ),
                "top": types.Schema(type=types.Type.INTEGER, description="máximo de itens (1-20)"),
                "min_completeness": types.Schema(
                    type=types.Type.NUMBER,
                    description="filtra data_completeness ≥ X (0-1)",
                ),
                "municipio_nome": types.Schema(
                    type=types.Type.STRING,
                    description="nome do município para detalhes (uppercase, sem acento)",
                ),
            },
        ),
    )

    # NOTA: Gemini 3 Flash Preview não permite combinar googleSearch + fileSearch
    # no mesmo request. Mantemos fileSearch (Q&A metodológico vale mais no pitch).
    # Para news externas (REIDI 2026 etc), usuário pode perguntar diretamente e
    # o modelo pode usar conhecimento próprio + apontar limitação.
    return [
        types.Tool(functionDeclarations=[search_municipio_decl]),
        types.Tool(fileSearch=types.FileSearch(fileSearchStoreNames=[config.GEMINI_FILE_SEARCH_STORE_ID])),
    ]


_client: genai.Client | None = None


def _client_lazy() -> genai.Client:
    global _client
    if _client is None:
        config.assert_ready()
        _client = genai.Client(api_key=config.GEMINI_API_KEY)
    return _client


def chat_turn(session_id: str, user_message: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
    client = _client_lazy()
    sess = store.get(session_id)

    full_user_msg = user_message
    if context:
        ctx_lines = []
        if context.get("municipio_selecionado"):
            ctx_lines.append(f"[contexto: usuário tem '{context['municipio_selecionado']}' selecionado no mapa]")
        if context.get("modo"):
            ctx_lines.append(f"[contexto: modo de análise = {context['modo']}]")
        if ctx_lines:
            full_user_msg = "\n".join(ctx_lines) + "\n\n" + user_message

    chat = client.chats.create(
        model=config.GEMINI_MODEL,
        config=types.GenerateContentConfig(
            temperature=0.4,
            systemInstruction=SYSTEM_PROMPT,
            tools=_build_tools(),
            tool_config=types.ToolConfig(
                include_server_side_tool_invocations=True,
            ),
        ),
        history=sess.history,
    )

    response = chat.send_message(full_user_msg)
    tools_used: list[str] = []
    max_iters = 6

    for _ in range(max_iters):
        fcs = getattr(response, "function_calls", None) or []
        if not fcs:
            break
        function_responses = []
        for fc in fcs:
            tools_used.append(fc.name)
            log.info("agent dispatching tool=%s args=%s", fc.name, dict(fc.args or {}))
            result = dispatch(fc.name, dict(fc.args or {}))
            function_responses.append(
                types.Part.from_function_response(name=fc.name, response=result)
            )
        response = chat.send_message(function_responses)

    citations = []
    candidates = getattr(response, "candidates", None) or []
    for cand in candidates:
        gm = getattr(cand, "grounding_metadata", None)
        if gm and getattr(gm, "grounding_chunks", None):
            for ch in gm.grounding_chunks:
                web = getattr(ch, "web", None)
                if web:
                    citations.append({"title": web.title, "uri": web.uri})

    store.update(session_id, chat.get_history())

    return {
        "message": response.text or "",
        "citations": citations,
        "tools_used": tools_used,
        "session_id": session_id,
    }
