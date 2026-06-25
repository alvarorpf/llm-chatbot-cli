# LAB.md — llm-chatbot-cli

## Hipótesis inicial

A medida que la conversación crece, si el contexto supera el presupuesto de tokens (`MAX_CONTEXT_TOKENS`), hay que truncar eliminando los mensajes más antiguos. El modelo deja de recibir esa información y no puede responder sobre el inicio de la charla.

**Estrategia elegida:** FIFO por presupuesto de tokens (Estrategia 4 en `docs/truncation-strategies.md`) — mientras el total estimado supere el límite, sacar el mensaje más viejo del historial (`pop(1)`), preservando siempre el system prompt.

**Sin truncado (antes del fix):** `get_context()` devolvía todo el historial; el payload crecía hasta que Groq rechazaba el request.

---

## Intento 1 (fallido)

**Qué probé:** CLI (`python -m chatbot.main`) con conversación larga, sin truncado en `get_context()`.

**Qué pasó:** Al superar el tamaño del request, Groq respondió HTTP 413 y el CLI se interrumpió:

```
Error code: 413 - Request too large for model `llama-3.1-8b-instant` ...
Limit 6000, Requested 7030 ... code: rate_limit_exceeded
```

**Por qué fallaba técnicamente:** `get_context()` concatenaba `_history` completo sin aplicar `MAX_CONTEXT_TOKENS`. Cada turno agregaba user + assistant al payload. No había truncado local antes de llamar a la API — Groq cortaba de forma brusca con error.

---

## Intento 2 (validación del truncado en CLI)

**Qué probé:** Mismo flujo con truncado FIFO implementado + `CHATBOT_DEBUG=1`.

1. `Contame un cuento largo` → respuesta larga del asistente
2. `¿De qué estaba rodeado el pueblo pequeño?`

**Qué pasó:** El chat no crasheó, pero el modelo respondió que no tenía información sobre el pueblo.

**Debug observado (antes de la respuesta del modelo):**

```
historial guardado: 3 mensajes
enviados a Groq:    1 (+ system)
descartados:        2
tokens estimados:   18 / 1000
primer msg historial en contexto? False
```

Groq solo recibió `[system, última pregunta]` — el cuento largo (mensaje antiguo) fue descartado. La respuesta del modelo fue coherente con el contexto que realmente vio.

**Aprendizaje práctico:** un solo mensaje muy largo puede expulsar todo el historial anterior aunque el límite sea 1000 tokens.

---

## Decisión final

**Qué cambié:** `get_context()` delega a `get_context_fifo()`: arma `[system] + historial`, calcula tokens con `estimate_tokens` (`len(text) // 4`), y mientras supere `MAX_CONTEXT_TOKENS` elimina el mensaje más antiguo del historial (`pop(1)`), nunca el system.

**Herramientas de observación:** `context_stats()` y `print_context_debug()`; activables en CLI con `CHATBOT_DEBUG=1`.

**Tradeoff aceptado:**

| Ganás | Perdés |
|-------|--------|
| No más error 413 por payload descontrolado | Contexto antiguo (nombres, datos del cuento) |
| Control explícito del tamaño del request | Un mensaje largo puede empujar fuera mensajes previos |

**Nota:** `MAX_CONTEXT_TOKENS = 1000` se dejó bajo a propósito para ver truncado en pruebas locales. En producción subiría a 3000+ según modelo y límites del proveedor.

---

## Eval / Test que prueba que funciona

**Automático (`pytest`):**

- `test_get_context_truncates_when_over_budget` — 40 turnos largos → tokens enviados ≤ `MAX_CONTEXT_TOKENS`, system preservado, mensajes viejos descartados.
- `test_context_stats_reports_dropped_messages` — métricas coherentes con truncado.

```bash
pytest -v
# 4 passed
```

**Manual (CLI):**

```bash
CHATBOT_DEBUG=1 python -m chatbot.main
```

**UI (3 columnas):** `uvicorn api.main:app --reload` + `cd frontend && npm run dev` — ver `ai_architect/projects/llm-chatbot-cli/ui.md`.

**Métricas registradas:**

| Escenario | Sin truncado | Con truncado FIFO |
|-----------|--------------|-------------------|
| Payload Groq | 7030 tokens → 413 | ≤ 1000 tokens estimados |
| Conversación | Se interrumpe | Continúa |
| Memoria del inicio | N/A (crash) | No disponible para el modelo |
