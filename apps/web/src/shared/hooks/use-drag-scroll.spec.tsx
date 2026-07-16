import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { useDragScroll } from "./use-drag-scroll";

function TestComponent({
  direction,
  onClick,
}: {
  direction: "horizontal" | "vertical";
  onClick: () => void;
}) {
  const ref = useDragScroll(direction);
  return (
    <div ref={ref} data-testid="scroll-container">
      <button data-testid="click-target" onClick={onClick}>
        Click Me
      </button>
    </div>
  );
}

describe("useDragScroll", () => {
  it("allows standard clicks when no drag movement happens", () => {
    const handleClick = vi.fn<any>();
    render(<TestComponent direction="vertical" onClick={handleClick} />);
    const target = screen.getByTestId("click-target");

    fireEvent.mouseDown(target, { clientX: 10, clientY: 10 });
    fireEvent.mouseUp(target, { clientX: 10, clientY: 10 });
    fireEvent.click(target);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("prevents click events when drag movement exceeds threshold", () => {
    const handleClick = vi.fn<any>();
    render(<TestComponent direction="vertical" onClick={handleClick} />);
    const container = screen.getByTestId("scroll-container");
    const target = screen.getByTestId("click-target");

    // Simulate drag movement
    fireEvent.mouseDown(container, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(window, { clientX: 10, clientY: 20 }); // Move 10px vertically
    fireEvent.mouseUp(window, { clientX: 10, clientY: 20 });
    fireEvent.click(target);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
