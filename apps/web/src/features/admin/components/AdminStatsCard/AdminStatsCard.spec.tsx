import { describe, it, expect, vi } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminStatsCard } from "./AdminStatsCard";

describe("AdminStatsCard", () => {
  const mockIcon = <div data-testid="icon">📊</div>;

  it("renders with required props", () => {
    render(<AdminStatsCard icon={mockIcon} label="Total Scholars" value={42} />);
    expect(screen.getByText("Total Scholars")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders trend indicator when provided", () => {
    render(
      <AdminStatsCard
        icon={mockIcon}
        label="Total Scholars"
        value={42}
        trend={{ label: "+12%", direction: "up" }}
      />,
    );
    expect(screen.getByText("+12%")).toBeInTheDocument();
  });

  it("renders without trend indicator", () => {
    render(<AdminStatsCard icon={mockIcon} label="Total Scholars" value={42} />);
    expect(screen.queryByText("+12%")).not.toBeInTheDocument();
  });

  it("calls onClick when clicked as button", () => {
    const handleClick = vi.fn();
    render(
      <AdminStatsCard icon={mockIcon} label="Total Scholars" value={42} onClick={handleClick} />,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });

  it("renders as link when href is provided", () => {
    render(
      <AdminStatsCard icon={mockIcon} label="Total Scholars" value={42} href="/admin/scholars" />,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/admin/scholars");
  });

  it("renders icon element", () => {
    render(<AdminStatsCard icon={mockIcon} label="Total Scholars" value={42} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders as static card without onClick or href", () => {
    render(<AdminStatsCard icon={mockIcon} label="Total Scholars" value={42} />);

    const card = screen.getByTestId("admin-stats-card");
    expect(card).toBeInTheDocument();
    expect(card).not.toHaveClass("clickable");
  });

  it("displays string values", () => {
    render(<AdminStatsCard icon={mockIcon} label="Status" value="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies className to card", () => {
    const { container } = render(
      <AdminStatsCard icon={mockIcon} label="Total Scholars" value={42} className="custom-class" />,
    );

    const card = container.querySelector(".custom-class");
    expect(card).toBeInTheDocument();
  });
});
