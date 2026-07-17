import { describe, it, expect, vi, beforeEach } from "bun:test";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsProfileScreen } from "./settings-profile.screen";
import { useAccountProfile } from "@sd/domain-account";
import { authClient } from "@/core/auth/auth-client";

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

const mockDeleteAccountMutate = vi.fn();

vi.mock("@sd/domain-account", () => ({
  useAccountProfile: vi.fn(),
  useUpdateProfile: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
  })),
  useDeleteAccount: vi.fn(() => ({
    mutate: mockDeleteAccountMutate,
    isPending: false,
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

const mockProfile = vi.mocked(useAccountProfile);

const PROFILE = {
  id: "u1",
  email: "user@example.com",
  displayName: "Test User",

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

  it("opens confirm modal when Sign Out is clicked", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockProfile.mockReturnValue({
      data: PROFILE,
      isFetching: false,
    } as ReturnType<typeof useAccountProfile>);
    render(<SettingsProfileScreen />);
    fireEvent.click(screen.getByTestId("sign-out-trigger"));
    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
  });

  it("calls signOut when sign-out is confirmed in modal", () => {
    const mockSignOut = vi.fn().mockResolvedValue(undefined);
    vi.mocked(authClient.signOut).mockImplementation(mockSignOut);

    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockProfile.mockReturnValue({
      data: PROFILE,
      isFetching: false,
    } as ReturnType<typeof useAccountProfile>);
    render(<SettingsProfileScreen />);
    fireEvent.click(screen.getByTestId("sign-out-trigger"));
    fireEvent.click(screen.getByTestId("confirm-modal-confirm"));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("closes modal without signing out when cancel is clicked", () => {
    const mockSignOut = vi.fn().mockResolvedValue(undefined);
    vi.mocked(authClient.signOut).mockImplementation(mockSignOut);

    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockProfile.mockReturnValue({
      data: PROFILE,
      isFetching: false,
    } as ReturnType<typeof useAccountProfile>);
    render(<SettingsProfileScreen />);
    fireEvent.click(screen.getByTestId("sign-out-trigger"));
    fireEvent.click(screen.getByTestId("confirm-modal-cancel"));
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  describe("delete account", () => {
    beforeEach(() => {
      mockDeleteAccountMutate.mockReset();
    });

    it("shows delete account section", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
      mockProfile.mockReturnValue({
        data: PROFILE,
        isFetching: false,
      } as ReturnType<typeof useAccountProfile>);
      render(<SettingsProfileScreen />);
      expect(screen.getByTestId("delete-account-trigger")).toBeInTheDocument();
    });

    it("opens confirm modal when delete account is clicked", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
      mockProfile.mockReturnValue({
        data: PROFILE,
        isFetching: false,
      } as ReturnType<typeof useAccountProfile>);
      render(<SettingsProfileScreen />);
      fireEvent.click(screen.getByTestId("delete-account-trigger"));
      expect(screen.getByTestId("delete-account-modal")).toBeInTheDocument();
    });

    it("has confirm button disabled when input does not match DELETE", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
      mockProfile.mockReturnValue({
        data: PROFILE,
        isFetching: false,
      } as ReturnType<typeof useAccountProfile>);
      render(<SettingsProfileScreen />);
      fireEvent.click(screen.getByTestId("delete-account-trigger"));
      expect(screen.getByTestId("confirm-modal-confirm")).toBeDisabled();
    });

    it("enables confirm when user types DELETE", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
      mockProfile.mockReturnValue({
        data: PROFILE,
        isFetching: false,
      } as ReturnType<typeof useAccountProfile>);
      render(<SettingsProfileScreen />);
      fireEvent.click(screen.getByTestId("delete-account-trigger"));
      const input = screen.getByPlaceholderText('Type "DELETE" to confirm');
      fireEvent.change(input, { target: { value: "DELETE" } });
      expect(screen.getByTestId("confirm-modal-confirm")).not.toBeDisabled();
    });

    it("calls deleteAccount mutate on confirm with matching word", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
      mockProfile.mockReturnValue({
        data: PROFILE,
        isFetching: false,
      } as ReturnType<typeof useAccountProfile>);
      render(<SettingsProfileScreen />);
      fireEvent.click(screen.getByTestId("delete-account-trigger"));
      const input = screen.getByPlaceholderText('Type "DELETE" to confirm');
      fireEvent.change(input, { target: { value: "DELETE" } });
      fireEvent.click(screen.getByTestId("confirm-modal-confirm"));
      expect(mockDeleteAccountMutate).toHaveBeenCalledTimes(1);
    });
  });
});
