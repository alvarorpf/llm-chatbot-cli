# UMBRAL

**UMBRAL** — *Donde la memoria encuentra su límite.*

Chatbot que visualiza en vivo cómo un LLM recibe y pierde contexto cuando se agotan los tokens.

[![Python 3.10](https://img.shields.io/badge/python-3.10.12-blue)]()
[![Groq](https://img.shields.io/badge/Groq-Llama%203.1-orange)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-API-green)]()
[![React](https://img.shields.io/badge/React-UI-61dafb)]()

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

## Despliegue (Render + Vercel)

Arquitectura recomendada:

| Servicio | Qué despliega | URL ejemplo |
|----------|---------------|-------------|
| **Render** | API FastAPI (Python) | `https://umbral-api.onrender.com` |
| **Vercel** | Frontend React (estático) | `https://umbral.vercel.app` |

### 1. Backend en Render

1. Crear cuenta en [render.com](https://render.com) y conectar GitHub.
2. **New → Web Service** → repo `llm-chatbot-cli`.
3. Configuración:
   - **Build:** `pip install .`
   - **Start:** `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
   - **Python version:** 3.10
4. Variables de entorno:
   - `GROQ_API_KEY` — tu clave de Groq
   - `FRONTEND_URL` — (opcional) URL de Vercel, ej. `https://llm-chatbot-cli.vercel.app`
   - Por defecto se permiten orígenes `*.vercel.app` (`CORS_ALLOW_VERCEL=1`). Local: `ALLOWED_ORIGINS` incluye `localhost:5173`.
5. Deploy. Copiá la URL pública del servicio.

> En el plan free, Render “duerme” tras inactividad (~50 s al despertar). La sesión JSON se reinicia en cada redeploy.

### 2. Frontend en Vercel

1. Crear cuenta en [vercel.com](https://vercel.com) y conectar GitHub.
2. **Add New → Project** → mismo repo.
3. Configuración:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Variable de entorno:
   - `VITE_API_URL` — URL de Render **sin** barra final (ej. `https://umbral-api.onrender.com`)
5. Deploy.

### 3. Cerrar el círculo

1. Render redeploya solo tras el push (o **Manual Deploy** si hace falta).
2. Abrí la URL de Vercel y probá una charla.

La clave `GROQ_API_KEY` vive **solo en Render** — nunca en el frontend.

---

## Licencia

MIT — ver `LICENSE`.
