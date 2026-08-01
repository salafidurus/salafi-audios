import { useAccountProfile } from "@sd/domain-account";
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { useUnistyles } from "react-native-unistyles";

import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";

import { AccountScreen } from "./account.screen";

jest.mock("@sd/domain-account", () => ({
  useAccountProfile: jest.fn(),
}));

jest.mock("lucide-react-native", () => ({
  ChevronRight: "ChevronRight",
  ChevronLeft: "ChevronLeft",
}));

jest.mock("react-native-unistyles", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { lightNativeTheme } = require("../../../core/styles/theme");
  return {
    StyleSheet: {
      create: (styles: unknown) =>
        typeof styles === "function" ? (styles as any)(lightNativeTheme, {}) : styles,
      configure: () => undefined,
    },
    useUnistyles: jest.fn(() => ({ theme: lightNativeTheme, rt: {} })),
  };
});

jest.mock("@/features/admin/hooks/use-admin-permissions", () => ({
  useAdminPermissions: jest.fn(),
}));

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

jest.mock("@/core/auth/use-auth", () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true, isLoading: false, user: undefined })),
}));

jest.mock("@/features/settings/components/language-switch/language-switch", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  return {
    LanguageSwitch: () => React.createElement(Text, null, "LanguageSwitch"),
  };
});

jest.mock("@/features/settings/components/content-language-toggle/content-language-toggle", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  return {
    ContentLanguageToggle: () => React.createElement(Text, null, "ContentLanguageToggle"),
  };
});

const mockedUseAccountProfile = jest.mocked(useAccountProfile) as any;
const mockedUseAdminPermissions = jest.mocked(useAdminPermissions);
const mockedUseUnistyles = jest.mocked(useUnistyles);

const authenticatedProfile = {
  id: "user-1",
  email: "user@example.com",
  displayName: "Test User",
  role: "user" as const,
  emailVerified: true,
  createdAt: "2026-04-11T00:00:00.000Z",
  updatedAt: "2026-04-11T00:00:00.000Z",
};

describe("AccountScreen", () => {
  beforeEach(() => {
    mockedUseAccountProfile.mockReturnValue({
      data: undefined,
      isFetching: false,
      error: null,
    });
    mockedUseAdminPermissions.mockReturnValue({
      permissions: [],
      hasAnyPermission: false,
      hasPermission: jest.fn(() => false),
      isLoading: false,
    });
    const { lightNativeTheme } = require("../../../core/styles/theme");
    mockedUseUnistyles.mockReturnValue({ theme: lightNativeTheme, rt: {} } as any);
  });

  it("renders ChevronRight disclosure icons when the layout direction is ltr", async () => {
    mockedUseAccountProfile.mockReturnValue({
      data: authenticatedProfile,
      isFetching: false,
      error: null,
    });

    await render(<AccountScreen />);

    const icons = screen.getAllByTestId("account-disclosure-icon");
    expect(icons.length).toBeGreaterThan(0);
    for (const icon of icons) {
      expect((icon.children[0] as { type: string }).type).toBe("ChevronRight");
    }
  });

  it("renders ChevronLeft disclosure icons when the layout direction is rtl", async () => {
    mockedUseAccountProfile.mockReturnValue({
      data: authenticatedProfile,
      isFetching: false,
      error: null,
    });
    const { lightNativeTheme } = require("../../../core/styles/theme");
    mockedUseUnistyles.mockReturnValue({
      theme: { ...lightNativeTheme, direction: "rtl" },
      rt: {},
    } as any);

    await render(<AccountScreen />);

    const icons = screen.getAllByTestId("account-disclosure-icon");
    expect(icons.length).toBeGreaterThan(0);
    for (const icon of icons) {
      expect((icon.children[0] as { type: string }).type).toBe("ChevronLeft");
    }
  });

  it("renders sign-in prompt and legal when unauthenticated (no profile)", async () => {
    mockedUseAccountProfile.mockReturnValue({
      data: undefined,
      isFetching: false,
      error: null,
    });

    await render(<AccountScreen />);

    expect(screen.getByText("Sign in to access your profile")).toBeTruthy();
    expect(screen.getByText("Legal")).toBeTruthy();
    expect(screen.getByText("Language")).toBeTruthy();
    expect(screen.queryByText("Edit Profile")).toBeNull();
    expect(screen.queryByText("Sign Out")).toBeNull();
  }, 15000);

  it("renders a loading state while the account query is fetching", async () => {
    mockedUseAccountProfile.mockReturnValue({
      data: undefined,
      isFetching: true,
      error: null,
    });

    await render(<AccountScreen />);

    expect(screen.getByText("Loading account…")).toBeTruthy();
  });

  it("renders profile details and language controls", async () => {
    mockedUseAccountProfile.mockReturnValue({
      data: {
        id: "user-1",
        email: "user@example.com",
        displayName: "Test User",
        role: "user",
        emailVerified: true,
        createdAt: "2026-04-11T00:00:00.000Z",
        updatedAt: "2026-04-11T00:00:00.000Z",
      },
      isFetching: false,
      error: null,
    });

    await render(<AccountScreen />);

    expect(screen.getByText("Test User")).toBeTruthy();
    expect(screen.getByText("user@example.com")).toBeTruthy();
    expect(screen.getByText("Edit Profile")).toBeTruthy();
    expect(screen.getByText("Legal")).toBeTruthy();
    expect(screen.getByText("Sign Out")).toBeTruthy();
    expect(screen.getByText("Language")).toBeTruthy();
    expect(screen.getByText("LanguageSwitch")).toBeTruthy();
  }, 15000);

  it("renders Admin card when user has admin permissions", async () => {
    mockedUseAccountProfile.mockReturnValue({
      data: {
        id: "user-1",
        email: "admin@example.com",
        displayName: "Admin User",
        role: "admin",
        emailVerified: true,
        createdAt: "2026-04-11T00:00:00.000Z",
        updatedAt: "2026-04-11T00:00:00.000Z",
      },
      isFetching: false,
      error: null,
    });

    mockedUseAdminPermissions.mockReturnValue({
      permissions: [
        {
          permission: "USERS_VIEW",
        },
      ],
      hasAnyPermission: true,
      hasPermission: jest.fn((perm) => perm === "USERS_VIEW"),
      isLoading: false,
    });

    await render(<AccountScreen />);

    expect(screen.getByText("Admin")).toBeTruthy();
  });
});
