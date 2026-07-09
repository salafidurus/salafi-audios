import { render, screen, fireEvent } from "@testing-library/react";
import { AdminCard, AdminCardProps } from "./AdminCard";

const mockActions = <div data-testid="actions">Actions</div>;

const defaultProps: AdminCardProps = {
  title: "Test User",
  subtitle: "test@example.com",
  metadata: [
    { label: "Role", value: "Admin" },
    { label: "Email", value: "test@example.com", truncate: true },
  ],
  actions: mockActions,
};

describe("AdminCard", () => {
  it("renders with required props", () => {
    render(<AdminCard {...defaultProps} />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("renders optional subtitle", () => {
    render(<AdminCard {...defaultProps} subtitle="Subtitle" />);
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
  });

  it("renders without optional props", () => {
    render(
      <AdminCard
        title="Test"
        metadata={[]}
        actions={mockActions}
      />,
    );
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("renders metadata items", () => {
    render(<AdminCard {...defaultProps} />);
    expect(screen.getByText("Role:")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("shows expandable button for expandable metadata", () => {
    render(
      <AdminCard
        title="Test"
        metadata={[
          { label: "Permissions", value: "perm1, perm2, perm3", expandable: true },
        ]}
        actions={mockActions}
      />,
    );
    expect(screen.getByText("View all")).toBeInTheDocument();
  });

  it("toggles expandable metadata on button click", () => {
    render(
      <AdminCard
        title="Test"
        metadata={[
          { label: "Permissions", value: "perm1, perm2, perm3", expandable: true },
        ]}
        actions={mockActions}
      />,
    );

    const expandButton = screen.getByText("View all");
    fireEvent.click(expandButton);
    expect(screen.getByText("Hide")).toBeInTheDocument();
  });

  it("renders thumbnail image when provided", () => {
    render(
      <AdminCard
        {...defaultProps}
        thumbnail={{ src: "test.jpg", alt: "Test image" }}
      />,
    );
    const img = screen.getByAltText("Test image");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "test.jpg");
  });

  it("renders custom thumbnail element when provided", () => {
    render(
      <AdminCard
        {...defaultProps}
        thumbnail={<div data-testid="custom-thumbnail">Custom</div>}
      />,
    );
    expect(screen.getByTestId("custom-thumbnail")).toBeInTheDocument();
  });

  it("calls onClick when card is clicked", () => {
    const handleClick = jest.fn();
    render(<AdminCard {...defaultProps} onClick={handleClick} />);

    const card = screen.getByRole("button");
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalled();
  });

  it("prevents action clicks from triggering card click", () => {
    const handleClick = jest.fn();
    render(
      <AdminCard
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
    render(<AdminCard {...defaultProps} />);
    expect(screen.getByTestId("actions")).toBeInTheDocument();
  });
});
