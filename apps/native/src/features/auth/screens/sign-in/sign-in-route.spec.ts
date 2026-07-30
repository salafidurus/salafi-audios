import SignInRoute from "@/app/(auth)/sign-in";

const mockRouterBack = jest.fn();
const mockRouterCanGoBack = jest.fn(() => true);
const mockRouterReplace = jest.fn();
const mockUseLocalSearchParams = jest.fn(() => ({}) as { from?: string });
const mockUseAuth = jest.fn(() => ({ isAuthenticated: false, isLoading: false, user: null }));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockRouterBack,
    canGoBack: mockRouterCanGoBack,
    replace: mockRouterReplace,
  }),
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

jest.mock("expo-web-browser", () => ({
  dismissAuthSession: jest.fn(),
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock("@/core/auth", () => ({
  useAuth: () => mockUseAuth(),
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
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouterCanGoBack.mockReturnValue(true);
    mockUseLocalSearchParams.mockReturnValue({});
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false, user: null });
  });

  it("exports SignInRoute component", () => {
    expect(typeof SignInRoute).toBe("function");
  });

  it("calls authClient.signIn.social with callbackURL: '/' when there is no from param", async () => {
    const React = require("react");
    const { authClient } = require("@/core/auth");
    const { render } = require("@testing-library/react-native");

    await render(React.createElement(SignInRoute));

    expect(authClient.signIn.social).toHaveBeenCalledWith(
      { provider: "google", callbackURL: "/" },
      expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
    );
  });

  it("uses the from param as callbackURL when present", async () => {
    mockUseLocalSearchParams.mockReturnValue({ from: "/library/saved" });
    const React = require("react");
    const { authClient } = require("@/core/auth");
    const { render } = require("@testing-library/react-native");

    await render(React.createElement(SignInRoute));

    expect(authClient.signIn.social).toHaveBeenCalledWith(
      { provider: "google", callbackURL: "/library/saved" },
      expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
    );
  });

  it("redirects to the from param when sign-in succeeds", async () => {
    mockUseLocalSearchParams.mockReturnValue({ from: "/library/saved" });
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: {} as any });
    const React = require("react");
    const { render } = require("@testing-library/react-native");

    await render(React.createElement(SignInRoute));

    expect(mockRouterReplace).toHaveBeenCalledWith("/library/saved");
  });

  it("falls back to router.back() when authenticated with no from param", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: {} as any });
    const React = require("react");
    const { render } = require("@testing-library/react-native");

    await render(React.createElement(SignInRoute));

    expect(mockRouterBack).toHaveBeenCalled();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
});
