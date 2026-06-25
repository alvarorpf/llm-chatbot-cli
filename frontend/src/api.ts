export interface ChatMessage {
  role: string;
  content: string;
}

export interface ContextStats {
  history_messages: number;
  sent_messages: number;
  dropped_messages: number;
  tokens_sent: number;
  max_tokens: number;
  first_history_message_in_context: boolean;
}

export interface ChatState {
  app_name: string;
  active: boolean;
  max_context_tokens: number;
  reply: string | null;
  conversation: ChatMessage[];
  sent_to_model: ChatMessage[];
  discarded: ChatMessage[];
  stats: ContextStats;
}

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, init);
}

/** Pide el estado actual al backend. */
export async function fetchState(): Promise<ChatState> {
  const response = await apiFetch("/api/state");
  if (!response.ok) throw new Error("No se pudo cargar el estado");
  return response.json();
}

/** Inicia una charla con el límite de tokens elegido. */
export async function startSession(maxTokens: number): Promise<ChatState> {
  const response = await apiFetch("/api/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ max_tokens: maxTokens }),
  });
  if (!response.ok) throw new Error("No se pudo iniciar la sesión");
  return response.json();
}

/** Finaliza la charla y vuelve a la pantalla de inicio. */
export async function finishSession(): Promise<ChatState> {
  const response = await apiFetch("/api/finish", { method: "POST" });
  if (!response.ok) throw new Error("No se pudo finalizar");
  return response.json();
}

/** Envía un mensaje del usuario. */
export async function sendMessage(message: string): Promise<ChatState> {
  const response = await apiFetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error("Error al enviar mensaje");
  return response.json();
}
