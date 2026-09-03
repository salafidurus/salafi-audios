import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "bun:test";
import React from "react";

import { useResponsive } from "@/shared/hooks/use-responsive";

import { BottomNavigation } from "./bottom-navigation";

vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: vi.fn(),
}));

const mockUsePathname = vi.fn(() => "/");

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname,
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
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

describe("BottomNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/");
    (useResponsive as Mock<any>).mockReturnValue({ isMobile: true, isTablet: false, isWeb: false });
  });

  it("exposes the five canonical public destinations and marks the current page", () => {
    render(<BottomNavigation />);

    const navigation = screen.getByRole("navigation", { name: "Bottom navigation" });
    expect(screen.getAllByRole("link")).toHaveLength(5);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute("href", "/explore");
    expect(screen.getByRole("link", { name: "Scholars" })).toHaveAttribute("href", "/scholars");
    expect(screen.getByRole("link", { name: "My Library" })).toHaveAttribute("href", "/my-library");
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(navigation).toContainElement(screen.getByRole("link", { name: "Settings" }));
  });

  it("does not render in the admin workspace or at desktop widths", () => {
    mockUsePathname.mockReturnValue("/admin/contents");
    const { rerender } = render(<BottomNavigation />);
    expect(screen.queryByRole("navigation", { name: "Bottom navigation" })).not.toBeInTheDocument();

    (useResponsive as Mock<any>).mockReturnValue({ isMobile: false, isTablet: false, isWeb: true });
    mockUsePathname.mockReturnValue("/explore");
    rerender(<BottomNavigation />);
    expect(screen.queryByRole("navigation", { name: "Bottom navigation" })).not.toBeInTheDocument();
  });
});
