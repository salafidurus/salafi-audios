import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "bun:test";
import React from "react";

import AuthCallbackPage from "./page";

const sessionState = vi.fn();

vi.mock("@/core/auth/auth-client", () => ({
  authClient: {
    useSession: () => sessionState(),
  },
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

vi.mock("@/features/navigation/components/public-shell/public-shell", () => ({
  PublicShell: ({ children }: { children: React.ReactNode }) => (
    <>
      <header data-testid="public-header" />
      {children}
      <footer data-testid="public-footer" />
    </>
  ),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useSearchParams: () => new URLSearchParams(),
}));

describe("AuthCallbackPage", () => {
  afterEach(() => {
    cleanup();
    sessionState.mockReset();
    vi.useRealTimers();
  });

  it("renders the loading state inside the public shell", () => {
    sessionState.mockReturnValue({ data: null, isPending: true, error: null });

    render(<AuthCallbackPage />);

    expect(screen.getByTestId("public-header")).toBeInTheDocument();
    expect(screen.getByText("Completing sign-in...")).toBeInTheDocument();
    expect(screen.getByTestId("public-footer")).toBeInTheDocument();
  });

  it("keeps timeout recovery inside the public shell", async () => {
    vi.useFakeTimers();
    sessionState.mockReturnValue({ data: null, isPending: true, error: null });

    render(<AuthCallbackPage />);
    await act(async () => {
      vi.advanceTimersByTime(10_000);
    });

    expect(screen.getByTestId("public-header")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Authentication Timeout" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Please try again" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
    expect(screen.getByTestId("public-footer")).toBeInTheDocument();
  });

  it("keeps error recovery inside the public shell", () => {
    sessionState.mockReturnValue({
      data: null,
      isPending: false,
      error: new Error("Provider failed"),
    });

    render(<AuthCallbackPage />);

    expect(screen.getByTestId("public-header")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Authentication Error" })).toBeInTheDocument();
    expect(screen.getByText("Provider failed")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute("href", "/sign-in");
    expect(screen.getByTestId("public-footer")).toBeInTheDocument();
  });
});
