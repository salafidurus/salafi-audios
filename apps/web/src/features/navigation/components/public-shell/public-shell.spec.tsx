import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "bun:test";
import React from "react";

import { useResponsive } from "@/shared/hooks/use-responsive";

import { PublicShell } from "./public-shell";

vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: vi.fn(() => ({ isMobile: false, isTablet: false, isWeb: true })),
}));

vi.mock("../footer/footer", () => ({
  Footer: () => <footer data-testid="public-footer" />,
}));

vi.mock("../public-navigation/public-navigation", () => ({
  PublicNavigation: () => <header data-testid="public-header" />,
}));

vi.mock("../bottom-navigation/bottom-navigation", () => ({
  BottomNavigation: () => <nav data-testid="bottom-navigation" />,
}));

describe("PublicShell", () => {
  beforeEach(() => {
    (useResponsive as ReturnType<typeof vi.fn>).mockReturnValue({
      isMobile: false,
      isTablet: false,
      isWeb: true,
    });
  });

  it("removes the footer while retaining the persistent narrow navigation", () => {
    (useResponsive as ReturnType<typeof vi.fn>).mockReturnValue({
      isMobile: true,
      isTablet: false,
      isWeb: false,
    });

    render(<PublicShell>Content</PublicShell>);

    expect(screen.getByTestId("bottom-navigation")).toBeInTheDocument();
    expect(screen.queryByTestId("public-footer")).not.toBeInTheDocument();
  });

  it("renders the visible public chrome around fallback content", () => {
    (useResponsive as ReturnType<typeof vi.fn>).mockReturnValue({
      isMobile: false,
      isTablet: false,
      isWeb: true,
    });

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
