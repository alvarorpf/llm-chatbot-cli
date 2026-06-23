"""Wrapper del cliente de Groq vía la API compatible con OpenAI."""

from __future__ import annotations

import os

from openai import OpenAI

GROQ_BASE_URL = "https://api.groq.com/openai/v1"


def build_client() -> OpenAI:
    return OpenAI(base_url=GROQ_BASE_URL, api_key=os.environ["GROQ_API_KEY"])
