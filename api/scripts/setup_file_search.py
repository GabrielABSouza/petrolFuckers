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

SCRIPT_DIR = Path(__file__).resolve().parent
API_DIR = SCRIPT_DIR.parent
REPO_ROOT = API_DIR.parent
DOCS_DIR = REPO_ROOT / "docs"

load_dotenv(API_DIR / ".env")
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY não definida. Crie api/.env com a chave antes de rodar.")
    sys.exit(1)

DOCS_TO_INDEX = [
    "12_decisoes_arquitetura_radar_pid.md",
    "04_escopo_estrategia.md",
    "06_eda_insights.md",
    "11_convergencia_incentivos_publicos.md",
    "PERSONA.md",
]

client = genai.Client(api_key=api_key)

print("Criando File Search store...")
new_store = client.file_search_stores.create(
    config=types.CreateFileSearchStoreConfig(displayName="radar_pid_docs")
)
store_name = new_store.name
print(f"  store criado: {store_name}\n")

for doc_filename in DOCS_TO_INDEX:
    doc_path = DOCS_DIR / doc_filename
    if not doc_path.exists():
        print(f"  ! {doc_filename} não encontrado em {DOCS_DIR}/, pulando")
        continue
    print(f"  uploading: {doc_filename}")
    op = client.file_search_stores.upload_to_file_search_store(
        file_search_store_name=store_name,
        file=str(doc_path),
        config=types.UploadToFileSearchStoreConfig(displayName=doc_filename),
    )
    while not op.done:
        op = client.operations.get(op)
    print(f"    done")

print(f"\nSetup completo. Cole no api/.env:")
print(f"    GEMINI_FILE_SEARCH_STORE_ID={store_name}")
