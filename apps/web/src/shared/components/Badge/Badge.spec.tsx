import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "bun:test";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders admin role badge with primary styling", () => {
    render(<Badge variant="role" role="admin" />);

    const badge = screen.getByText(/admin/i);
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe("SPAN");
  });

  it("renders user role badge with muted styling", () => {
    render(<Badge variant="role" role="user" />);

    const badge = screen.getByText(/user/i);
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe("SPAN");
  });

  it("renders status badge with custom color variant", () => {
    render(<Badge variant="status" status="Active" color="success" />);

    const badge = screen.getByText("Active");
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe("SPAN");
  });

  it("renders status badge with default primary color when color not specified", () => {
    render(<Badge variant="status" status="Pending" />);

    const badge = screen.getByText("Pending");
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe("SPAN");
  });
});
