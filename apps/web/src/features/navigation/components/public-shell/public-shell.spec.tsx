import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "bun:test";
import React from "react";

import { PublicShell } from "./public-shell";

vi.mock("../footer/footer", () => ({
  Footer: () => <footer data-testid="public-footer" />,
}));

vi.mock("../public-navigation/public-navigation", () => ({
  PublicNavigation: () => <header data-testid="public-header" />,
}));

describe("PublicShell", () => {
  it("renders the visible public chrome around fallback content", () => {
    render(
      <PublicShell>
        <main>
          <h1>Page not found</h1>
        </main>
      </PublicShell>,
    );

    expect(screen.getByTestId("public-header")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Page not found");
    expect(screen.getByTestId("public-footer")).toBeInTheDocument();
  });

  it("supports content that must appear immediately before the footer", () => {
    render(
      <PublicShell beforeFooter={<div data-testid="before-footer">Mini player</div>}>
        <main>Content</main>
      </PublicShell>,
    );

    const footer = screen.getByTestId("public-footer");
    expect(screen.getByTestId("before-footer").compareDocumentPosition(footer)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
});
