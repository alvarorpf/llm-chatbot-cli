# llm-chatbot-cli

Chatbot CLI con memoria de contexto manejada a mano — sin frameworks de orquestación.

Parte de la Capa 1 (LLM crudo) del roadmap de transición a AI Solutions Architect. Usa Groq (tier gratuito) vía cliente compatible con la API de OpenAI.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env  # completar GROQ_API_KEY
```

## Correr

```bash
python -m chatbot.main
```

## Tests

```bash
pytest
```

Ver `LAB.md` para la bitácora de hipótesis, fallas y decisiones de este proyecto.
