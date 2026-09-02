import { createMongoAbility } from "@casl/ability";
import { render } from "@testing-library/react-native";
import React from "react";

import {
  SettingsAccountActions,
  SettingsSupportLegalActions,
} from "./settings-account-actions.screen";

jest.mock("@sd/domain-account", () => ({
  useAccountProfile: jest.fn(),
  useAbility: jest.fn(),
  hasAnyAdminAccess: (ability: any) => ability.rules.length > 0,
}));

jest.mock("@/core/auth/use-auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

jest.mock("@/shared/ui", () => {
  const { Text, View } = require("react-native");
  return {
    NativeIcon: () => null,
    NativeText: ({ children }: { children?: React.ReactNode }) => <Text>{children}</Text>,
    NativeScreenHost: ({ children }: { children?: React.ReactNode }) => <View>{children}</View>,
  };
});

jest.mock("@/shared/components/user-avatar/user-avatar", () => ({
  UserAvatar: ({ testID }: { testID?: string }) => {
    const { View } = require("react-native");
    return <View testID={testID} />;
  },
}));

jest.mock("../components/SettingsRow/SettingsRow", () => {
  const { Pressable, Text, View } = require("react-native");
  return {
    SettingsRow: ({ label, sublabel, onPress, children }: any) => (
      <Pressable onPress={onPress} accessibilityLabel={label}>
        <Text>{label}</Text>
        <Text>{sublabel}</Text>
        <View>{children}</View>
      </Pressable>
    ),
  };
});

const { useAccountProfile, useAbility } = require("@sd/domain-account");
const { useAuth } = require("@/core/auth/use-auth");

describe("SettingsAccountActions", () => {
  beforeEach(() => {
    useAbility.mockReturnValue({ ability: createMongoAbility([]), isLoading: false });
    useAccountProfile.mockReturnValue({ data: undefined, isFetching: false });
  });

  it("exposes sign-in profile action to anonymous listeners", async () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });

    const { getByText, getByTestId, queryByText } = await render(<SettingsAccountActions />);

    expect(getByText("Guest")).toBeTruthy();
    expect(getByText("Click to sign in")).toBeTruthy();
    expect(getByText("Profile")).toBeTruthy();
    expect(getByTestId("settings-account-avatar")).toBeTruthy();
    expect(queryByText("Admin")).toBeNull();
    expect(queryByText("Sign Out")).toBeNull();
  });

  it("keeps Support and Legal as the final secondary destinations", async () => {
    const onNavigateToTerms = jest.fn();
    const onNavigateToPrivacy = jest.fn();
    const onNavigateToSupport = jest.fn();

    useAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });

    const { getAllByText } = await render(
      <SettingsSupportLegalActions
        onNavigateToTerms={onNavigateToTerms}
        onNavigateToPrivacy={onNavigateToPrivacy}
        onNavigateToSupport={onNavigateToSupport}
      />,
    );

    expect(getAllByText("Support").length).toBe(1);
    expect(getAllByText("Contact support").length).toBe(1);
    expect(getAllByText("Legal").length).toBe(1);
    expect(getAllByText("Terms and Conditions").length).toBe(1);
    expect(getAllByText("Privacy Policy").length).toBe(1);
  });

  it("shows profile and Admin only when the backend-derived ability permits it", async () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    useAccountProfile.mockReturnValue({
      data: { displayName: "Test User", email: "user@example.com" },
      isFetching: false,
    });
    useAbility.mockReturnValue({
      ability: createMongoAbility([{ action: "read", subject: "User" }]),
      isLoading: false,
    });

    const { getByText, getByTestId } = await render(<SettingsAccountActions />);

    expect(getByText("Test User")).toBeTruthy();
    expect(getByTestId("settings-account-avatar")).toBeTruthy();
    expect(getByText("Profile")).toBeTruthy();
    expect(getByText("Admin")).toBeTruthy();
  });
});
