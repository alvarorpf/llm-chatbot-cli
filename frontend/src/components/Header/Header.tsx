interface HeaderStats {
  tokens_sent: number;
  max_tokens: number;
  dropped_messages: number;
}

interface HeaderProps {
  appName: string;
  stats: HeaderStats;
  theme: "dark" | "light";
  loading: boolean;
  onThemeToggle: () => void;
  onFinish: () => void;
}

export default function Header({
  appName,
  stats,
  theme,
  loading,
  onThemeToggle,
  onFinish,
}: HeaderProps) {
  return (
    <header className="header">
      <div>
        <p className="header__eyebrow">Donde la memoria encuentra su límite</p>
        <h1 className="header__title">{appName}</h1>
      </div>
      <div className="header__stats">
        <span>
          📊 <span className="stat-label">tokens </span><strong>{stats.tokens_sent}</strong> / {stats.max_tokens}
        </span>
        <span>
          🗑️ <span className="stat-label">descartados </span><strong>{stats.dropped_messages}</strong>
        </span>
        <button
          type="button"
          className="btn btn--icon"
          onClick={onThemeToggle}
          aria-label="Cambiar tema"
          title={theme === "dark" ? "Tema claro" : "Tema oscuro"}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onFinish}
          disabled={loading}
          aria-label="Finalizar"
        >
          ⏹ <span className="btn__label">Finalizar</span>
        </button>
      </div>
    </header>
  );
}
