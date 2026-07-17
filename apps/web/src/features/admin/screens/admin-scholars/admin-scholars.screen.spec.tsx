import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { AdminScholarsScreen } from "./admin-scholars.screen";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
import { useApiQuery } from "@sd/core-contracts";

vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
  useAdminPermissions: vi.fn(),
}));
vi.mock("@sd/core-contracts", () => {
  // Import the real module to preserve all exports
  const actual = require("@sd/core-contracts");
  return { ...actual, useApiQuery: vi.fn() };
});
vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: () => ({ isMobile: false }),
  useIsDesktop: () => true,
}));

describe("AdminScholarsScreen", () => {
  beforeEach(() => {
    (useApiQuery as Mock<any>).mockReturnValue({
      data: { scholars: [] },
      isFetching: false,
      refetch: vi.fn(),
    });
  });

  it("hides Add Scholar button when user lacks SCHOLARS_CREATE", () => {
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["SCHOLARS_VIEW"] },
    });

    render(<AdminScholarsScreen />);

    expect(screen.queryByText("Add Scholar")).not.toBeInTheDocument();
    expect(screen.queryByText("Add")).not.toBeInTheDocument();
  });

  it("shows Add Scholar button when user has SCHOLARS_CREATE", () => {
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["SCHOLARS_CREATE"] },
    });

    render(<AdminScholarsScreen />);

    expect(screen.getByText("Add Scholar")).toBeInTheDocument();
  });
});
