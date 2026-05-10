from __future__ import annotations

import datetime
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

## Contexto temporal (CRÍTICO)
**Hoje é {DATA_HOJE}.** Use isso pra contextualizar respostas:
- Eventos passados são passados — NÃO descreva como futuros nem como "se aproximando".
  Exemplo: a COP30 aconteceu em **novembro de 2025** em Belém. Em 2026 ela já é
  retrospectiva, não "está chegando".
- Linhas de crédito, leilões e regimes de incentivo têm vigências específicas.
  Quando citar instrumentos (REIDI, FNE-Verde, BNDES Climate Fund, leilões
  ANEEL), prefira frases como "vigente em {ANO_HOJE}" ou "na rodada mais
  recente" e não datas hipotéticas.
- Se o usuário perguntar sobre algo de data específica que você não tem certeza,
  seja explícito: "não tenho como confirmar a vigência atual desse instrumento;
  recomendo consultar a fonte oficial" — sempre melhor que inventar prazo.
"""


_MONTHS_PT = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]


def _system_prompt_now() -> str:
    """SYSTEM_PROMPT com a data de hoje injetada — chamado a cada chat_turn pra
    nunca dessincronizar."""
    today = datetime.date.today()
    data_hoje = f"{today.day} de {_MONTHS_PT[today.month - 1]} de {today.year}"
    return (
        SYSTEM_PROMPT
        .replace("{DATA_HOJE}", data_hoje)
        .replace("{ANO_HOJE}", str(today.year))
    )


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

    try:
        chat = client.chats.create(
            model=config.GEMINI_MODEL,
            config=types.GenerateContentConfig(
                temperature=0.4,
                systemInstruction=_system_prompt_now(),
                tools=_build_tools(),
                tool_config=types.ToolConfig(
                    include_server_side_tool_invocations=True,
                ),
            ),
            history=sess.history,
        )
    except Exception:
        log.exception("chats.create failed — limpando histórico da sessão e tentando sem")
        sess.history = []
        chat = client.chats.create(
            model=config.GEMINI_MODEL,
            config=types.GenerateContentConfig(
                temperature=0.4,
                systemInstruction=_system_prompt_now(),
                tools=_build_tools(),
                tool_config=types.ToolConfig(
                    include_server_side_tool_invocations=True,
                ),
            ),
        )

    try:
        response = chat.send_message(full_user_msg)
    except Exception:
        log.exception("send_message inicial falhou")
        return {
            "message": "Não consegui chegar no Gemini agora. Tenta de novo em alguns segundos.",
            "citations": [],
            "tools_used": [],
            "session_id": session_id,
        }

    tools_used: list[str] = []
    max_iters = 8
    hit_limit = False

    for i in range(max_iters):
        try:
            fcs = getattr(response, "function_calls", None) or []
        except Exception:
            log.exception("acessando function_calls falhou")
            fcs = []
        if not fcs:
            break

        function_responses = []
        for fc in fcs:
            # Acesso a fc.name / fc.args pode falhar se SDK retornar shape inesperado
            try:
                fc_name = getattr(fc, "name", None) or "unknown"
                fc_args = dict(getattr(fc, "args", None) or {})
            except Exception:
                log.exception("introspecção de function_call falhou")
                continue

            tools_used.append(fc_name)
            log.info("agent dispatching tool=%s args=%s", fc_name, fc_args)

            try:
                result = dispatch(fc_name, fc_args)
            except Exception as e:  # noqa: BLE001
                log.exception("dispatch crashed for %s", fc_name)
                result = {"error": f"{type(e).__name__}: {e}"}

            try:
                function_responses.append(
                    types.Part.from_function_response(name=fc_name, response=result)
                )
            except Exception:
                log.exception("Part.from_function_response falhou para %s", fc_name)

        if not function_responses:
            # Nada pra mandar de volta — assumimos que o response final já está com o modelo
            break

        try:
            response = chat.send_message(function_responses)
        except Exception:
            log.exception("send_message after function responses failed")
            return {
                "message": "Tive um problema ao processar a resposta — pode refazer a pergunta?",
                "citations": [],
                "tools_used": tools_used,
                "session_id": session_id,
            }

        try:
            still_pending = bool(getattr(response, "function_calls", None) or [])
        except Exception:
            still_pending = False
        if i == max_iters - 1 and still_pending:
            hit_limit = True

    # Citations (grounding) — best-effort, não trava se SDK mudar shape
    citations: list[dict[str, str]] = []
    try:
        for cand in getattr(response, "candidates", None) or []:
            gm = getattr(cand, "grounding_metadata", None)
            for ch in getattr(gm, "grounding_chunks", None) or []:
                web = getattr(ch, "web", None)
                if web:
                    citations.append({"title": web.title or "", "uri": web.uri or ""})
    except Exception:
        log.exception("citations extraction failed (non-fatal)")

    # Extrai texto de forma defensiva — response.text pode lançar quando há
    # tool_calls residuais ou quando a resposta vem só com function_call.
    text = ""
    try:
        text = response.text or ""
    except Exception:
        log.warning("response.text raised; extracting text parts manually")
        try:
            parts = response.candidates[0].content.parts
            text = "".join(getattr(p, "text", "") or "" for p in parts)
        except Exception:
            log.exception("manual text extraction failed")
            text = ""

    if not text and hit_limit:
        text = (
            "Cheguei no limite de consultas pra montar a resposta. "
            "Pode reformular a pergunta de forma mais específica? "
            "(ex: 'top 5 H2 Verde em PA' em vez de pedir várias coisas de uma vez)"
        )
    elif not text:
        text = "Não consegui formular uma resposta. Pode tentar novamente?"

    try:
        store.update(session_id, chat.get_history())
    except Exception:
        log.exception("session update failed (non-fatal)")

    return {
        "message": text,
        "citations": citations,
        "tools_used": tools_used,
        "session_id": session_id,
    }
