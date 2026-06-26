import type { ChatMessage } from "../../api";

interface MessageListProps {
  messages: ChatMessage[];
  emptyText: string;
  variant: "chat" | "sent" | "discarded";
}

export default function MessageList({ messages, emptyText, variant }: MessageListProps) {
  if (messages.length === 0) {
    return <p className="empty">{emptyText}</p>;
  }

  return (
    <ul className={`message-list message-list--${variant}`}>
      {messages.map((msg, index) => (
        <li key={`${msg.role}-${index}`} className={`bubble bubble--${msg.role}`}>
          <span className="bubble__role">{msg.role}</span>
          <p className="bubble__text">{msg.content}</p>
        </li>
      ))}
    </ul>
  );
}
