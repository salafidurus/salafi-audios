import { render, screen } from "@testing-library/react";
import { Shield } from "lucide-react";
import { describe, it, expect } from "bun:test";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders permission badge with icon and text", () => {
    render(
      <Badge
        variant="permission"
        permission="read:users"
        icon={<Shield data-testid="shield-icon" />}
      />,
    );

    expect(screen.getByText("read:users")).toBeInTheDocument();
    expect(screen.getByTestId("shield-icon")).toBeInTheDocument();
  });

  it("renders admin role badge with primary styling", () => {
    render(<Badge variant="role" role="admin" />);

    const badge = screen.getByText("admin");
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe("SPAN");
  });

  it("renders user role badge with muted styling", () => {
    render(<Badge variant="role" role="user" />);

    const badge = screen.getByText("user");
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe("SPAN");
  });

  it("renders status badge with custom color variant", () => {
    render(<Badge variant="status" status="Active" color="success" />);

    const badge = screen.getByText("Active");
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe("SPAN");
  });

  it("renders without icon when not provided", () => {
    render(<Badge variant="permission" permission="write:posts" />);

    expect(screen.getByText("write:posts")).toBeInTheDocument();
    // Icon should not be rendered if not provided
    expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
  });

  it("renders status badge with default primary color when color not specified", () => {
    render(<Badge variant="status" status="Pending" />);

    const badge = screen.getByText("Pending");
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe("SPAN");
  });
});
