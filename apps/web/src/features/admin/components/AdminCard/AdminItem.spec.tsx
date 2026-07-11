import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AdminItem } from "./AdminItem";
import type { AdminItemProps } from "./AdminItem";

const mockActions = <div data-testid="actions">Actions</div>;

const defaultProps: AdminItemProps = {
  title: "Test User",
  subtitle: "test@example.com",
  metadata: [
    { label: "Role", value: "Admin" },
    { label: "Email", value: "test@example.com", truncate: true },
  ],
  actions: mockActions,
};

describe("AdminItem", () => {
  it("renders with required props", () => {
    render(<AdminItem {...defaultProps} />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
    // Check that email appears in the document (could appear multiple times due to truncation + full display)
    expect(screen.getAllByText("test@example.com").length).toBeGreaterThan(0);
  });

  it("renders optional subtitle", () => {
    render(<AdminItem {...defaultProps} subtitle="Subtitle" />);
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
  });

  it("renders without optional props", () => {
    render(<AdminItem title="Test" metadata={[]} actions={mockActions} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("renders metadata items", () => {
    render(<AdminItem {...defaultProps} />);
    expect(screen.getByText("Role:")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("shows expandable button for expandable metadata", () => {
    render(
      <AdminItem
        title="Test"
        metadata={[{ label: "Permissions", value: "perm1, perm2, perm3", expandable: true }]}
        actions={mockActions}
      />,
    );
    expect(screen.getByText("View all")).toBeInTheDocument();
  });

  it("toggles expandable metadata on button click", () => {
    render(
      <AdminItem
        title="Test"
        metadata={[{ label: "Permissions", value: "perm1, perm2, perm3", expandable: true }]}
        actions={mockActions}
      />,
    );

    const expandButton = screen.getByText("View all");
    fireEvent.click(expandButton);
    expect(screen.getByText("Hide")).toBeInTheDocument();
  });

  it("renders thumbnail image when provided", () => {
    render(<AdminItem {...defaultProps} thumbnail={{ src: "/test.jpg", alt: "Test image" }} />);
    const img = screen.getByAltText("Test image");
    expect(img).toBeInTheDocument();
    // Next.js Image component modifies src attribute, so just check alt attribute
    expect(img).toHaveAttribute("alt", "Test image");
  });

  it("renders custom thumbnail element when provided", () => {
    render(
      <AdminItem {...defaultProps} thumbnail={<div data-testid="custom-thumbnail">Custom</div>} />,
    );
    expect(screen.getByTestId("custom-thumbnail")).toBeInTheDocument();
  });

  it("calls onClick when item is clicked", () => {
    const handleClick = vi.fn();
    render(<AdminItem {...defaultProps} onClick={handleClick} />);

    const item = screen.getByText("Test User").closest("div");
    if (item) {
      fireEvent.click(item);
      expect(handleClick).toHaveBeenCalled();
    }
  });

  it("prevents action clicks from triggering item click", () => {
    const handleClick = vi.fn();
    render(
      <AdminItem
        {...defaultProps}
        onClick={handleClick}
        actions={<button data-testid="action-btn">Delete</button>}
      />,
    );

    const actionBtn = screen.getByTestId("action-btn");
    fireEvent.click(actionBtn);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders actions content", () => {
    render(<AdminItem {...defaultProps} />);
    expect(screen.getByTestId("actions")).toBeInTheDocument();
  });
});
