import React from "react";
import { render, screen } from "@testing-library/react-native";
import { AdminLiveScreen } from "./admin-live.screen";
import { useAdminChannels, useAdminSessions } from "../../hooks/use-admin-live";

jest.mock("../../hooks/use-admin-live", () => ({
  useAdminChannels: jest.fn(),
  useAdminSessions: jest.fn(),
}));

jest.mock("../../api/admin-live.api", () => ({
  updateSessionStatus: jest.fn(),
}));

const mockUseAdminChannels = useAdminChannels as jest.Mock;
const mockUseAdminSessions = useAdminSessions as jest.Mock;

describe("AdminLiveScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders sessions and channels lists", async () => {
    mockUseAdminChannels.mockReturnValue({
      data: [
        {
          id: "ch1",
          displayName: "Mock Channel",
          telegramSlug: "mock_ch",
          language: "en",
          isActive: true,
        },
      ],
      refetch: jest.fn(),
    });

    mockUseAdminSessions.mockReturnValue({
      data: {
        sessions: [
          { id: "s1", title: "Test Session", channelDisplayName: "Mock Channel", status: "live" },
        ],
      },
      refetch: jest.fn(),
    });

    await render(<AdminLiveScreen />);

    expect(screen.getByText("Sessions")).toBeTruthy();
    expect(screen.getByText("Channels")).toBeTruthy();
    expect(screen.getByText("Test Session")).toBeTruthy();
    expect(screen.getAllByText("Mock Channel").length).toBeGreaterThan(0);
    expect(screen.getByText("Active", { exact: false })).toBeTruthy();
  });
});
