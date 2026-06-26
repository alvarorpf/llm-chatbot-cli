import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Panel from "./Panel";

describe("Panel", () => {
  const defaultProps = {
    title: "Test Panel",
    variant: "sent" as const,
    collapsed: false,
    onToggle: vi.fn(),
    children: <p>panel content</p>,
  };

  it("renders title and children", () => {
    render(<Panel {...defaultProps} />);

    expect(screen.getByText("Test Panel")).toBeInTheDocument();
    expect(screen.getByText("panel content")).toBeInTheDocument();
  });

  it("applies panel--collapsed class when collapsed prop is true", () => {
    const { container } = render(
      <Panel {...defaultProps} collapsed={true} />
    );

    expect(
      container.querySelector(".panel--collapsed")
    ).toBeInTheDocument();
  });

  it("does not apply panel--collapsed class when collapsed prop is false", () => {
    const { container } = render(
      <Panel {...defaultProps} collapsed={false} />
    );

    expect(
      container.querySelector(".panel--collapsed")
    ).not.toBeInTheDocument();
  });

  it("fires onToggle callback when toggle button is clicked", () => {
    const onToggle = vi.fn();
    render(<Panel {...defaultProps} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button", { name: /ocultar/i }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("shows Mostrar when collapsed and Ocultar when expanded", () => {
    const { rerender } = render(
      <Panel {...defaultProps} collapsed={true} />
    );

    expect(screen.getByRole("button", { name: /mostrar/i })).toBeInTheDocument();

    rerender(<Panel {...defaultProps} collapsed={false} />);

    expect(screen.getByRole("button", { name: /ocultar/i })).toBeInTheDocument();
  });
});
