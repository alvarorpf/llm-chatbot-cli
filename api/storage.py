"""Persistencia de sesión en archivo JSON (sin base de datos)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

SESSION_FILE = Path(__file__).resolve().parent.parent / "data" / "session.json"

APP_NAME = "UMBRAL"
DEFAULT_MAX_TOKENS = 1000

DEFAULT_SESSION: dict[str, Any] = {
    "app_name": APP_NAME,
    "system_prompt": "Sos un asistente conciso y directo.",
    "history": [],
    "max_context_tokens": DEFAULT_MAX_TOKENS,
    "active": False,
}


def load_session() -> dict[str, Any]:
    """Lee la sesión desde JSON; si no existe, devuelve una sesión en pantalla de inicio."""
    if not SESSION_FILE.exists():
        return dict(DEFAULT_SESSION)
    with SESSION_FILE.open(encoding="utf-8") as file:
        data: dict[str, Any] = json.load(file)
    # Migración suave si el JSON es de una versión anterior
    data.setdefault("app_name", APP_NAME)
    data["app_name"] = APP_NAME
    data.setdefault("max_context_tokens", DEFAULT_MAX_TOKENS)
    data.setdefault("active", bool(data.get("history")))
    return data


def save_session(data: dict[str, Any]) -> None:
    """Guarda la sesión actual en JSON."""
    SESSION_FILE.parent.mkdir(parents=True, exist_ok=True)
    with SESSION_FILE.open("w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)


def start_session(max_context_tokens: int) -> dict[str, Any]:
    """Inicia una charla nueva con el límite de tokens elegido por el usuario."""
    session = dict(DEFAULT_SESSION)
    session["max_context_tokens"] = max_context_tokens
    session["active"] = True
    session["history"] = []
    save_session(session)
    return session


def finish_session() -> dict[str, Any]:
    """Finaliza la charla y vuelve a la pantalla de inicio."""
    session = dict(DEFAULT_SESSION)
    save_session(session)
    return session
