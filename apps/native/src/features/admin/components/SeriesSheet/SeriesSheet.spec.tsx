import { createMongoAbility } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { render, screen } from "@testing-library/react-native";
import React from "react";

import { SeriesSheet } from "./SeriesSheet";

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));
jest.mock("@/features/admin/api/admin-scholars.api", () => ({
  createSeries: jest.fn(),
  updateSeries: jest.fn(),
}));
jest.mock("@sd/domain-account", () => ({
  useAbility: jest.fn(),
}));
jest.mock("@/core/auth/use-auth", () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true, isLoading: false, user: undefined })),
}));

const mockedUseAbility = jest.mocked(useAbility) as any;

describe("SeriesSheet", () => {
  beforeEach(() => {
    mockedUseAbility.mockReturnValue({
      ability: createMongoAbility([
        { action: "create", subject: "Listing", conditions: { scholarId: "s1" } },
        { action: "update", subject: "Listing", conditions: { scholarId: "s1" } },
      ]),
      isLoading: false,
    });
  });

  it("renders create form when no series is provided", async () => {
    await render(
      <SeriesSheet isOpen={true} scholarId="s1" onClose={() => {}} onSaved={() => {}} />,
    );
    expect(screen.getByText("New Series")).toBeTruthy();
    expect(screen.getByText("Title", { exact: false })).toBeTruthy();
  });

  it("renders nothing when closed", async () => {
    await render(
      <SeriesSheet isOpen={false} scholarId="s1" onClose={() => {}} onSaved={() => {}} />,
    );
    expect(screen.toJSON()).toBeNull();
  });

  it("enables Save when the ability grants create for this scholar", async () => {
    await render(
      <SeriesSheet isOpen={true} scholarId="s1" onClose={() => {}} onSaved={() => {}} />,
    );
    const saveButton = screen.getByText("Save").parent;
    expect(saveButton?.props.accessibilityState?.disabled).toBeFalsy();
  });

  it("disables Save when the ability does not grant create for this scholar", async () => {
    mockedUseAbility.mockReturnValue({
      ability: createMongoAbility([
        { action: "create", subject: "Listing", conditions: { scholarId: "some-other-scholar" } },
      ]),
      isLoading: false,
    });

    await render(
      <SeriesSheet isOpen={true} scholarId="s1" onClose={() => {}} onSaved={() => {}} />,
    );
    const saveButton = screen.getByText("Save").parent;
    expect(saveButton?.props.accessibilityState?.disabled).toBe(true);
  });
});
