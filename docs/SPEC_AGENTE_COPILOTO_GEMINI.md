# SPEC — Agente Copiloto Radar PID (Gemini 3 Flash + File Search + Tools)

> **Audiência:** agente implementador. Spec prescritiva.
>
> **Objetivo:** plugar um agente conversacional de verdade no painel direito do Radar PID. Substitui o mock atual (`gerarResposta` em `Copiloto.jsx`) por chamadas a `POST /agente/chat` no FastAPI, que orquestra Gemini 3 Flash com 3 capacidades: busca em municípios (custom function), RAG sobre os docs do projeto (Google File Search nativo), e busca web em tempo real (Google Search grounding nativo).
>
> **Branch:** `agente-copiloto` (baseada em `backend-mvp`).
>
> **Pré-requisito hard:** spec `SPEC_API_MVP_RAILWAY.md` da `backend-mvp` precisa ter sido implementada localmente — `api/src/main.py`, `api/pyproject.toml`, `api/Dockerfile` e `api/data/*.parquet` precisam existir. Esta spec **adiciona** sobre essa base.
>
> **Tempo estimado:** 3–4h impl + 30min deploy + 30min teste end-to-end.

---

## 1. Pacto de não-fazer

Você **NÃO PODE**:

1. Persistir memória cross-session — `Dict` em RAM por session_id basta no MVP.
2. Adicionar testes pytest, linters, CI.
3. Implementar streaming de respostas — request/response síncrono.
4. Implementar moderação custom — Gemini tem safety settings default.
5. Adicionar auth, rate limit custom no `/agente` — Railway tem rate limit de plataforma.
6. Tocar em `dados_score_pid` branch.
7. Mudar `data.js`, `BrazilMap.jsx`, `App.jsx` no front. Apenas `Copiloto.jsx`.
8. Implementar tools custom além de `search_municipio` — File Search e Google Search são nativos do Gemini.
9. Mexer em `scoring.js`, `index.css`, `tailwind.config.js` no front.
10. Subir o store_id do File Search em `.env` versionado — vai em `.env.example` como placeholder + `.env` real (gitignored).

---

## 2. Decisões fechadas

| Decisão | Valor |
|---|---|
| Stack | FastAPI Python (mesma da backend-mvp) — agente é módulo `api/src/agente/` |
| SDK | `google-genai` ≥ 1.0 |
| Modelo | `gemini-3-flash-preview` |
| Temperatura | `0.4` |
| Tool 1 (custom) | `search_municipio(uf?, fonte?, top?, min_completeness?, municipio_nome?)` — lê parquet local, retorna até 20 linhas |
| Tool 2 (nativo) | `file_search` — store criado uma vez via script, indexa 5 docs principais |
| Tool 3 (nativo) | `google_search` grounding — pra buscar incentivos atualizados (REIDI, SUDENE, BNDES) |
| Memória | `Dict[session_id, list[Content]]` em RAM. TTL 30min. Hard cap 20 turns por session (poda os mais antigos) |
| Endpoint | `POST /agente/chat` — body `{ session_id, message, context? }` |
| Front | `Copiloto.jsx`: substituir `gerarResposta` por `fetch('/agente/chat')`. Mantém UI idêntica. |
| Env vars | `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_FILE_SEARCH_STORE_ID`, `API_BASE_URL` |
| `.env.example` | committado com placeholders |
| `.env` | gitignored |
| File Search setup | script `api/scripts/setup_file_search.py` rodado UMA VEZ pelo humano, retorna store_id pra colar no `.env` |
| CORS | já aberto na backend-mvp; apenas confirmar |

---

## 3. Arquivos novos

