#!/usr/bin/env bash
# Dev server resiliente do back — usar SEMPRE pra subir uvicorn.
# Garante que a venv certa (.venv com Python 3.11/3.12 e google-genai 2.x)
# seja usada, evitando o bug de pegar Python 3.13 system com SDK antigo
# que não tem types.FileSearch.
#
# Faz 3 coisas que `uvicorn ...` direto não faz:
#   1. Mata qualquer processo travado na porta 8000
#   2. Ativa .venv automaticamente (cria se não existir)
#   3. Verifica que google-genai >= 2.0 (com FileSearch) antes de subir
#
# Uso: cd api && bash scripts/dev.sh

set -euo pipefail

PORT=8000
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
API_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$API_DIR"

# 1. Mata processo na porta
PIDS=$(lsof -ti:"$PORT" 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  echo "→ Matando processo(s) na porta $PORT: $PIDS"
  # shellcheck disable=SC2086
  kill -TERM $PIDS 2>/dev/null || true
  sleep 1
  PIDS=$(lsof -ti:"$PORT" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    # shellcheck disable=SC2086
    kill -9 $PIDS 2>/dev/null || true
    sleep 1
  fi
fi

# 2. Garante venv
if [ ! -d ".venv" ]; then
  echo "→ Criando .venv (Python 3.12 do anaconda — compatível com google-genai 2.x)"
  /opt/anaconda3/bin/python3 -m venv .venv
  ./.venv/bin/pip install --quiet --upgrade pip
  ./.venv/bin/pip install --quiet -e .
fi

# 3. Sanity check da SDK
SDK_OK=$(./.venv/bin/python -c "
try:
    from google.genai import types
    print('OK' if hasattr(types, 'FileSearch') else 'NO_FILESEARCH')
except Exception as e:
    print(f'IMPORT_FAIL:{e}')
")
if [ "$SDK_OK" != "OK" ]; then
  echo "✗ google-genai na .venv não tem FileSearch (status: $SDK_OK)"
  echo "  Reinstalando google-genai >= 2.0..."
  ./.venv/bin/pip install --quiet --upgrade 'google-genai>=2.0'
fi

# 4. Sobe uvicorn com a venv certa
echo "→ Subindo uvicorn na porta $PORT (Python: $(./.venv/bin/python --version))"
exec ./.venv/bin/uvicorn src.main:app --host 0.0.0.0 --port "$PORT" --reload
