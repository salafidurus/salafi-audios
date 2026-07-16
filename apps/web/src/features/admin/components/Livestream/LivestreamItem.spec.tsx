import { vi, type Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LivestreamItem } from "./LivestreamItem";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";

vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
  useAdminPermissions: vi.fn<any>(),
}));

const mockSession = {
  id: "session-1",
  status: "live" as const,
  channelDisplayName: "Channel One",
  telegramSlug: "chan_one",
  scholarName: "Scholar One",
  scholarSlug: "scholar-one",
  title: "Live Class Title",
  scheduledAt: "2026-07-14T20:00:00Z",
  startedAt: "2026-07-14T20:05:00Z",
  updatedAt: "2026-07-14T20:10:00Z",
};

const mockChannel = {
  id: "channel-1",
  displayName: "Channel One",
  telegramSlug: "chan_one",
  language: "ar" as const,
  isActive: true,
  scholarName: "Scholar One",
  scholarSlug: "scholar-one",
  createdAt: "2026-07-14T20:00:00Z",
  updatedAt: "2026-07-14T20:10:00Z",
};

describe("LivestreamItem", () => {
  describe("Session item rendering", () => {
    it("renders session info correctly", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: [] },
      });

      render(
        <LivestreamItem
          type="session"
          item={mockSession}
          onEdit={vi.fn<any>()}
          onDelete={vi.fn<any>()}
        />,
      );

      expect(screen.getByText("Live Class Title")).toBeInTheDocument();
      expect(screen.getByText("Channel: Channel One")).toBeInTheDocument();
      expect(screen.getByText("@chan_one")).toBeInTheDocument();
      expect(screen.getByText("Scholar One")).toBeInTheDocument();
    });

    it("hides status and delete buttons when lacking permissions", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: [] },
      });

      render(
        <LivestreamItem
          type="session"
          item={mockSession}
          onEdit={vi.fn<any>()}
          onDelete={vi.fn<any>()}
        />,
      );

      expect(screen.queryByRole("button", { name: /edit status/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /delete session/i })).not.toBeInTheDocument();
    });

    it("shows status button when user has LIVE_EDIT", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["LIVE_EDIT"] },
      });

      render(
        <LivestreamItem
          type="session"
          item={mockSession}
          onEdit={vi.fn<any>()}
          onDelete={vi.fn<any>()}
        />,
      );

      expect(screen.getByRole("button", { name: /edit status/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /delete session/i })).not.toBeInTheDocument();
    });

    it("shows delete button when user has LIVE_DELETE", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["LIVE_DELETE"] },
      });

      render(
        <LivestreamItem
          type="session"
          item={mockSession}
          onEdit={vi.fn<any>()}
          onDelete={vi.fn<any>()}
        />,
      );

      expect(screen.queryByRole("button", { name: /edit status/i })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /delete session/i })).toBeInTheDocument();
    });
  });

  describe("Channel item rendering", () => {
    it("renders channel info correctly", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: [] },
      });

      render(
        <LivestreamItem
          type="channel"
          item={mockChannel}
          onEdit={vi.fn<any>()}
          onDelete={vi.fn<any>()}
        />,
      );

      expect(screen.getByText("Channel One")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("AR")).toBeInTheDocument();
    });

    it("calls onEdit when clicking edit and onOpen is available", () => {
      const onEdit = vi.fn<any>();
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["LIVE_EDIT"] },
      });

      render(
        <LivestreamItem
          type="channel"
          item={mockChannel}
          onEdit={onEdit}
          onDelete={vi.fn<any>()}
        />,
      );

      const editBtn = screen.getByRole("button", { name: /edit channel/i });
      fireEvent.click(editBtn);
      expect(onEdit).toHaveBeenCalled();
    });
  });
});
