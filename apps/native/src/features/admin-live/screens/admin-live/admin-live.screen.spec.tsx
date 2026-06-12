import React from "react";
import renderer, { act } from "react-test-renderer";
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

  it("renders sessions and channels lists", () => {
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

    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<AdminLiveScreen />);
    });

    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain("Sessions");
    expect(rendered).toContain("Channels");
    expect(rendered).toContain("Test Session");
    expect(rendered).toContain("Mock Channel");
    expect(rendered).toContain("Active");
  });
});
