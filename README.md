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

Ver `TASKS.md` para el checklist de ejecución paso a paso, desde el estado actual hasta el resultado final (CLI → API → React).

## Próximo paso: interfaz visual (FastAPI + React)

Una vez terminado el truncado de contexto en `chatbot/conversation.py` (la lógica no se toca para esto), se suma una cara visual:

```
llm-chatbot-cli/
├── chatbot/              (sin cambios)
├── api/
│   └── main.py           (FastAPI: POST /chat usando el mismo ConversationManager)
└── frontend/
    └── (Vite + React: input + lista de mensajes)
```

* **Por qué FastAPI ahora y no antes**: React no puede llamar directo al código Python — hace falta un backend HTTP en el medio. Antes era innecesario (era solo un CLI); ahora el requisito real lo justifica (YAGNI en los dos sentidos).
* **React, no OWL**: este proyecto es standalone (regla de la Sección 3 de `ai_architect`).
* **Orden**: primero la lógica de truncado terminada y documentada en `LAB.md`, después la API, después el frontend — para no rehacer la integración si la lógica cambia.
* **Gotcha esperado**: backend y frontend van a correr en puertos distintos en desarrollo — va a hacer falta configurar CORS en FastAPI.
