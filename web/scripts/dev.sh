#!/usr/bin/env bash
# Dev server resiliente — usar SEMPRE depois de troca de branch, stash apply,
# rebase, ou se Tailwind/HMR estiver se comportando estranho.
#
# Faz 3 coisas que o `npm run dev` puro não faz:
#   1. Mata qualquer processo travado na porta 5173
#   2. Apaga o cache local do Vite (.vite/) que polui entre branches
#   3. Sobe o Vite com --force (re-bundle de deps, ignora cache)
#
# Uso: cd web && npm run dev:safe

set -euo pipefail

PORT=5173

# 1. Mata processos na porta
PIDS=$(lsof -ti:"$PORT" 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  echo "→ Matando processo(s) na porta $PORT: $PIDS"
  # shellcheck disable=SC2086
  kill -TERM $PIDS 2>/dev/null || true
  sleep 1
  PIDS=$(lsof -ti:"$PORT" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "→ Não morreu com SIGTERM, mandando SIGKILL"
    # shellcheck disable=SC2086
    kill -9 $PIDS 2>/dev/null || true
    sleep 1
  fi
fi

# 2. Limpa caches do Vite
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WEB_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$WEB_DIR"

if [ -d ".vite" ]; then
  echo "→ Apagando $WEB_DIR/.vite"
  rm -rf .vite
fi
if [ -d "node_modules/.vite" ]; then
  echo "→ Apagando $WEB_DIR/node_modules/.vite"
  rm -rf node_modules/.vite
fi

# 3. Sobe Vite com --force
echo "→ Subindo Vite na porta $PORT com --force"
exec npm run dev -- --port "$PORT" --force --host 127.0.0.1
