"""API FastAPI: chat con Groq y paneles de contexto para la UI Umbral."""

from __future__ import annotations

import os
from typing import Any, cast

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from api.storage import APP_NAME, finish_session, load_session, save_session, start_session
from chatbot.client import build_client
from chatbot.conversation import ConversationManager

load_dotenv()

MODEL = "llama-3.1-8b-instant"

_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
_allowed_origins = [
    origin.strip()
    for origin in os.environ.get("ALLOWED_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

app = FastAPI(title=APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


class StartRequest(BaseModel):
    max_tokens: int = Field(
        ge=200,
        le=32000,
        description="Presupuesto de contexto para esta charla",
    )


def _manager_from_session() -> ConversationManager:
    """Crea ConversationManager con el límite de tokens guardado en JSON."""
    session = load_session()
    return ConversationManager.from_history(
        system_prompt=session["system_prompt"],
        history=session["history"],
        max_context_tokens=int(session["max_context_tokens"]),
    )


def _session_meta() -> dict[str, Any]:
    """Datos de sesión que la UI necesita fuera del chat."""
    session = load_session()
    return {
        "app_name": session.get("app_name", APP_NAME),
        "active": bool(session.get("active")),
        "max_context_tokens": int(session.get("max_context_tokens", 1000)),
    }


def _build_response(manager: ConversationManager, reply: str | None = None) -> dict[str, Any]:
    """Arma el JSON que consumen las 3 columnas de la UI."""
    breakdown = manager.get_context_breakdown()
    session = load_session()
    session["history"] = manager.history_to_list()
    save_session(session)
    return {
        "reply": reply,
        **_session_meta(),
        **breakdown,
    }


def _welcome_response() -> dict[str, Any]:
    """Estado de la pantalla de inicio (sin paneles de chat)."""
    meta = _session_meta()
    return {
        **meta,
        "reply": None,
        "conversation": [],
        "sent_to_model": [],
        "discarded": [],
        "stats": {
            "history_messages": 0,
            "sent_messages": 0,
            "dropped_messages": 0,
            "tokens_sent": 0,
            "max_tokens": meta["max_context_tokens"],
            "first_history_message_in_context": False,
        },
    }


@app.get("/api/state")
def get_state() -> dict[str, Any]:
    """Devuelve el estado actual; si no hay sesión activa, muestra la pantalla de inicio."""
    if not load_session().get("active"):
        return _welcome_response()
    manager = _manager_from_session()
    return {**_session_meta(), "reply": None, **manager.get_context_breakdown()}


@app.post("/api/start")
def post_start(body: StartRequest) -> dict[str, Any]:
    """Inicia la charla con el presupuesto de tokens elegido."""
    start_session(body.max_tokens)
    manager = _manager_from_session()
    return {
        **_session_meta(),
        "reply": None,
        **manager.get_context_breakdown(),
    }


@app.post("/api/finish")
def post_finish() -> dict[str, Any]:
    """Finaliza la charla y vuelve a la pantalla de inicio."""
    finish_session()
    return _welcome_response()


@app.post("/api/chat")
def post_chat(body: ChatRequest) -> dict[str, Any]:
    """Recibe un mensaje, llama a Groq y devuelve conversación + enviados + descartados."""
    if not load_session().get("active"):
        raise HTTPException(status_code=400, detail="Presioná Inicio para comenzar una charla.")

    text = body.message.strip()
    if not text:
        return _build_response(_manager_from_session())

    manager = _manager_from_session()
    manager.add_user_message(text)

    client = build_client()
    response = client.chat.completions.create(
        model=MODEL,
        messages=cast(Any, manager.get_context()),
    )
    reply = response.choices[0].message.content or ""
    manager.add_assistant_message(reply)

    return _build_response(manager, reply=reply)
