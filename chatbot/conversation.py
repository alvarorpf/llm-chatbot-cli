"""Gestión manual de memoria de conversación y presupuesto de tokens.

Este módulo es el ejercicio central de la Capa 1: hoy `get_context` devuelve
todo el historial sin límite. Cuando la conversación supere MAX_CONTEXT_TOKENS
hay que truncar — esa estrategia (qué se corta, qué se conserva) es la parte
que falta implementar y documentar en LAB.md (hipótesis, intento fallido,
decisión final).
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Message:
    role: str
    content: str


class ConversationManager:
    MAX_CONTEXT_TOKENS = 3000

    def __init__(self, system_prompt: str) -> None:
        self._system_prompt = system_prompt
        self._history: list[Message] = []

    def add_user_message(self, content: str) -> None:
        self._history.append(Message(role="user", content=content))

    def add_assistant_message(self, content: str) -> None:
        self._history.append(Message(role="assistant", content=content))

    def estimate_tokens(self, text: str) -> int:
        """Aproximación simple (no es el tokenizer real del modelo) — alcanza
        para practicar la ESTRATEGIA de truncado, no la precisión exacta."""
        return len(text) // 4

    def get_context(self) -> list[dict[str, str]]:
        """TODO (Capa 1): respetar MAX_CONTEXT_TOKENS. Hoy devuelve todo el
        historial sin límite — va a crecer sin control hasta que implementes
        la estrategia de truncado."""
        messages = [{"role": "system", "content": self._system_prompt}]
        messages += [{"role": m.role, "content": m.content} for m in self._history]
        return messages
