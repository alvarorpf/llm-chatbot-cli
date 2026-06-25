# UMBRAL

**UMBRAL** — *Donde la memoria encuentra su límite.*

Chatbot que visualiza en vivo cómo un LLM recibe y pierde contexto cuando se agotan los tokens.

[![Python 3.10](https://img.shields.io/badge/python-3.10.12-blue)]()
[![Groq](https://img.shields.io/badge/Groq-Llama%203.1-orange)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-API-green)]()
[![React](https://img.shields.io/badge/React-UI-61dafb)]()

**Documentación, LAB y bitácora:** [ai_architect/projects/llm-chatbot-cli](https://github.com/alvarorpf/ai-architect/tree/main/projects/llm-chatbot-cli)

---

## Inicio rápido

### 1. Instalar

```bash
git clone https://github.com/alvarorpf/llm-chatbot-cli.git
cd llm-chatbot-cli

python3.10 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

cp .env.example .env
# Completar GROQ_API_KEY en .env
```

### 2. UI (recomendado)

**Terminal 1:**

```bash
uvicorn api.main:app --reload --port 8000
```

**Terminal 2:**

```bash
cd frontend && npm install && npm run dev
```

→ http://localhost:5173

### 3. CLI (opcional)

```bash
python -m chatbot.main
```

---

## Qué verás en la UI

1. Elegís el **límite de tokens** y presionás **Inicio**
2. Charlas con el modelo en la columna central
3. Columna **Enviados** — lo que realmente recibe Groq
4. Columna **Descartados** — mensajes que ya no entran por el límite

---

## Tests

```bash
pytest -v && ruff check . && mypy .
```

---

## Estructura

```
chatbot/     # Lógica de memoria y truncado
api/         # FastAPI + JSON
frontend/    # React — UMBRAL UI
tests/
```

---

## Licencia

MIT — ver `LICENSE`.
