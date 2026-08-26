import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "bun:test";
import React from "react";

import NotFound from "./not-found";

vi.mock("@/features/navigation/components/public-shell/public-shell", () => ({
  PublicShell: ({ children }: React.PropsWithChildren) => (
    <div data-testid="public-shell">{children}</div>
  ),
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

vi.mock("next/link", () => ({
  default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<"a">>(
    ({ children, ...props }, ref) => (
      <a ref={ref} {...props}>
        {children}
      </a>
    ),
  ),
}));

describe("NotFound", () => {
  it("keeps the 404 recovery content inside the public shell", () => {
    render(<NotFound />);

    expect(screen.getByTestId("public-shell")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
  });
});
