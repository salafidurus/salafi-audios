import { render, screen } from "@testing-library/react-native";
import React from "react";

import { SignInScreen } from "./sign-in.screen";

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

describe("SignInScreen", () => {
  const noop = () => undefined;

  it("exports SignInScreen component", () => {
    expect(typeof SignInScreen).toBe("function");
  });

  it("renders the Google button label when idle", async () => {
    await render(
      React.createElement(SignInScreen, {
        onSignInWithGoogle: noop,
        onSignInWithApple: noop,
      }),
    );

    expect(screen.getByTestId("sign-in-host")).toBeTruthy();
    expect(screen.getByText("Continue with Google")).toBeTruthy();
  });

  it("shows a signing-in label instead of the button text while Google sign-in is loading", async () => {
    await render(
      React.createElement(SignInScreen, {
        onSignInWithGoogle: noop,
        onSignInWithApple: noop,
        googleLoading: true,
      }),
    );

    expect(screen.queryByText("Continue with Google")).toBeNull();
    expect(screen.getByText("Signing in…")).toBeTruthy();
  });

  it("renders the Google sign-in error message when present", async () => {
    await render(
      React.createElement(SignInScreen, {
        onSignInWithGoogle: noop,
        onSignInWithApple: noop,
        googleError: "No ID token returned from Google",
      }),
    );

    expect(screen.getByText("No ID token returned from Google")).toBeTruthy();
  });

  it("does not render an error message when there is none", async () => {
    await render(
      React.createElement(SignInScreen, {
        onSignInWithGoogle: noop,
        onSignInWithApple: noop,
      }),
    );

    expect(screen.queryByTestId("sign-in-error")).toBeNull();
  });
});
