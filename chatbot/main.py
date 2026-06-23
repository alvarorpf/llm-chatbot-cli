"""Punto de entrada del CLI: leer input, llamar al modelo, imprimir respuesta."""

from __future__ import annotations

import logging

from dotenv import load_dotenv

from chatbot.client import build_client
from chatbot.conversation import ConversationManager

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
_logger = logging.getLogger(__name__)

MODEL = "llama-3.1-8b-instant"
SYSTEM_PROMPT = "Sos un asistente conciso y directo."


def run() -> None:
    load_dotenv()
    client = build_client()
    conversation = ConversationManager(system_prompt=SYSTEM_PROMPT)

    print("Chatbot CLI — escribí 'salir' para terminar.")
    while True:
        user_input = input("> ").strip()
        if user_input.lower() in {"salir", "exit"}:
            break
        if not user_input:
            continue

        conversation.add_user_message(user_input)
        response = client.chat.completions.create(
            model=MODEL,
            messages=conversation.get_context(),
        )
        reply = response.choices[0].message.content
        if reply is None:
            _logger.error("El modelo devolvió una respuesta vacía")
            continue

        conversation.add_assistant_message(reply)
        print(reply)


if __name__ == "__main__":
    run()
