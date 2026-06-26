import { FormEvent, useState } from "react";

interface WelcomeScreenProps {
  appName: string;
  defaultTokens: number;
  loading: boolean;
  onStart: (tokens: number) => void;
}

export default function WelcomeScreen({
  appName,
  defaultTokens,
  loading,
  onStart,
}: WelcomeScreenProps) {
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
