"""Tests de ConversationManager — lógica pura, no llama a ninguna API."""

from chatbot.conversation import ConversationManager


def test_get_context_includes_system_prompt_first() -> None:
    # Arrange
    conversation = ConversationManager(system_prompt="Sos un asistente de prueba.")

    # Act
    context = conversation.get_context()

    # Assert
    assert context[0] == {"role": "system", "content": "Sos un asistente de prueba."}


def test_add_user_message_appears_in_context() -> None:
    # Arrange
    conversation = ConversationManager(system_prompt="system")
    conversation.add_user_message("hola")

    # Act
    context = conversation.get_context()

    # Assert
    assert {"role": "user", "content": "hola"} in context


# TODO (Capa 1): una vez implementado el truncado en ConversationManager,
# agregar un test que pruebe que los mensajes más viejos se descartan al
# superar MAX_CONTEXT_TOKENS — escribilo ANTES de implementar el truncado.
