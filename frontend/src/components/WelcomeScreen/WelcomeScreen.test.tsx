import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import WelcomeScreen from "./WelcomeScreen";

describe("WelcomeScreen", () => {
  const defaultProps = {
    appName: "UMBRAL",
    defaultTokens: 2000,
    loading: false,
    onStart: vi.fn(),
  };

  it("renders the app name and form elements", () => {
    render(<WelcomeScreen {...defaultProps} />);

    expect(screen.getByText("UMBRAL")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Límite de tokens para esta charla")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /inicio/i })).toBeInTheDocument();
  });

  it("updates the input value when the user types", () => {
    render(<WelcomeScreen {...defaultProps} />);

    const input = screen.getByLabelText(
      "Límite de tokens para esta charla"
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "1500" } });
    expect(input.value).toBe("1500");
  });

  it("calls onStart with the default token value on submit", () => {
    const onStart = vi.fn();
    render(<WelcomeScreen {...defaultProps} onStart={onStart} />);

    fireEvent.click(screen.getByRole("button", { name: /inicio/i }));
    expect(onStart).toHaveBeenCalledWith(2000);
  });

  it("shows loading state on the submit button", () => {
    render(<WelcomeScreen {...defaultProps} loading={true} />);

    expect(screen.getByRole("button", { name: /iniciando/i })).toBeDisabled();
  });
});
