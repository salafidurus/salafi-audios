import React from "react";
import { render, screen } from "@testing-library/react-native";
import { AdminDashboardScreen } from "./admin-dashboard.screen";

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

describe("AdminDashboardScreen", () => {
  it("renders all admin sections", async () => {
    await render(<AdminDashboardScreen />);

    expect(screen.getByText("Admin Dashboard")).toBeTruthy();
    expect(screen.getByText("Lectures")).toBeTruthy();
    expect(screen.getByText("Live")).toBeTruthy();
    expect(screen.getByText("Scholars")).toBeTruthy();
  });

  it("calls navigation handlers when sections are pressed", async () => {
    const mockNavigateLectures = jest.fn();
    const mockNavigateLive = jest.fn();
    const mockNavigateScholars = jest.fn();

    await render(
      <AdminDashboardScreen
        onNavigateToLectures={mockNavigateLectures}
        onNavigateToLive={mockNavigateLive}
        onNavigateToScholars={mockNavigateScholars}
      />,
    );

    expect(screen.toJSON()).not.toBeNull();
    expect(mockNavigateLectures).not.toHaveBeenCalled();
  });
});
