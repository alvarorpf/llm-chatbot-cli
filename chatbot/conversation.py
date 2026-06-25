"""Gestión manual de memoria de conversación y presupuesto de tokens (Capa 1).

`get_context()` aplica truncado FIFO por presupuesto antes de cada llamada al LLM.
`_history` conserva todo; lo enviado a Groq puede ser un subconjunto reciente.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass


@dataclass
class Message:
    role: str
    content: str


class ConversationManager:
    DEFAULT_MAX_CONTEXT_TOKENS = 1000

    def __init__(self, system_prompt: str, max_context_tokens: int | None = None) -> None:
        self._system_prompt = system_prompt
        self._max_context_tokens = max_context_tokens or self.DEFAULT_MAX_CONTEXT_TOKENS
        self._history: list[Message] = []

    def add_user_message(self, content: str) -> None:
        self._history.append(Message(role="user", content=content))

    def add_assistant_message(self, content: str) -> None:
        self._history.append(Message(role="assistant", content=content))

    def estimate_tokens(self, text: str) -> int:
        """Aproximación simple (no es el tokenizer real del modelo)."""
        return len(text) // 4

    def get_context(self) -> list[dict[str, str]]:
        """Contexto listo para la API: system + historial truncado por presupuesto."""
        return self.get_context_fifo(
            system_prompt=self._system_prompt,
            history=self._history,
            max_tokens=self._max_context_tokens,
            estimate=self.estimate_tokens,
        )

    @staticmethod
    def get_context_fifo(
        system_prompt: str,
        history: list[Message],
        max_tokens: int,
        estimate: Callable[[str], int],
    ) -> list[dict[str, str]]:
        def total_tokens(messages: list[dict[str, str]]) -> int:
            return sum(estimate(m["content"]) for m in messages)

        messages: list[dict[str, str]] = [
            {"role": "system", "content": system_prompt},
            *[{"role": m.role, "content": m.content} for m in history],
        ]
        while total_tokens(messages) > max_tokens and len(messages) > 1:
            messages.pop(1)
        return messages

    def context_stats(self) -> dict[str, int | bool]:
        """Métricas para LAB / debug: qué se envía vs qué quedó fuera."""
        sent = self.get_context()
        tokens_sent = sum(self.estimate_tokens(m["content"]) for m in sent)
        sent_history_count = max(0, len(sent) - 1)
        dropped = len(self._history) - sent_history_count
        first_in_context = False
        if self._history:
            first = self._history[0]
            first_in_context = any(
                m["role"] == first.role and m["content"] == first.content for m in sent
            )
        return {
            "history_messages": len(self._history),
            "sent_messages": sent_history_count,
            "dropped_messages": dropped,
            "tokens_sent": tokens_sent,
            "max_tokens": self._max_context_tokens,
            "first_history_message_in_context": first_in_context,
        }

    def print_context_debug(self) -> None:
        """Muestra en consola desde dónde se truncó (práctica / LAB)."""
        sent = self.get_context()
        stats = self.context_stats()
        print("\n--- CONTEXT DEBUG ---")
        print(f"historial guardado: {stats['history_messages']} mensajes")
        print(f"enviados a Groq:    {stats['sent_messages']} (+ system)")
        print(f"descartados:        {stats['dropped_messages']}")
        print(f"tokens estimados:   {stats['tokens_sent']} / {stats['max_tokens']}")
        if self._history:
            first = self._history[0]
            preview = first.content[:100].replace("\n", " ")
            print(f"primer msg historial en contexto? {stats['first_history_message_in_context']}")
            print(f"  → [{first.role}] {preview}...")
        print("últimos enviados a Groq:")
        for m in sent[-4:]:
            preview = m["content"][:100].replace("\n", " ")
            print(f"  [{m['role']}] {preview}...")
        print("--- fin debug ---\n")

    def get_context_breakdown(self) -> dict[str, object]:
        """Separa conversación, payload a Groq y mensajes descartados (para API/UI)."""
        sent = self.get_context()
        sent_history = [m for m in sent if m["role"] != "system"]
        conversation = [{"role": m.role, "content": m.content} for m in self._history]
        discarded_count = len(self._history) - len(sent_history)
        discarded = conversation[:discarded_count]
        return {
            "conversation": conversation,
            "sent_to_model": sent,
            "discarded": discarded,
            "stats": self.context_stats(),
        }

    def history_to_list(self) -> list[dict[str, str]]:
        """Serializa el historial para guardar en JSON."""
        return [{"role": m.role, "content": m.content} for m in self._history]

    @classmethod
    def from_history(
        cls,
        system_prompt: str,
        history: list[dict[str, str]],
        max_context_tokens: int | None = None,
    ) -> ConversationManager:
        """Reconstruye la conversación desde JSON guardado."""
        manager = cls(system_prompt=system_prompt, max_context_tokens=max_context_tokens)
        for item in history:
            if item["role"] == "user":
                manager.add_user_message(item["content"])
            elif item["role"] == "assistant":
                manager.add_assistant_message(item["content"])
        return manager
