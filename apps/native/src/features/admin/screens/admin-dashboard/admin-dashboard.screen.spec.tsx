import { createMongoAbility } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { AdminDashboardScreen } from "./admin-dashboard.screen";

jest.mock("@sd/domain-account", () => ({
  useAbility: jest.fn(),
}));

jest.mock("@/core/auth/use-auth", () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true, isLoading: false, user: undefined })),
}));

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

const mockedUseAbility = jest.mocked(useAbility) as any;

describe("AdminDashboardScreen", () => {
  it("renders both cards when the ability grants both", async () => {
    mockedUseAbility.mockReturnValue({
      ability: createMongoAbility([
        { action: "read", subject: "Listing" },
        { action: "read", subject: "Scholar" },
      ]),
      isLoading: false,
    });

    await render(<AdminDashboardScreen />);

    expect(screen.getByText("Listings")).toBeTruthy();
    expect(screen.getByText("Scholars")).toBeTruthy();
  });

  it("uses the shared Expo UI screen host and native destination rows", async () => {
    mockedUseAbility.mockReturnValue({
      ability: createMongoAbility([
        { action: "read", subject: "Listing" },
        { action: "read", subject: "Scholar" },
      ]),
      isLoading: false,
    });

    await render(<AdminDashboardScreen />);

    expect(screen.getByTestId("admin-dashboard-host")).toBeTruthy();
    expect(screen.getByTestId("admin-dashboard-listings")).toBeTruthy();
    expect(screen.getByTestId("admin-dashboard-scholars")).toBeTruthy();
  });

  it("renders only the Listings card when the ability only grants Listing access", async () => {
    mockedUseAbility.mockReturnValue({
      ability: createMongoAbility([{ action: "read", subject: "Listing" }]),
      isLoading: false,
    });

    await render(<AdminDashboardScreen />);

    expect(screen.getByText("Listings")).toBeTruthy();
    expect(screen.queryByText("Scholars")).toBeNull();
  });

  it("renders neither card and a no-access message when the ability has no rules", async () => {
    mockedUseAbility.mockReturnValue({
      ability: createMongoAbility([]),
      isLoading: false,
    });

    await render(<AdminDashboardScreen />);

    expect(screen.queryByText("Listings")).toBeNull();
    expect(screen.queryByText("Scholars")).toBeNull();
    expect(screen.getByText("You don't have any admin access.")).toBeTruthy();
  });

  it("renders a loading state while the ability is loading", async () => {
    mockedUseAbility.mockReturnValue({
      ability: createMongoAbility([]),
      isLoading: true,
    });

    await render(<AdminDashboardScreen />);

    expect(screen.getByText("Loading…")).toBeTruthy();
  });

  it("calls navigation handlers when sections are pressed", async () => {
    mockedUseAbility.mockReturnValue({
      ability: createMongoAbility([
        { action: "read", subject: "Listing" },
        { action: "read", subject: "Scholar" },
      ]),
      isLoading: false,
    });
    const mockNavigateListings = jest.fn();
    const mockNavigateScholars = jest.fn();

    await render(
      <AdminDashboardScreen
        onNavigateToListings={mockNavigateListings}
        onNavigateToScholars={mockNavigateScholars}
      />,
    );

    await fireEvent.press(screen.getByTestId("admin-dashboard-listings"));
    await fireEvent.press(screen.getByTestId("admin-dashboard-scholars"));

    expect(mockNavigateListings).toHaveBeenCalledTimes(1);
    expect(mockNavigateScholars).toHaveBeenCalledTimes(1);
  });
});
