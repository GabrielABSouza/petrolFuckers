FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY pyproject.toml ./
RUN pip install fastapi==0.111.0 'uvicorn[standard]==0.30.1' pandas==2.2.2 pyarrow==16.1.0 pydantic==2.7.1 'google-genai>=2.0,<3.0' 'python-dotenv>=1.0'

COPY src/ ./src/
COPY data/ ./data/

EXPOSE 8000

CMD uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}
