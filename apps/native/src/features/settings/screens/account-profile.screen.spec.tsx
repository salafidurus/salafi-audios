import { useAccountProfile, useUpdateProfile } from "@sd/domain-account";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { AccountProfileScreen } from "./account-profile.screen";

jest.mock("@sd/domain-account", () => ({
  useAccountProfile: jest.fn(),
  useUpdateProfile: jest.fn(),
}));

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

const mockedUseAccountProfile = jest.mocked(useAccountProfile) as any;
const mockedUseUpdateProfile = jest.mocked(useUpdateProfile) as any;

const baseProfile = {
  id: "user-1",
  email: "jane@example.com",
  displayName: "Jane Doe",
  role: "user",
  emailVerified: true,
  createdAt: "2026-04-11T00:00:00.000Z",
  updatedAt: "2026-04-11T00:00:00.000Z",
};

describe("AccountProfileScreen", () => {
  beforeEach(() => {
    mockedUseUpdateProfile.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
    });
  });

  it("shows the full-screen loading state only when there is no cached profile yet", async () => {
    mockedUseAccountProfile.mockReturnValue({
      data: undefined,
      isFetching: true,
      isLoading: true,
      error: null,
    });

    await render(<AccountProfileScreen />);

    expect(screen.getByText("Loading profile...")).toBeTruthy();
  });

  it("keeps the edit form mounted and preserves in-progress edits during a background refetch", async () => {
    mockedUseAccountProfile.mockReturnValue({
      data: baseProfile,
      isFetching: false,
      isLoading: false,
      error: null,
    });

    const { rerender } = await render(<AccountProfileScreen />);

    await fireEvent.changeText(screen.getByDisplayValue("Jane Doe"), "Jane Updated");

    expect(screen.getByDisplayValue("Jane Updated")).toBeTruthy();

    // Simulate a background refetch (staleTime elapsed): data stays populated,
    // isFetching flips true again, but isLoading (no cached data) stays false.
    mockedUseAccountProfile.mockReturnValue({
      data: baseProfile,
      isFetching: true,
      isLoading: false,
      error: null,
    });

    await rerender(<AccountProfileScreen />);

    expect(screen.queryByText("Loading profile...")).toBeNull();
    expect(screen.getByDisplayValue("Jane Updated")).toBeTruthy();
  });
});
