import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "bun:test";
import React from "react";

import { authClient } from "@/core/auth";

import { SignInResponsiveScreen } from "./sign-in.screen";

vi.mock("@/core/auth", () => ({
  authClient: {
    signIn: { social: vi.fn() },
  },
}));

vi.mock("@/features/auth/components/provider-button", () => ({
  AuthProviderButton: ({ provider, onClick }: { provider: string; onClick: () => void }) => (
    <button type="button" onClick={onClick}>
      Continue with {provider}
    </button>
  ),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("SignInResponsiveScreen", () => {
  it("preserves the requested destination in the social callback URL", () => {
    render(<SignInResponsiveScreen redirectTo="/library?tab=completed" />);

    fireEvent.click(screen.getByRole("button", { name: "Continue with google" }));

    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "http://localhost:3001/auth/callback?redirect=%2Flibrary%3Ftab%3Dcompleted",
    });
  });
});
