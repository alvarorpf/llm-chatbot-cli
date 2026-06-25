"""Tests de ConversationManager — lógica pura, no llama a ninguna API."""

from typing import cast

from chatbot.conversation import ConversationManager


def test_get_context_includes_system_prompt_first() -> None:
    conversation = ConversationManager(system_prompt="Sos un asistente de prueba.")

    context = conversation.get_context()

    assert context[0] == {"role": "system", "content": "Sos un asistente de prueba."}


def test_add_user_message_appears_in_context() -> None:
    conversation = ConversationManager(system_prompt="system")
    conversation.add_user_message("hola")

    context = conversation.get_context()

    assert {"role": "user", "content": "hola"} in context


def test_get_context_truncates_when_over_budget() -> None:
    conversation = ConversationManager(system_prompt="system", max_context_tokens=1000)

    for _ in range(40):
        conversation.add_user_message("palabra " * 100)
        conversation.add_assistant_message("ok " * 100)

    context = conversation.get_context()
    total = sum(conversation.estimate_tokens(m["content"]) for m in context)

    assert total <= 1000
    assert context[0] == {"role": "system", "content": "system"}
    assert len(context) < 81  # system + 80 mensajes si no hubiera truncado
    assert conversation.context_stats()["dropped_messages"] > 0


def test_context_stats_reports_dropped_messages() -> None:
    conversation = ConversationManager(system_prompt="system")
    conversation.add_user_message("Contame un cuento largo")
    conversation.add_assistant_message("En el pueblo de San Pedro " + "pasó algo " * 400)
    conversation.add_user_message("¿De qué estaba rodeado el pueblo?")

    stats = conversation.context_stats()

    assert stats["history_messages"] == 3
    assert stats["dropped_messages"] >= 1
    assert stats["tokens_sent"] <= stats["max_tokens"]
    assert stats["first_history_message_in_context"] is False


def test_get_context_breakdown_splits_discarded() -> None:
    conversation = ConversationManager(system_prompt="system")
    conversation.add_user_message("mensaje viejo")
    conversation.add_assistant_message("respuesta vieja " + "x" * 4000)
    conversation.add_user_message("mensaje reciente")

    breakdown = conversation.get_context_breakdown()
    conversation_msgs = cast(list[dict[str, str]], breakdown["conversation"])
    discarded_msgs = cast(list[dict[str, str]], breakdown["discarded"])
    stats = cast(dict[str, int | bool], breakdown["stats"])

    assert len(conversation_msgs) == 3
    assert discarded_msgs
    assert conversation_msgs[0] in discarded_msgs
    assert stats["dropped_messages"] >= 1
