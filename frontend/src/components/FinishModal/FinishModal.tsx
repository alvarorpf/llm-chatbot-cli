const TOKEN_MODAL_TEXT =
  "Los modelos de lenguaje no recuerdan la conversación por sí solos: en cada mensaje " +
  "reciben un bloque de texto llamado contexto. Ese bloque se mide en tokens " +
  "(aproximadamente pedazos de palabras). Cada modelo y cada servicio tiene un límite " +
  "de cuántos tokens puede procesar a la vez. Si la conversación es muy larga, algo " +
  "tiene que quedar fuera — lo más antiguo suele descartarse primero. Por eso, en charlas " +
  "largas, la IA puede dejar de tener acceso a lo que se dijo al principio.";

interface FinishModalProps {
  open: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function FinishModal({ open, loading, onCancel, onConfirm }: FinishModalProps) {
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