```
api/
├── .env.example                          ← NOVO (committado)
├── .env                                  ← NOVO (gitignored)
├── pyproject.toml                        ← EDITADO (add google-genai)
├── .gitignore                            ← EDITADO (já tem .env, garantir)
├── scripts/
│   └── setup_file_search.py              ← NOVO (rodado uma vez)
├── src/
│   ├── main.py                           ← EDITADO (registra router agente)
│   └── agente/
│       ├── __init__.py                   ← NOVO (vazio)
│       ├── config.py                     ← NOVO (env reader)
│       ├── sessions.py                   ← NOVO (memória in-RAM)
│       ├── tools.py                      ← NOVO (search_municipio + dispatch)
│       ├── llm.py                        ← NOVO (Gemini client + agent loop)
│       └── router.py                     ← NOVO (FastAPI route)

web/src/
└── Copiloto.jsx                          ← EDITADO (mock → API)
```

---

## 4. Etapa-a-etapa

### 4.1 — Atualizar `api/pyproject.toml`

Adicionar `google-genai` à lista de dependências:

```toml
dependencies = [
    "fastapi>=0.110,<0.120",
    "uvicorn[standard]>=0.27,<0.40",
    "pandas>=2.0,<3.0",
    "pyarrow>=14,<20",
    "pydantic>=2.5,<3",
    "google-genai>=1.0,<2.0",
]
```

### 4.2 — Criar `api/.env.example`

```dotenv
# Gemini API
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-3-flash-preview

# File Search (preencher após rodar scripts/setup_file_search.py)
GEMINI_FILE_SEARCH_STORE_ID=

# Base URL da API (usado pra debug; em produção Railway define)
API_BASE_URL=http://localhost:8000
```

### 4.3 — Criar `api/.env` (vazio, agente humano preenche)

Conteúdo idêntico ao `.env.example` — humano (Gabriel) cola a `GEMINI_API_KEY` e o `STORE_ID` depois.

### 4.4 — Garantir `.env` em `api/.gitignore`

Linha já existe na spec da backend-mvp. Confirmar com `grep -n "^.env" api/.gitignore`. Se não tiver, adicionar:

```
.env
.env.*
```

### 4.5 — Criar `api/src/agente/__init__.py`

Arquivo vazio (marcador de pacote Python).

### 4.6 — Criar `api/src/agente/config.py`

```python
import os
from pathlib import Path

from dotenv import load_dotenv

# Carrega .env do diretório api/ se existir
ROOT_API = Path(__file__).resolve().parents[2]
ENV_PATH = ROOT_API / ".env"
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)


class Config:
    GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.environ.get("GEMINI_MODEL", "gemini-3-flash-preview")
    GEMINI_FILE_SEARCH_STORE_ID: str = os.environ.get("GEMINI_FILE_SEARCH_STORE_ID", "")
    API_BASE_URL: str = os.environ.get("API_BASE_URL", "http://localhost:8000")

    @classmethod
    def assert_ready(cls) -> None:
        missing = []
        if not cls.GEMINI_API_KEY:
            missing.append("GEMINI_API_KEY")
        if not cls.GEMINI_FILE_SEARCH_STORE_ID:
            missing.append("GEMINI_FILE_SEARCH_STORE_ID")
        if missing:
            raise RuntimeError(
                f"agente: env vars faltando: {', '.join(missing)}. "
                f"Copie .env.example pra .env e preencha."
            )


config = Config()
```

> Nota: precisa adicionar `python-dotenv` em `pyproject.toml`. Adicione `python-dotenv>=1.0` na lista de deps (junto com google-genai). Atualize §4.1 na sua execução.

### 4.7 — Criar `api/src/agente/sessions.py`

