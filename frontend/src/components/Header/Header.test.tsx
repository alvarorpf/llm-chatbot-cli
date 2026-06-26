import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Header from "./Header";

describe("Header", () => {
  const defaultProps = {
    appName: "UMBRAL",
    stats: { tokens_sent: 500, max_tokens: 2000, dropped_messages: 3 },
    theme: "dark" as const,
    loading: false,
    onThemeToggle: vi.fn(),
    onFinish: vi.fn(),
  };

  it("renders the app name and stats", () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByText("UMBRAL")).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
    expect(screen.getByText(/2000/)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByText(/tokens/)).toBeInTheDocument();
    expect(screen.getByText(/descartados/)).toBeInTheDocument();
  });

  it("renders stat-label spans for responsive hiding", () => {
    render(<Header {...defaultProps} />);

    const statLabels = document.querySelectorAll(".stat-label");
    expect(statLabels.length).toBe(2);
    expect(statLabels[0]).toHaveTextContent(/tokens/);
    expect(statLabels[1]).toHaveTextContent(/descartados/);
  });

  it("fires the theme toggle callback when the theme button is clicked", () => {
    const onThemeToggle = vi.fn();
    render(<Header {...defaultProps} onThemeToggle={onThemeToggle} />);

    fireEvent.click(screen.getByRole("button", { name: /cambiar tema/i }));
    expect(onThemeToggle).toHaveBeenCalledOnce();
  });

  it("fires the finish callback when the finish button is clicked", () => {
    const onFinish = vi.fn();
    render(<Header {...defaultProps} onFinish={onFinish} />);

    const btn = screen.getByRole("button", { name: /finalizar/i });
    expect(btn).toHaveAttribute("aria-label", "Finalizar");
    fireEvent.click(btn);
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it("disables the finish button when loading", () => {
    render(<Header {...defaultProps} loading={true} />);

    expect(
      screen.getByRole("button", { name: /finalizar/i })
    ).toBeDisabled();
  });
});
