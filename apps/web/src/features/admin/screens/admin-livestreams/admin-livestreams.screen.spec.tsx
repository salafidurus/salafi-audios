import { vi, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminLivestreamsScreen } from "./admin-livestreams.screen";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
import { useApiQuery } from "@sd/core-contracts";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/live",
}));

vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
  useAdminPermissions: vi.fn<any>(),
}));

vi.mock("@sd/core-contracts", async (importActual) => {
  const actual = await importActual<typeof import("@sd/core-contracts")>();
  return {
    ...actual,
    useApiQuery: vi.fn<any>(),
  };
});

describe("AdminLivestreamsScreen permission gates", () => {
  const mockSession = {
    id: "session-1",
    title: "Explanation of Kitab at-Tawhid",
    channelDisplayName: "Main Channel",
    scholarName: "Scholar A",
    status: "live" as const,
    scheduledAt: "2026-07-14T20:00:00Z",
    startedAt: "2026-07-14T20:05:00Z",
    updatedAt: "2026-07-14T20:10:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useApiQuery as Mock).mockImplementation((key: readonly unknown[]) => {
      const keyStr = JSON.stringify(key);
      if (keyStr.includes("sessions")) {
        return { data: [mockSession], isFetching: false, refetch: vi.fn<any>() };
      }
      if (keyStr.includes("channels")) {
        return { data: { channels: [] }, isFetching: false, refetch: vi.fn<any>() };
      }
      return { data: undefined, isFetching: false, refetch: vi.fn<any>() };
    });
  });

  it("hides status button when user lacks LIVE_EDIT", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["LIVE_VIEW"] },
    });

    render(<AdminLivestreamsScreen />);

    expect(screen.queryByRole("button", { name: /status/i })).not.toBeInTheDocument();
  });

  it("shows status button when user has LIVE_EDIT", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["LIVE_EDIT"] },
    });

    render(<AdminLivestreamsScreen />);

    expect(screen.getByRole("button", { name: /status/i })).toBeInTheDocument();
  });

  it("hides delete button when user lacks LIVE_DELETE", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["LIVE_VIEW"] },
    });

    render(<AdminLivestreamsScreen />);

    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });

  it("shows delete button when user has LIVE_DELETE", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["LIVE_DELETE"] },
    });

    render(<AdminLivestreamsScreen />);

    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });
});