```python
"""Memória in-memory por session_id. TTL 30min, max 20 turns."""
from __future__ import annotations

import time
from dataclasses import dataclass, field
from threading import Lock
from typing import Any

SESSION_TTL_SEC = 30 * 60
MAX_TURNS_PER_SESSION = 20


@dataclass
class Session:
    history: list[Any] = field(default_factory=list)  # list[google.genai.types.Content]
    last_seen: float = field(default_factory=time.time)


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, Session] = {}
        self._lock = Lock()

    def get(self, session_id: str) -> Session:
        with self._lock:
            self._gc()
            sess = self._sessions.get(session_id)
            if sess is None:
                sess = Session()
                self._sessions[session_id] = sess
            sess.last_seen = time.time()
            return sess

    def update(self, session_id: str, history: list[Any]) -> None:
        with self._lock:
            sess = self._sessions.setdefault(session_id, Session())
            # Mantém só os últimos MAX_TURNS_PER_SESSION × 2 itens (user+model por turn)
            sess.history = history[-(MAX_TURNS_PER_SESSION * 2):]
            sess.last_seen = time.time()

    def _gc(self) -> None:
        now = time.time()
        expired = [sid for sid, s in self._sessions.items() if now - s.last_seen > SESSION_TTL_SEC]
        for sid in expired:
            del self._sessions[sid]


store = SessionStore()
```

### 4.8 — Criar `api/src/agente/tools.py`

```python
"""Tools custom do agente. Atualmente: search_municipio (lê parquet local)."""
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
    """Busca municípios filtrados. Se municipio_nome for passado, retorna detalhes desse município
    (features + scores nas 5 fontes). Senão, retorna top-N filtrado por uf/fonte/completude.
    """
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


# Mapping de nome → função, usado pelo dispatcher
TOOL_DISPATCH = {
    "search_municipio": search_municipio,
}


def dispatch(name: str, args: dict[str, Any]) -> dict[str, Any]:
    fn = TOOL_DISPATCH.get(name)
    if fn is None:
        return {"error": f"tool '{name}' não existe"}
    try:
        return fn(**args)
    except Exception as e:  # noqa: BLE001 — fail soft pra LLM continuar
        return {"error": f"{type(e).__name__}: {e}"}
```

### 4.9 — Criar `api/src/agente/llm.py`

```python
"""Gemini client + agent loop com tool dispatching nativo."""
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
    """Constrói lista de Tools — custom + nativos."""
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

    return [
        types.Tool(function_declarations=[search_municipio_decl]),
        types.Tool(file_search=types.FileSearch(file_search_store_names=[config.GEMINI_FILE_SEARCH_STORE_ID])),
        types.Tool(google_search=types.GoogleSearch()),
    ]


_client: genai.Client | None = None


def _client_lazy() -> genai.Client:
    global _client
    if _client is None:
        config.assert_ready()
        _client = genai.Client(api_key=config.GEMINI_API_KEY)
    return _client


def chat_turn(session_id: str, user_message: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
    """Executa 1 turn do agente. Retorna dict com {message, citations, tools_used}."""
    client = _client_lazy()
    sess = store.get(session_id)

    # Inject context (município selecionado, modo) no prompt do user — opcional
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
            system_instruction=SYSTEM_PROMPT,
            tools=_build_tools(),
        ),
        history=sess.history,
    )

    response = chat.send_message(full_user_msg)
    tools_used: list[str] = []
    max_iters = 6  # safety bound contra loops

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

    # Extrai citations (do file_search ou google_search) se houver
    citations = []
    candidates = getattr(response, "candidates", None) or []
    for cand in candidates:
        gm = getattr(cand, "grounding_metadata", None)
        if gm and getattr(gm, "grounding_chunks", None):
            for ch in gm.grounding_chunks:
                web = getattr(ch, "web", None)
                if web:
                    citations.append({"title": web.title, "uri": web.uri})

    # Persiste history
    store.update(session_id, chat.get_history())

    return {
        "message": response.text or "",
        "citations": citations,
        "tools_used": tools_used,
        "session_id": session_id,
    }
```

> **Atenção a possíveis ajustes:** os nomes de classes do `google-genai` (especialmente `FileSearch`, `file_search_store_names`) podem variar levemente conforme a versão do SDK. Se `types.FileSearch(...)` falhar, consulte a documentação https://ai.google.dev/gemini-api/docs/file-search — o param exato pode ser `file_search` ou um nome próximo. Ajuste mantendo a semântica (passar o `store_id` configurado em env).

