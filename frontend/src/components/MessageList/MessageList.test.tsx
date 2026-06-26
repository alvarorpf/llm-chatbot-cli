import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MessageList from "./MessageList";

describe("MessageList", () => {
  it("shows the empty text when there are no messages", () => {
    render(
      <MessageList messages={[]} emptyText="No hay mensajes" variant="chat" />
    );
    expect(screen.getByText("No hay mensajes")).toBeInTheDocument();
  });

  it("renders message bubbles", () => {
    const messages = [
      { role: "user", content: "Hola" },
      { role: "assistant", content: "¿En qué puedo ayudarte?" },
    ];
    render(
      <MessageList messages={messages} emptyText="" variant="chat" />
    );

    expect(screen.getByText("Hola")).toBeInTheDocument();
    expect(screen.getByText("¿En qué puedo ayudarte?")).toBeInTheDocument();
  });

  it("shows role badges for each message", () => {
    const messages = [
      { role: "user", content: "Test" },
      { role: "assistant", content: "Respuesta" },
    ];
    render(
      <MessageList messages={messages} emptyText="" variant="chat" />
    );

    expect(screen.getByText("user")).toBeInTheDocument();
    expect(screen.getByText("assistant")).toBeInTheDocument();
  });
});
