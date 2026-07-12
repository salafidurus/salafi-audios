import { vi, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminLivestreamsScreen } from "./admin-livestreams.screen";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { useApiQuery } from "@sd/core-contracts";

vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
  useAdminPermissions: vi.fn(),
}));
vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: vi.fn(),
}));
vi.mock("@sd/core-contracts", async (importActual) => {
  const actual = await importActual<typeof import("@sd/core-contracts")>();
  return {
    ...actual,
    useApiQuery: vi.fn(),
  };
});
describe("AdminLivestreamsScreen action button gates", () => {
  const scheduledSession = {
    id: "session-1",
    title: "Upcoming Talk",
    channelDisplayName: "Main Channel",
    scholarName: "Scholar A",
    status: "scheduled" as const,
  };

  const liveSession = {
    id: "session-2",
    title: "Live Now",
    channelDisplayName: "Main Channel",
    scholarName: "Scholar A",
    status: "live" as const,
  };

  const endedSession = {
    id: "session-3",
    title: "Past Talk",
    channelDisplayName: "Main Channel",
    scholarName: "Scholar B",
    status: "ended" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useResponsive as Mock).mockReturnValue({ isMobile: false });
    (useApiQuery as Mock).mockImplementation((key: readonly unknown[]) => {
      const keyStr = JSON.stringify(key);
      if (keyStr.includes("live") && keyStr.includes("active")) {
        return { data: { sessions: [liveSession] }, isFetching: false, refetch: vi.fn() };
      }
      if (keyStr.includes("live") && keyStr.includes("scheduled")) {
        return { data: { sessions: [scheduledSession] }, isFetching: false, refetch: vi.fn() };
      }
      if (keyStr.includes("live") && keyStr.includes("ended")) {
        return { data: { sessions: [endedSession] }, isFetching: false, refetch: vi.fn() };
      }
      return { data: { sessions: [] }, isFetching: false, refetch: vi.fn() };
    });
  });

  it("hides Go Live when user lacks LIVE_START", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["LIVE_VIEW"] },
    });

    render(<AdminLivestreamsScreen />);

    expect(screen.queryByText("Go Live")).not.toBeInTheDocument();
  });

  it("shows Go Live when user has LIVE_START", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["LIVE_START"] },
    });

    render(<AdminLivestreamsScreen />);

    expect(screen.getByText("Go Live")).toBeInTheDocument();
  });

  it("hides End when user lacks LIVE_STOP", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["LIVE_VIEW"] },
    });

    render(<AdminLivestreamsScreen />);

    expect(screen.queryByText("End")).not.toBeInTheDocument();
  });

  it("shows End when user has LIVE_STOP", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["LIVE_STOP"] },
    });

    render(<AdminLivestreamsScreen />);

    expect(screen.getByText("End")).toBeInTheDocument();
  });

  it("hides Reschedule when user lacks LIVE_START", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["LIVE_VIEW"] },
    });

    render(<AdminLivestreamsScreen />);

    expect(screen.queryByText("Reschedule")).not.toBeInTheDocument();
  });

  it("shows Reschedule when user has LIVE_START", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["LIVE_START"] },
    });

    render(<AdminLivestreamsScreen />);

    expect(screen.getByText("Reschedule")).toBeInTheDocument();
  });
});
