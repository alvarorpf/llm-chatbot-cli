import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FinishModal from "./FinishModal";

describe("FinishModal", () => {
  const defaultProps = {
    open: true,
    loading: false,
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
  };

  it("renders nothing when open is false", () => {
    const { container } = render(
      <FinishModal {...defaultProps} open={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the dialog when open is true", () => {
    render(<FinishModal {...defaultProps} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText("¿Cómo funcionan los tokens?")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /seguir charlando/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /finalizar charla/i })
    ).toBeInTheDocument();
  });

  it("calls onCancel when the cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(<FinishModal {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: /seguir charlando/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("calls onConfirm when the confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(<FinishModal {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: /finalizar charla/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("disables buttons when loading", () => {
    render(<FinishModal {...defaultProps} loading={true} />);

    expect(
      screen.getByRole("button", { name: /seguir charlando/i })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /cerrando/i })
    ).toBeDisabled();
  });
});
