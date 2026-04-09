import { render } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../core/auth/use-auth";
import AccountLayout from "./layout";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock("../../../core/auth/use-auth", () => ({
  useAuth: jest.fn(),
}));

describe("AccountLayout", () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
      push: mockPush,
    });
  });

  it("redirects to sign-in when unauthenticated and accessing /account", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    const { usePathname } = require("next/navigation");
    usePathname.mockReturnValue("/account");

    render(
      <AccountLayout>
        <div>children</div>
      </AccountLayout>,
    );

    expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining("/sign-in"));
  });

  it("allows access to /account/legal without authentication (public override)", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    const { usePathname } = require("next/navigation");
    usePathname.mockReturnValue("/account/legal");

    const { container } = render(
      <AccountLayout>
        <div>legal content</div>
      </AccountLayout>,
    );

    expect(mockReplace).not.toHaveBeenCalled();
    expect(container.textContent).toContain("legal content");
  });

  it("allows authenticated users to access /account", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: "user123" },
    });

    const { usePathname } = require("next/navigation");
    usePathname.mockReturnValue("/account");

    const { container } = render(
      <AccountLayout>
        <div>account content</div>
      </AccountLayout>,
    );

    expect(mockReplace).not.toHaveBeenCalled();
    expect(container.textContent).toContain("account content");
  });

  it("returns null while loading to avoid hydration mismatch", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    const { usePathname } = require("next/navigation");
    usePathname.mockReturnValue("/account");

    const { container } = render(
      <AccountLayout>
        <div>account content</div>
      </AccountLayout>,
    );

    expect(container.firstChild).toBeNull();
  });
});
