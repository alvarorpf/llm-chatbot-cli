"""Wrapper del cliente de Groq vía la API compatible con OpenAI."""

from __future__ import annotations

import os

from openai import OpenAI

GROQ_BASE_URL = "https://api.groq.com/openai/v1"


def build_client() -> OpenAI:
    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    if not api_key:
        msg = "GROQ_API_KEY no está configurada. Copiá .env.example a .env y completá la clave."
        raise RuntimeError(msg)
    return OpenAI(base_url=GROQ_BASE_URL, api_key=api_key)
