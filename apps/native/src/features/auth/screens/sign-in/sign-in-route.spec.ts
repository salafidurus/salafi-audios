import SignInRoute from "@/app/(auth)/sign-in";

const mockRouterBack = jest.fn();
const mockRouterCanGoBack = jest.fn(() => true);
const mockRouterReplace = jest.fn();
const mockUseLocalSearchParams = jest.fn(() => ({}) as { from?: string });
const mockUseAuth = jest.fn(() => ({ isAuthenticated: false, isLoading: false, user: null }));
const mockAppleSignIn = jest.fn();
const mockGoogleSignIn = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockRouterBack,
    canGoBack: mockRouterCanGoBack,
    replace: mockRouterReplace,
  }),
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

jest.mock("@/core/auth", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("@/features/auth/hooks/use-native-apple-sign-in", () => ({
  useNativeAppleSignIn: () => ({
    signIn: mockAppleSignIn,
    isLoading: false,
    error: null,
  }),
}));

jest.mock("@/features/auth/hooks/use-native-google-sign-in", () => ({
  useNativeGoogleSignIn: () => ({
    signIn: mockGoogleSignIn,
    isLoading: false,
    error: null,
  }),
}));

jest.mock("@/features/auth/screens/sign-in/sign-in.screen", () => ({
  SignInScreen: (props: any) => {
    props.onSignInWithGoogle();
    props.onSignInWithApple();
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

  it("triggers native Google sign-in when the Google button is pressed", async () => {
    const React = require("react");
    const { render } = require("@testing-library/react-native");

    await render(React.createElement(SignInRoute));

    expect(mockGoogleSignIn).toHaveBeenCalled();
  });

  it("triggers native Apple sign-in when the Apple button is pressed", async () => {
    const React = require("react");
    const { render } = require("@testing-library/react-native");

    await render(React.createElement(SignInRoute));

    expect(mockAppleSignIn).toHaveBeenCalled();
  });

  it("redirects to the from param when sign-in succeeds", async () => {
    mockUseLocalSearchParams.mockReturnValue({ from: "/library" });
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: {} as any });
    const React = require("react");
    const { render } = require("@testing-library/react-native");

    await render(React.createElement(SignInRoute));

    expect(mockRouterReplace).toHaveBeenCalledWith("/library");
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