### 4.10 — Criar `api/src/agente/router.py`

```python
"""Router FastAPI pro agente."""
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
    except Exception as e:  # noqa: BLE001 — log + 500 é mais útil que crash
        raise HTTPException(status_code=500, detail=f"agent error: {e}")
    return ChatResponse(**out)
```

### 4.11 — Editar `api/src/main.py`

Adicionar import e register do router. Localize a linha após `app.add_middleware(CORSMiddleware, ...)` e adicione **logo abaixo**:

```python
from src.agente.router import router as agente_router
app.include_router(agente_router)
```

(Se o agente backend-mvp tiver feito o app numa estrutura ligeiramente diferente, ajuste o import path.)

### 4.12 — Criar `api/scripts/setup_file_search.py`

> Este script é rodado UMA VEZ pelo humano (Gabriel) localmente, antes do deploy. Cria o store, faz upload dos docs, retorna o store_id pra colar no `.env`.

```python
"""Bootstrap one-time: cria File Search store no Gemini, faz upload dos docs principais.

Uso (local):
    cd api
    python scripts/setup_file_search.py

Pré-condições:
- GEMINI_API_KEY definida (env var ou .env)
- Estar na raiz do api/ ao executar

Output: store_id imprimido no console. Cole em api/.env como GEMINI_FILE_SEARCH_STORE_ID.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

# Resolve paths
SCRIPT_DIR = Path(__file__).resolve().parent
API_DIR = SCRIPT_DIR.parent
REPO_ROOT = API_DIR.parent
DOCS_DIR = REPO_ROOT / "docs"

# Load env from api/.env
load_dotenv(API_DIR / ".env")
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY não definida. Crie api/.env com a chave antes de rodar.")
    sys.exit(1)

# Lista exata de docs a indexar — escolhidos pra cobrir metodologia + estratégia + dados
DOCS_TO_INDEX = [
    "12_decisoes_arquitetura_radar_pid.md",
    "04_escopo_estrategia.md",
    "06_eda_insights.md",
    "11_convergencia_incentivos_publicos.md",
    "PERSONA.md",
]

client = genai.Client(api_key=api_key)

print(f"Criando File Search store...")
store = client.file_search_stores.create(config={"display_name": "radar_pid_docs"})
store_name = store.name
print(f"  store criado: {store_name}\n")

for doc_filename in DOCS_TO_INDEX:
    doc_path = DOCS_DIR / doc_filename
    if not doc_path.exists():
        print(f"  ! {doc_filename} não encontrado em {DOCS_DIR}/, pulando")
        continue
    print(f"  uploading: {doc_filename}")
    op = client.file_search_stores.upload_to_file_search_store(
        file=str(doc_path),
        file_search_store_name=store_name,
        config={"display_name": doc_filename},
    )
    # Espera processar
    while not op.done:
        op = client.operations.get(op)
    print(f"    ✓ done")

print(f"\nSetup completo. Cole no api/.env:")
print(f"    GEMINI_FILE_SEARCH_STORE_ID={store_name}")
```

> **Atenção a versionamento da SDK:** `client.file_search_stores.create()` e `upload_to_file_search_store()` são as APIs públicas no momento desta spec. Se a SDK mudar nomes em versões futuras, consulte https://ai.google.dev/gemini-api/docs/file-search e ajuste mantendo a semântica.

### 4.13 — Editar `web/src/Copiloto.jsx`

Localize a função `gerarResposta` (~linha 75) e o handler de envio (`handleSend` ou similar). **Substitua a chamada local por fetch HTTP.**

#### 4.13.1 Adicionar config no topo do arquivo (após imports):

```jsx
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
```

#### 4.13.2 Adicionar state pra session_id no componente principal:

