import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  hint?: string;
  variant: "chat" | "sent" | "discarded";
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export default function Panel({ title, hint, variant, collapsed, onToggle, children }: PanelProps) {
  const isCollapsible = variant !== "chat";

  return (
    <section
      className={`panel panel--${variant}${collapsed ? " panel--collapsed" : ""}`}
    >
      <div className="panel__header">
        <h2 className="panel__title">{title}</h2>
        {isCollapsible && (
          <button
            type="button"
            className="panel__toggle"
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-controls={`panel-body-${variant}`}
          >
            {collapsed ? "Mostrar" : "Ocultar"}
          </button>
        )}
      </div>
      {hint && <p className="panel__hint">{hint}</p>}
      <div className="panel__body" id={isCollapsible ? `panel-body-${variant}` : undefined}>
        {children}
      </div>
    </section>
  );
}
