# llm-chatbot-cli · UMBRAL

**UMBRAL** — *Donde la memoria encuentra su límite.*

Chatbot educativo que muestra en vivo cómo funciona la **ventana de contexto** de un LLM: qué se envía al modelo, qué se descarta cuando los tokens se agotan, y por qué la IA “olvida” el inicio de una charla larga.

Proyecto de **Capa 1** (LLM crudo, sin frameworks de orquestación) del roadmap [AI Architect](../ai_architect/).

| Stack | Uso |
|-------|-----|
| Python 3.10.12 | Lógica de truncado |
| Groq (Llama 3.1) | Modelo vía API compatible OpenAI |
| FastAPI | Backend HTTP |
| React + Vite | Interfaz 3 columnas |
| JSON (`data/session.json`) | Estado de sesión (sin base de datos) |

---

## Qué hace UMBRAL

1. **Pantalla de inicio** — elegís cuántos tokens de contexto querés usar y presionás **Inicio**.
2. **Chat** — conversás con el modelo como en cualquier chatbot.
3. **Tres columnas en paralelo:**
   - **Conversación** — todo lo que pasó en la charla.
   - **Enviados a Groq** — lo que realmente recibe el modelo en cada turno.
   - **Descartados** — mensajes viejos que ya no entran por el límite de tokens.
4. **Finalizar** — modal con explicación general de tokens y vuelta al inicio.

La lógica central está en `chatbot/conversation.py`: truncado **FIFO por presupuesto** antes de cada llamada a la API.

---

## Documentación en este repo

| Archivo | Contenido |
|---------|-----------|
| `LAB.md` | Bitácora: hipótesis, fallos, decisión, evals |
| `TASKS.md` | Checklist de ejecución |

**Guías y post LinkedIn:** [ai_architect/projects/llm-chatbot-cli](../ai_architect/projects/llm-chatbot-cli/)

---

## Requisitos

- Python **3.10.12**
- Node.js 18+ (solo para la UI)
- Cuenta [Groq](https://console.groq.com) con API key

---

## Instalación

```bash
git clone <tu-repo>/llm-chatbot-cli.git
cd llm-chatbot-cli

python3.10 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

cp .env.example .env
# Editar .env y completar GROQ_API_KEY=

cp data/session.example.json data/session.json   # opcional, se crea al usar la API
```

---

## Uso — CLI (terminal)

```bash
source .venv/bin/activate
python -m chatbot.main
```

Modo debug (métricas de truncado en consola):

```bash
CHATBOT_DEBUG=1 python -m chatbot.main
```

---

## Uso — UMBRAL UI (recomendado)

**Terminal 1 — API:**

```bash
source .venv/bin/activate
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Abrir **http://localhost:5173**

---

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/state` | Estado actual (inicio o chat activo) |
| `POST` | `/api/start` | `{ "max_tokens": 1000 }` — inicia charla |
| `POST` | `/api/chat` | `{ "message": "..." }` — envía mensaje |
| `POST` | `/api/finish` | Finaliza y vuelve a pantalla de inicio |

Docs interactivas: http://localhost:8000/docs

---

## Estructura del proyecto

```
llm-chatbot-cli/
├── chatbot/
│   ├── conversation.py   # Memoria + truncado FIFO
│   ├── client.py         # Cliente Groq
│   └── main.py           # CLI
├── api/
│   ├── main.py           # FastAPI
│   └── storage.py        # Persistencia JSON
├── frontend/             # React — UMBRAL UI
├── tests/
├── data/session.json     # Sesión activa (gitignored)
├── LAB.md
└── TASKS.md
```

---

## Tests y calidad

```bash
source .venv/bin/activate
pytest -v
ruff check .
mypy .
```

CI: GitHub Actions en `.github/workflows/ci.yml`

---

## Licencia

Ver `LICENSE`.