Localize `export default function Copiloto({ ctx })` e adicione **logo no início do corpo**:

```jsx
const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
const [isLoading, setIsLoading] = useState(false);
```

#### 4.13.3 Substituir o handler que chamava `gerarResposta`:

Encontre onde `gerarResposta(pergunta, ctx)` é chamada (provavelmente dentro de um `handleSend` ou `onSubmit`) e substitua por:

```jsx
async function callAgent(pergunta) {
  setIsLoading(true);
  try {
    const res = await fetch(`${API_BASE}/agente/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        message: pergunta,
        context: {
          municipio_selecionado: ctx?.selecionado?.municipio || null,
          modo: ctx?.modo || null,
        },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${res.status}: ${text}`);
    }
    const data = await res.json();
    return data.message || "(resposta vazia)";
  } catch (e) {
    console.error("[copiloto] agent error", e);
    return `Erro ao consultar o agente: ${e.message}`;
  } finally {
    setIsLoading(false);
  }
}
```

E o `handleSend` ou equivalente passa a usar `await callAgent(pergunta)` em vez de `gerarResposta(pergunta, ctx)`.

#### 4.13.4 Apagar a função `gerarResposta` inteira

A função `gerarResposta` (linhas ~75–290 aprox) e a `descricaoInstrumento` que ela usa — se nada mais consumir essas funções no arquivo, **delete-as**. Confirme com `grep -n "gerarResposta\|descricaoInstrumento" web/src/Copiloto.jsx`.

#### 4.13.5 Indicador visual de loading (opcional mas recomendado)

Onde a UI renderiza mensagens, adicione um item visualmente diferenciado quando `isLoading === true`:

```jsx
{isLoading && (
  <div className="flex justify-start">
    <div className="text-[12.5px] text-paper/55 italic">
      Consultando agente…
    </div>
  </div>
)}
```

> Mantenha estilo idêntico ao resto. Não toque em layout/spacing além de adicionar este 1 div.

### 4.14 — Adicionar variável de ambiente no front

Crie/edite `web/.env.example` (e `.env` local, gitignored) com:

```dotenv
VITE_API_BASE=http://localhost:8000
```

Em produção (Vercel/Railway), defina `VITE_API_BASE=https://radar-pid-api-production-XXXX.up.railway.app` (URL do Railway gerada quando deploy do backend-mvp).

### 4.15 — Teste end-to-end local

Pré-requisitos:
- `api/.env` preenchido com `GEMINI_API_KEY` real do humano
- Script `setup_file_search.py` rodado, `STORE_ID` colado em `.env`
- Backend-mvp `api/data/*.parquet` em lugar

```bash
# Terminal 1 — backend
cd api
python -m venv .venv && source .venv/bin/activate
pip install -e .   # ou pip install fastapi uvicorn pandas pyarrow pydantic google-genai python-dotenv
uvicorn src.main:app --reload --port 8000

# Terminal 2 — front
cd web
npm install
echo "VITE_API_BASE=http://localhost:8000" > .env
npm run dev

# Browser: http://localhost:5173
# Selecionar um município no mapa.
# No painel direito, perguntar:
#   "Quais são os top 3 municípios em H2 Verde?"  → deve chamar search_municipio
#   "Como o score é calculado?"                    → deve chamar file_search
#   "Quais novos REIDI 2026 aprovados?"            → deve chamar google_search
```

Verificações:
- [ ] Cada pergunta retorna texto coerente.
- [ ] No log do uvicorn, aparece `agent dispatching tool=search_municipio args={...}` para a 1ª pergunta.
- [ ] `tools_used` no response do `/agente/chat` reflete a tool usada.
- [ ] Sessão preserva contexto: pergunta 2 ("e em PA?") sabe que estamos falando de H2 Verde.
- [ ] Resposta com citations vem populated quando google_search ou file_search é usado.
- [ ] Sem crashes na UI.

### 4.16 — Commit + push

