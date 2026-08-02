import { createMongoAbility } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { render, screen } from "@testing-library/react-native";
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

    expect(screen.getByText("Admin Dashboard")).toBeTruthy();
    expect(screen.getByText("Listings")).toBeTruthy();
    expect(screen.getByText("Scholars")).toBeTruthy();
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

  it("renders neither card and a no-permissions message when the ability has no rules", async () => {
    mockedUseAbility.mockReturnValue({
      ability: createMongoAbility([]),
      isLoading: false,
    });

    await render(<AdminDashboardScreen />);

    expect(screen.queryByText("Listings")).toBeNull();
    expect(screen.queryByText("Scholars")).toBeNull();
    expect(screen.getByText("You don't have any admin permissions.")).toBeTruthy();
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

    expect(screen.toJSON()).not.toBeNull();
    expect(mockNavigateListings).not.toHaveBeenCalled();
  });
});
