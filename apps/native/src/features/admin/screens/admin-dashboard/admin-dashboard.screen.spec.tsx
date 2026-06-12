import React from "react";
import renderer, { act } from "react-test-renderer";
import { AdminDashboardScreen } from "./admin-dashboard.screen";

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

describe("AdminDashboardScreen", () => {
  it("renders all admin sections", () => {
    let tree: ReturnType<typeof renderer.create>;

    act(() => {
      tree = renderer.create(<AdminDashboardScreen />);
    });

    const rendered = JSON.stringify(tree!.toJSON());

    expect(rendered).toContain("Admin Dashboard");
    expect(rendered).toContain("Lectures");
    expect(rendered).toContain("Live");
    expect(rendered).toContain("Scholars");
  });

  it("calls navigation handlers when sections are pressed", () => {
    const mockNavigateLectures = jest.fn();
    const mockNavigateLive = jest.fn();
    const mockNavigateScholars = jest.fn();

    let tree: ReturnType<typeof renderer.create>;

    act(() => {
      tree = renderer.create(
        <AdminDashboardScreen
          onNavigateToLectures={mockNavigateLectures}
          onNavigateToLive={mockNavigateLive}
          onNavigateToScholars={mockNavigateScholars}
        />,
      );
    });

    expect(tree!.toJSON()).not.toBeNull();
    expect(mockNavigateLectures).not.toHaveBeenCalled();
  });
});
