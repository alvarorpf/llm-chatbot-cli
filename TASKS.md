# TASKS.md — llm-chatbot-cli

Checklist de ejecución, de punta a punta. Tickear a medida que se completa cada paso — no saltear fases.

## Fase 1 — Núcleo CLI (Capa 1: el ejercicio real)

- [ ] Completar "Hipótesis inicial" en `LAB.md`
- [ ] Configurar entorno (venv, dependencias, `.env` con `GROQ_API_KEY`)
- [ ] Correr el CLI y forzar una conversación larga para ver `get_context()` crecer sin límite
- [ ] Documentar "Intento 1 (fallido)" en `LAB.md` con el comportamiento real observado
- [ ] Implementar la estrategia de truncado en `chatbot/conversation.py`
- [ ] Escribir el test que prueba el truncado (TDD: el test se escribe antes de cerrar la implementación)
- [ ] Documentar "Decisión final" + "Eval" en `LAB.md`
- [ ] Correr `ruff check .` y `mypy .` — deben pasar limpio antes del commit
- [ ] Commit + push

## Fase 2 — API (FastAPI)

- [ ] Agregar `fastapi` + `uvicorn` a las dependencias
- [ ] Crear `api/main.py` con un endpoint `POST /chat` que reutiliza el `ConversationManager` existente
- [ ] Configurar CORS para el origen del frontend
- [ ] Probar el endpoint con `curl`/`httpie` ANTES de tocar el frontend
- [ ] Commit + push

## Fase 3 — Frontend (React)

- [ ] Scaffolding de Vite + React en `frontend/`
- [ ] UI mínima: input + lista de mensajes, llamando a `POST /chat`
- [ ] Probar end-to-end: React → FastAPI → Groq → respuesta visible en pantalla
- [ ] Commit + push

## Fase 4 — Cierre

- [ ] Actualizar `README.md` con instrucciones para correr API + frontend juntos
- [ ] Marcar la tarea correspondiente como completada en el tracking del roadmap (`ai_architect`)
- [ ] Post de LinkedIn explicando la decisión técnica del truncado (Sección 10 del roadmap)
