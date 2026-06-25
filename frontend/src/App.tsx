import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ChatMessage,
  ChatState,
  fetchState,
  finishSession,
  sendMessage,
  startSession,
} from "./api";

const TOKEN_MODAL_TEXT =
  "Los modelos de lenguaje no recuerdan la conversación por sí solos: en cada mensaje " +
  "reciben un bloque de texto llamado contexto. Ese bloque se mide en tokens " +
  "(aproximadamente pedazos de palabras). Cada modelo y cada servicio tiene un límite " +
  "de cuántos tokens puede procesar a la vez. Si la conversación es muy larga, algo " +
  "tiene que quedar fuera — lo más antiguo suele descartarse primero. Por eso, en charlas " +
  "largas, la IA puede dejar de tener acceso a lo que se dijo al principio.";

/** Lista de mensajes con rol y contenido. */
function MessageList({
  messages,
  emptyText,
  variant,
}: {
  messages: ChatMessage[];
  emptyText: string;
  variant: "chat" | "sent" | "discarded";
}) {
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

/** Modal al finalizar: explica tokens antes de cerrar la charla. */
function FinishModal({
  open,
  loading,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="finish-modal-title"
        aria-modal="true"
      >
        <h2 id="finish-modal-title" className="modal__title">
          ¿Cómo funcionan los tokens?
        </h2>
        <p className="modal__body">{TOKEN_MODAL_TEXT}</p>
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={loading}>
            Seguir charlando
          </button>
          <button type="button" className="btn btn--primary" onClick={onConfirm} disabled={loading}>
            {loading ? "Cerrando..." : "Finalizar charla"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Pantalla de inicio: elige tokens y presiona Inicio. */
function WelcomeScreen({
  appName,
  defaultTokens,
  loading,
  onStart,
}: {
  appName: string;
  defaultTokens: number;
  loading: boolean;
  onStart: (tokens: number) => void;
}) {
  const [tokens, setTokens] = useState(String(defaultTokens));

  function handleStart(event: FormEvent) {
    event.preventDefault();
    const value = Number(tokens);
    if (value >= 200 && value <= 32000) onStart(value);
  }

  return (
    <div className="welcome">
      <div className="welcome__card">
        <p className="welcome__eyebrow">Donde la memoria encuentra su límite</p>
        <h1 className="welcome__title">{appName}</h1>
        <p className="welcome__tagline">
          Conversá con un modelo de IA y mirá en vivo qué mensajes se envían y cuáles se
          descartan cuando el contexto se llena.
        </p>

        <form className="welcome__form" onSubmit={handleStart}>
          <label className="welcome__label" htmlFor="max-tokens">
            Límite de tokens para esta charla
          </label>
          <input
            id="max-tokens"
            type="number"
            min={200}
            max={32000}
            step={100}
            value={tokens}
            onChange={(e) => setTokens(e.target.value)}
            className="welcome__input"
          />
          <p className="welcome__hint">
            Valores bajos (500–1500) hacen visible el truncado antes. Valores altos permiten
            charlas más largas.
          </p>
          <button type="submit" className="btn btn--primary btn--wide" disabled={loading}>
            {loading ? "Iniciando..." : "Inicio"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState<ChatState | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchState()
      .then(setState)
      .catch(() => setError("¿Está corriendo la API en el puerto 8000?"));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state?.conversation]);

  // Enfoca el input al entrar al chat y después de cada respuesta
  useEffect(() => {
    if (state?.active) {
      inputRef.current?.focus();
    }
  }, [state?.active, state?.conversation.length]);

  async function handleStart(tokens: number) {
    setLoading(true);
    setError(null);
    try {
      setState(await startSession(tokens));
    } catch {
      setError("No se pudo iniciar. Revisá la API.");
    } finally {
      setLoading(false);
    }
  }

  /** Abre el modal de tokens antes de cerrar la sesión. */
  function openFinishModal() {
    setShowFinishModal(true);
  }

  /** Cierra el modal sin finalizar. */
  function closeFinishModal() {
    if (!loading) setShowFinishModal(false);
  }

  /** Confirma finalizar y vuelve a la pantalla de inicio. */
  async function confirmFinish() {
    setLoading(true);
    setError(null);
    try {
      setState(await finishSession());
      setInput("");
      setShowFinishModal(false);
    } catch {
      setError("No se pudo finalizar la sesión.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setLoading(true);
    setError(null);
    try {
      setState(await sendMessage(text));
      setInput("");
    } catch {
      setError("Falló el envío. Revisá la API y GROQ_API_KEY.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  if (!state) {
    return (
      <div className="app app--loading">
        <p>Cargando UMBRAL…</p>
        {error && <div className="banner banner--error">{error}</div>}
      </div>
    );
  }

  if (!state.active) {
    return (
      <div className="app">
        {error && <div className="banner banner--error banner--floating">{error}</div>}
        <WelcomeScreen
          appName={state.app_name}
          defaultTokens={state.max_context_tokens}
          loading={loading}
          onStart={handleStart}
        />
      </div>
    );
  }

  const stats = state.stats;

  return (
    <div className="app">
      <FinishModal
        open={showFinishModal}
        loading={loading}
        onCancel={closeFinishModal}
        onConfirm={confirmFinish}
      />

      <header className="header">
        <div>
          <p className="header__eyebrow">Donde la memoria encuentra su límite</p>
          <h1 className="header__title">{state.app_name}</h1>
        </div>
        <div className="header__stats">
          <span>
            tokens <strong>{stats.tokens_sent}</strong> / {stats.max_tokens}
          </span>
          <span>
            descartados <strong>{stats.dropped_messages}</strong>
          </span>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={openFinishModal}
            disabled={loading}
          >
            Finalizar
          </button>
        </div>
      </header>

      {error && <div className="banner banner--error">{error}</div>}

      <main className="grid">
        <section className="panel panel--chat">
          <h2 className="panel__title">Conversación</h2>
          <div className="panel__body">
            <MessageList
              messages={state.conversation}
              emptyText="Escribí un mensaje para empezar."
              variant="chat"
            />
            <div ref={chatEndRef} />
          </div>
          <form className="composer" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí tu mensaje..."
              disabled={loading}
              autoFocus
            />
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? "..." : "Enviar"}
            </button>
          </form>
        </section>

        <section className="panel panel--sent">
          <h2 className="panel__title">Enviados a Groq</h2>
          <p className="panel__hint">Payload real de cada llamada (incluye system).</p>
          <div className="panel__body">
            <MessageList
              messages={state.sent_to_model}
              emptyText="Aún no hay payload."
              variant="sent"
            />
          </div>
        </section>

        <section className="panel panel--discarded">
          <h2 className="panel__title">Descartados</h2>
          <p className="panel__hint">Historial que no entra por límite de tokens.</p>
          <div className="panel__body">
            <MessageList
              messages={state.discarded}
              emptyText="Nada descartado todavía."
              variant="discarded"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
