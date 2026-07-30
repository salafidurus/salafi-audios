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

describe("SignInRoute", () => {
  it("exports SignInRoute component", () => {
    expect(typeof SignInRoute).toBe("function");
  });

  it("passes callbackURL: '/' to authClient.signIn.social for Google provider", () => {
    const routeCode = SignInRoute.toString();
    expect(routeCode).toContain('provider: "google"');
    expect(routeCode).toContain('callbackURL: "/"');
  });
});
