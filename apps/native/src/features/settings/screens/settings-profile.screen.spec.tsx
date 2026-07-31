import { useAccountProfile, useDeleteAccount, useUpdateProfile } from "@sd/domain-account";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { SettingsProfileScreen } from "./settings-profile.screen";

jest.mock("@sd/domain-account", () => ({
  useAccountProfile: jest.fn(),
  useUpdateProfile: jest.fn(),
  useDeleteAccount: jest.fn(),
}));

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

jest.mock("@/core/auth/use-auth", () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true, isLoading: false, user: undefined })),
}));

const mockedUseAccountProfile = jest.mocked(useAccountProfile) as any;
const mockedUseUpdateProfile = jest.mocked(useUpdateProfile) as any;
const mockedUseDeleteAccount = jest.mocked(useDeleteAccount) as any;

const baseProfile = {
  id: "user-1",
  email: "jane@example.com",
  displayName: "Jane Doe",
  role: "user",
  emailVerified: true,
  createdAt: "2026-04-11T00:00:00.000Z",
  updatedAt: "2026-04-11T00:00:00.000Z",
};

describe("SettingsProfileScreen", () => {
  beforeEach(() => {
    mockedUseUpdateProfile.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
    });
    mockedUseDeleteAccount.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  it("syncs the display name field once the profile query resolves after an initial loading state", async () => {
    mockedUseAccountProfile.mockReturnValue({ data: undefined, isFetching: true, error: null });

    const { rerender } = await render(<SettingsProfileScreen />);

    expect(screen.getByText("Loading profile…")).toBeTruthy();

    mockedUseAccountProfile.mockReturnValue({
      data: baseProfile,
      isFetching: false,
      error: null,
    });

    await rerender(<SettingsProfileScreen />);

    expect(screen.getByDisplayValue("Jane Doe")).toBeTruthy();
  });

  it("does not clobber an in-progress edit when the profile query refetches in the background", async () => {
    mockedUseAccountProfile.mockReturnValue({
      data: baseProfile,
      isFetching: false,
      error: null,
    });

    const { rerender } = await render(<SettingsProfileScreen />);

    await fireEvent.press(screen.getByText("Edit"));
    await fireEvent.changeText(screen.getByDisplayValue("Jane Doe"), "Jane Updated");

    expect(screen.getByDisplayValue("Jane Updated")).toBeTruthy();

    // Simulate a background refetch resolving with a new data object reference
    // but the same underlying displayName.
    mockedUseAccountProfile.mockReturnValue({
      data: { ...baseProfile },
      isFetching: false,
      error: null,
    });

    await rerender(<SettingsProfileScreen />);

    expect(screen.getByDisplayValue("Jane Updated")).toBeTruthy();
  });

  it("opens a themed confirm dialog and calls onSignOut when confirmed", async () => {
    mockedUseAccountProfile.mockReturnValue({
      data: baseProfile,
      isFetching: false,
      error: null,
    });
    const onSignOut = jest.fn();

    await render(<SettingsProfileScreen onSignOut={onSignOut} />);

    expect(screen.queryByText("Are you sure you want to sign out?")).toBeNull();

    await fireEvent.press(screen.getByText("Sign Out"));

    expect(screen.getByText("Sign Out?")).toBeTruthy();
    expect(screen.getByText("Are you sure you want to sign out?")).toBeTruthy();

    const confirmButtons = screen.getAllByText("Sign Out");
    await fireEvent.press(confirmButtons[confirmButtons.length - 1]!);

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("dismisses the confirm dialog without calling onSignOut when cancelled", async () => {
    mockedUseAccountProfile.mockReturnValue({
      data: baseProfile,
      isFetching: false,
      error: null,
    });
    const onSignOut = jest.fn();

    await render(<SettingsProfileScreen onSignOut={onSignOut} />);

    await fireEvent.press(screen.getByText("Sign Out"));
    expect(screen.getByText("Sign Out?")).toBeTruthy();

    await fireEvent.press(screen.getByText("Cancel"));

    expect(screen.queryByText("Sign Out?")).toBeNull();
    expect(onSignOut).not.toHaveBeenCalled();
  });

  it("opens a themed confirm dialog and deletes the account when confirmed", async () => {
    mockedUseAccountProfile.mockReturnValue({
      data: baseProfile,
      isFetching: false,
      error: null,
    });
    const deleteAccount = jest.fn();
    mockedUseDeleteAccount.mockReturnValue({ mutate: deleteAccount, isPending: false });
    const onSignOut = jest.fn();

    await render(<SettingsProfileScreen onSignOut={onSignOut} />);

    expect(
      screen.queryByText(
        "This action is permanent and cannot be undone. All your data will be deleted.",
      ),
    ).toBeNull();

    await fireEvent.press(screen.getByText("Delete Account"));

    expect(
      screen.getByText(
        "This action is permanent and cannot be undone. All your data will be deleted.",
      ),
    ).toBeTruthy();

    const deleteButtons = screen.getAllByText("Delete Account");
    await fireEvent.press(deleteButtons[deleteButtons.length - 1]!);

    expect(deleteAccount).toHaveBeenCalledTimes(1);
    const [, options] = deleteAccount.mock.calls[0]!;
    options.onSuccess();
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("dismisses the delete-account dialog without deleting when cancelled", async () => {
    mockedUseAccountProfile.mockReturnValue({
      data: baseProfile,
      isFetching: false,
      error: null,
    });
    const deleteAccount = jest.fn();
    mockedUseDeleteAccount.mockReturnValue({ mutate: deleteAccount, isPending: false });

    await render(<SettingsProfileScreen />);

    await fireEvent.press(screen.getByText("Delete Account"));
    expect(
      screen.getByText(
        "This action is permanent and cannot be undone. All your data will be deleted.",
      ),
    ).toBeTruthy();

    await fireEvent.press(screen.getByText("Cancel"));

    expect(
      screen.queryByText(
        "This action is permanent and cannot be undone. All your data will be deleted.",
      ),
    ).toBeNull();
    expect(deleteAccount).not.toHaveBeenCalled();
  });
});
