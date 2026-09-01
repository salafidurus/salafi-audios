import { createMongoAbility } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { render, screen } from "@testing-library/react-native";
import React from "react";

import AdminLayout from "../../app/admin/_layout";

jest.mock("@sd/domain-account", () => ({
  useAbility: jest.fn(),
  hasAnyAdminAccess: (ability: any) => ability.rules.length > 0,
}));

jest.mock("@/core/auth/use-auth", () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true, isLoading: false, user: undefined })),
}));

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

jest.mock("react-native-unistyles", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { lightNativeTheme } = require("../../core/styles/theme");
  return {
    StyleSheet: {
      create: (styles: unknown) =>
        typeof styles === "function" ? (styles as any)(lightNativeTheme, {}) : styles,
      configure: () => undefined,
    },
    useUnistyles: jest.fn(() => ({ theme: lightNativeTheme, rt: {} })),
  };
});

jest.mock("expo-router", () => ({
  Stack: Object.assign(({ children }: { children?: React.ReactNode }) => children, {
    Screen: () => null,
  }),
}));

const mockedUseAbility = jest.mocked(useAbility) as any;

describe("AdminLayout", () => {
  it("shows a checking-access message while the ability is loading", async () => {
    mockedUseAbility.mockReturnValue({ ability: createMongoAbility([]), isLoading: true });

    await render(<AdminLayout />);

    expect(screen.getByText("Checking access…")).toBeTruthy();
  });

  it("shows Access Denied when the caller has no admin access", async () => {
    mockedUseAbility.mockReturnValue({ ability: createMongoAbility([]), isLoading: false });

    await render(<AdminLayout />);

    expect(screen.getByText("You do not have admin access.")).toBeTruthy();
  });

  it("renders the admin route stack when the caller has admin access", async () => {
    mockedUseAbility.mockReturnValue({
      ability: createMongoAbility([{ action: "read", subject: "Scholar" }]),
      isLoading: false,
    });

    await render(<AdminLayout />);

    expect(screen.queryByText("You do not have admin access.")).toBeNull();
    expect(screen.queryByText("Checking access…")).toBeNull();
  });
});
