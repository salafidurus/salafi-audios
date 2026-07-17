import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { AdminContentsScreen } from "./admin-contents.screen";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
import { useApiQuery } from "@sd/core-contracts";
import { usePathname } from "next/navigation";

vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
  useAdminPermissions: vi.fn(),
}));
vi.mock("@sd/core-contracts", () => {
  // Import the real module to preserve all exports
  const actual = require("@sd/core-contracts");
  return { ...actual, useApiQuery: vi.fn() };
});
vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: () => ({ isMobile: false }),
}));

describe("AdminContentsScreen — topics tab permission gates", () => {
  beforeEach(() => {
    (usePathname as Mock<any>).mockReturnValue("/admin/contents");
    (useApiQuery as Mock<any>).mockReturnValue({ data: [], refetch: vi.fn() });
  });

  it("hides Add Topic button when user lacks TOPICS_CREATE", () => {
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["LISTINGS_VIEW"] },
    });

    render(<AdminContentsScreen />);

    expect(screen.queryByText("Add Topic")).not.toBeInTheDocument();
  });

  it("shows Add Topic button when user has TOPICS_CREATE", () => {
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["TOPICS_CREATE"] },
    });

    render(<AdminContentsScreen />);

    expect(screen.getByText("Add Topic")).toBeInTheDocument();
  });
});
