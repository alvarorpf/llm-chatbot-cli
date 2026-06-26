import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ChatState,
  fetchState,
  finishSession,
  sendMessage,
  startSession,
} from "../../api";
import Header from "../Header/Header";
import Panel from "../Panel/Panel";
import WelcomeScreen from "../WelcomeScreen/WelcomeScreen";
import MessageList from "../MessageList/MessageList";
import FinishModal from "../FinishModal/FinishModal";

interface PanelState {
  sent: boolean;
  discarded: boolean;
}

function getInitialTheme(): "dark" | "light" {
  const stored = localStorage.getItem("umbral-theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export default function App() {
  const [state, setState] = useState<ChatState | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme);
  const [collapsed, setCollapsed] = useState<PanelState>({ sent: false, discarded: false });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* —— Theme persistence —— */
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("umbral-theme", theme);
  }, [theme]);

  /* —— Initial state fetch —— */
  useEffect(() => {
    fetchState()
      .then(setState)
      .catch(() => setError("¿Está corriendo la API en el puerto 8000?"));
  }, []);

  /* —— Auto-scroll chat —— */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state?.conversation]);

  /* —— Auto-focus input —— */
  useEffect(() => {
    if (state?.active) {
      inputRef.current?.focus();
    }
  }, [state?.active, state?.conversation.length]);

  function handleThemeToggle() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  function togglePanel(panel: "sent" | "discarded") {
    setCollapsed((prev) => ({ ...prev, [panel]: !prev[panel] }));
  }

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

  function openFinishModal() {
    setShowFinishModal(true);
  }

  function closeFinishModal() {
    if (!loading) setShowFinishModal(false);
  }

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

  /* —— Loading state —— */
  if (!state) {
    return (
      <div className="app app--loading">
        <p>Cargando UMBRAL…</p>
        {error && <div className="banner banner--error">{error}</div>}
      </div>
    );
  }

  /* —— Welcome screen —— */
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

  /* —— Active chat —— */
  const stats = state.stats;

  return (
    <div className="app">
      <FinishModal
        open={showFinishModal}
        loading={loading}
        onCancel={closeFinishModal}
        onConfirm={confirmFinish}
      />

      <Header
        appName={state.app_name}
        stats={stats}
        theme={theme}
        loading={loading}
        onThemeToggle={handleThemeToggle}
        onFinish={openFinishModal}
      />

      {error && <div className="banner banner--error">{error}</div>}

      <main className="grid">
        <Panel variant="chat" title="Conversación" collapsed={false} onToggle={() => {}}>
          <MessageList
            messages={state.conversation}
            emptyText="Escribí un mensaje para empezar."
            variant="chat"
          />
          <div ref={chatEndRef} />
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
        </Panel>

        <Panel
          variant="sent"
          title="Enviados a Groq"
          hint="Payload real de cada llamada (incluye system)."
          collapsed={collapsed.sent}
          onToggle={() => togglePanel("sent")}
        >
          <MessageList
            messages={state.sent_to_model}
            emptyText="Aún no hay payload."
            variant="sent"
          />
        </Panel>

        <Panel
          variant="discarded"
          title="Descartados"
          hint="Historial que no entra por límite de tokens."
          collapsed={collapsed.discarded}
          onToggle={() => togglePanel("discarded")}
        >
          <MessageList
            messages={state.discarded}
            emptyText="Nada descartado todavía."
            variant="discarded"
          />
        </Panel>
      </main>
    </div>
  );
}
