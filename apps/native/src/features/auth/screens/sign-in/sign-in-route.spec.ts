import SignInRoute from "@/app/(auth)/sign-in";

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    replace: jest.fn(),
  }),
}));

jest.mock("expo-web-browser", () => ({
  dismissAuthSession: jest.fn(),
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock("@/core/auth", () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: false, isLoading: false, user: null })),
  authClient: {
    signIn: {
      social: jest.fn(),
    },
  },
}));

jest.mock("@/features/auth/hooks/use-native-apple-sign-in", () => ({
  useNativeAppleSignIn: () => ({
    signIn: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));

jest.mock("@/features/auth/screens/sign-in/sign-in.screen", () => ({
  SignInScreen: (props: any) => {
    props.onSignInWithGoogle();
    return null;
  },
}));

describe("SignInRoute", () => {
  it("exports SignInRoute component", () => {
    expect(typeof SignInRoute).toBe("function");
  });

  it("calls authClient.signIn.social with provider: 'google' and callbackURL: '/' on Google sign in", async () => {
    const React = require("react");
    const { authClient } = require("@/core/auth");
    const { render } = require("@testing-library/react-native");

    await render(React.createElement(SignInRoute));

    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/",
    });
  });
});
