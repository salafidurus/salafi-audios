import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "bun:test";
import React from "react";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("exposes empty content as a live status with branded composition", () => {
    render(<EmptyState message="Nothing here yet." />);

    expect(screen.getByRole("status")).toHaveTextContent("Nothing here yet.");
    expect(screen.getByRole("status")).toHaveAttribute("data-slot", "card");
  });

  it("exposes errors as alerts", () => {
    render(<EmptyState message="Unable to load." variant="error" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Unable to load.");
  });

  it("exposes denied content as an assertive alert", () => {
    render(<EmptyState message="You do not have access." variant="denied" />);

    expect(screen.getByRole("alert")).toHaveTextContent("You do not have access.");
    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
  });
});
