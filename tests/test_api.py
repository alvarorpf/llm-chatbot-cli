"""Tests de la API FastAPI (sin llamar a Groq)."""

from __future__ import annotations

from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from api import storage
from api.main import app


@pytest.fixture
def client(tmp_path: Any, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    session_file = tmp_path / "session.json"
    monkeypatch.setattr(storage, "SESSION_FILE", session_file)
    return TestClient(app)


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_state_welcome_screen(client: TestClient) -> None:
    response = client.get("/api/state")
    assert response.status_code == 200
    data = response.json()
    assert data["active"] is False
    assert data["conversation"] == []


def test_start_and_finish_session(client: TestClient) -> None:
    start = client.post("/api/start", json={"max_tokens": 800})
    assert start.status_code == 200
    assert start.json()["active"] is True
    assert start.json()["max_context_tokens"] == 800

    finish = client.post("/api/finish")
    assert finish.status_code == 200
    assert finish.json()["active"] is False


def test_chat_requires_active_session(client: TestClient) -> None:
    response = client.post("/api/chat", json={"message": "hola"})
    assert response.status_code == 400


def test_chat_without_groq_key_returns_503(client: TestClient) -> None:
    client.post("/api/start", json={"max_tokens": 800})
    with patch.dict("os.environ", {}, clear=True):
        response = client.post("/api/chat", json={"message": "hola"})
    assert response.status_code == 503
    assert "GROQ_API_KEY" in response.json()["detail"]


def test_chat_with_mocked_groq(client: TestClient) -> None:
    client.post("/api/start", json={"max_tokens": 800})

    mock_reply = MagicMock()
    mock_reply.choices = [MagicMock(message=MagicMock(content="respuesta de prueba"))]

    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = mock_reply

    with patch("api.main.build_client", return_value=mock_client):
        response = client.post("/api/chat", json={"message": "hola"})

    assert response.status_code == 200
    data = response.json()
    assert data["reply"] == "respuesta de prueba"
    assert len(data["conversation"]) == 2