```bash
cd /Volumes/ExtremePro/hackaton_E+
git add api/ web/src/Copiloto.jsx web/.env.example
git commit -m "$(cat <<'EOF'
feat(agente): Copiloto Radar PID com Gemini 3 Flash + tools

- /agente/chat endpoint no FastAPI (session in-memory, TTL 30min)
- 3 tools: search_municipio (custom), file_search (nativo, RAG sobre docs/),
  google_search (nativo, grounding pra incentivos públicos)
- Modelo gemini-3-flash-preview, temp 0.4
- Front Copiloto.jsx substitui mock gerarResposta por fetch /agente/chat
- Setup script de File Search em api/scripts/setup_file_search.py
- .env.example committado, .env gitignored

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push -u origin agente-copiloto
```

---

## 5. Ações pra humano (Gabriel) após o agente terminar

### 5.1 Preencher `api/.env`

```bash
cd api
cp .env.example .env
# Editar .env e colar a GEMINI_API_KEY de https://aistudio.google.com/apikey
```

### 5.2 Rodar setup do File Search (uma vez)

```bash
cd api
source .venv/bin/activate
python scripts/setup_file_search.py
# Output imprime: GEMINI_FILE_SEARCH_STORE_ID=fileSearchStores/...
# Colar essa linha em api/.env
```

### 5.3 Testar local (§4.15) e validar.

### 5.4 Configurar Railway

No painel do serviço backend (já criado pela backend-mvp):
- **Variables:**
  - `GEMINI_API_KEY` = ...
  - `GEMINI_MODEL` = gemini-3-flash-preview
  - `GEMINI_FILE_SEARCH_STORE_ID` = ...

Trigger redeploy. Confirmar que `/agente/chat` responde via curl:

```bash
curl -X POST https://radar-pid-api-production-XXXX.up.railway.app/agente/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "qual o top 3 H2 verde?"}'
```

### 5.5 Atualizar VITE_API_BASE no front

Onde o front estiver hospedado (Vercel/Netlify), adicionar `VITE_API_BASE=https://radar-pid-api-production-XXXX.up.railway.app` e redeploy.

---

## 6. Critério de aceite (DONE template)

```
DONE — agente Copiloto integrado

Backend:
- [x] §4.1 google-genai + python-dotenv adicionados
- [x] §4.2/.3 .env.example + .env (preenchido pelo humano)
- [x] §4.5–.10 módulo agente/ completo (config, sessions, tools, llm, router)
- [x] §4.11 router registrado em main.py
- [x] §4.12 setup_file_search.py funcional

Front:
- [x] §4.13 Copiloto.jsx chama /agente/chat (mock removido)
- [x] §4.14 VITE_API_BASE configurada

Validação:
- [x] §4.15 testes end-to-end OK (3 perguntas, 3 tools acionadas)
- [x] sem erros no console do front
- [x] sessão preserva contexto entre turns

Commit + push em agente-copiloto.

Aguardando humano:
- [ ] §5.1 preencher api/.env com GEMINI_API_KEY real
- [ ] §5.2 rodar setup_file_search.py
- [ ] §5.3 validar local
- [ ] §5.4 env vars no Railway + redeploy
- [ ] §5.5 VITE_API_BASE no front em produção
```

---

## 7. Rollback

```bash
git checkout main
git branch -D agente-copiloto
```

A branch `agente-copiloto` é isolada — descartar não afeta nada em `main`.

Se já foi pushed e quer reverter remoto:

```bash
git push origin --delete agente-copiloto
```

---

## 8. Resumo executivo (1 frase)

Endpoint `POST /agente/chat` no FastAPI com Gemini 3 Flash, memória in-memory por session, 3 tools (search_municipio custom + file_search e google_search nativos do Gemini), front Copiloto.jsx substituindo mock por chamada HTTP — agente operacional para o pitch, RAG dos docs via File Search, busca web em tempo real via grounding.
