import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { SettingsProfileScreen } from "./settings-profile.screen";

const mockUseAuth = vi.fn();

vi.mock("@/core/auth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/core/auth/auth-client", () => ({
  authClient: {
    signOut: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@sd/domain-account", () => ({
  useAccountProfile: vi.fn(),
  useUpdateProfile: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
  })),
}));

vi.mock("@/features/auth", () => ({
  AuthModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div role="dialog">AuthModal</div> : null,
}));

vi.mock("@/shared/components/ScreenView/ScreenView", () => ({
  ScreenView: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="screen-view">{children}</div>
  ),
}));

vi.mock("@/shared/components/SettingsSection/SettingsSection", () => ({
  SettingsSection: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

vi.mock("@/shared/components/SettingsRow/SettingsRow", () => ({
  SettingsRow: ({ label, children }: { label: string; children?: React.ReactNode }) => (
    <div>
      <span>{label}</span>
      {children}
    </div>
  ),
}));

import { useAccountProfile } from "@sd/domain-account";

const mockProfile = vi.mocked(useAccountProfile);

const PROFILE = {
  id: "u1",
  email: "user@example.com",
  displayName: "Test User",
  role: "user",
  emailVerified: true,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

describe("SettingsProfileScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Sign-In CTA when unauthenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    mockProfile.mockReturnValue({ data: undefined, isFetching: false } as ReturnType<
      typeof useAccountProfile
    >);
    render(<SettingsProfileScreen />);
    expect(screen.getByText("Sign in to view your profile and roles.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("renders nothing while auth is loading", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
    mockProfile.mockReturnValue({ data: undefined, isFetching: false } as ReturnType<
      typeof useAccountProfile
    >);
    render(<SettingsProfileScreen />);
    // Only the page wrapper and title should render; no profile content
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.queryByText("Sign in to view your profile")).not.toBeInTheDocument();
  });

  it("renders initials avatar when authenticated without avatarUrl", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockProfile.mockReturnValue({
      data: PROFILE,
      isFetching: false,
    } as ReturnType<typeof useAccountProfile>);
    render(<SettingsProfileScreen />);
    expect(screen.getByText("TU")).toBeInTheDocument(); // "Test User" → "TU"
  });

  it("displays email and display name", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockProfile.mockReturnValue({
      data: PROFILE,
      isFetching: false,
    } as ReturnType<typeof useAccountProfile>);
    render(<SettingsProfileScreen />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getAllByText("user@example.com").length).toBeGreaterThan(0);
  });

  it("renders Sign Out button for authenticated users", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockProfile.mockReturnValue({
      data: PROFILE,
      isFetching: false,
    } as ReturnType<typeof useAccountProfile>);
    render(<SettingsProfileScreen />);
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
  });

  it("renders Account section with Display Name field", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockProfile.mockReturnValue({
      data: PROFILE,
      isFetching: false,
    } as ReturnType<typeof useAccountProfile>);
    render(<SettingsProfileScreen />);
    expect(screen.getByLabelText("Display name")).toBeInTheDocument();
  });
});
