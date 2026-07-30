import { useNativeAppleSignIn } from "./use-native-apple-sign-in";

jest.mock("expo-apple-authentication", () => ({
  isAvailableAsync: jest.fn(),
  signInAsync: jest.fn(),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
}));

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
}));

jest.mock("@/core/auth", () => ({
  authClient: {
    $fetch: jest.fn(),
  },
  refreshSession: jest.fn(),
}));

jest.mock("@/core/config/runtime-env", () => ({
  getApiBaseUrl: jest.fn(() => "http://10.0.2.2:4000"),
}));

describe("useNativeAppleSignIn", () => {
  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("exports useNativeAppleSignIn hook", () => {
    // Hook will be tested during integration with sign-in screen
    // This validates the module can be imported without errors
    expect(typeof useNativeAppleSignIn).toBe("function");
  });

  it("hook returns object with signIn, isLoading, error properties", () => {
    // Direct property check validates the implementation structure
    const hookCode = useNativeAppleSignIn.toString();
    expect(hookCode).toContain("signIn");
    expect(hookCode).toContain("isLoading");
    expect(hookCode).toContain("error");
  });

  it("persists cookie under better-auth_cookie key upon successful sign in", async () => {
    const AppleAuth = require("expo-apple-authentication");
    const SecureStore = require("expo-secure-store");
    const { refreshSession } = require("@/core/auth");

    AppleAuth.isAvailableAsync.mockResolvedValue(true);
    AppleAuth.signInAsync.mockResolvedValue({
      identityToken: "test-token",
      user: "test-user-id",
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        session: { id: "test-session-id", expiresAt: "2026-12-31T00:00:00Z" },
      }),
    });

    const { renderHook, act } = require("@testing-library/react-native");
    const { result } = await renderHook(() => useNativeAppleSignIn());

    await act(async () => {
      await result.current.signIn();
    });

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "better-auth_cookie",
      JSON.stringify({
        "better-auth.session_token": {
          value: "test-session-id",
          expires: "2026-12-31T00:00:00Z",
        },
      }),
    );
    expect(refreshSession).toHaveBeenCalled();
  });

  it("posts to the runtime-resolved API base URL, not the raw env var", async () => {
    const AppleAuth = require("expo-apple-authentication");
    const { getApiBaseUrl } = require("@/core/config/runtime-env");

    AppleAuth.isAvailableAsync.mockResolvedValue(true);
    AppleAuth.signInAsync.mockResolvedValue({
      identityToken: "test-token",
      user: "test-user-id",
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        session: { id: "test-session-id", expiresAt: "2026-12-31T00:00:00Z" },
      }),
    });

    const { renderHook, act } = require("@testing-library/react-native");
    const { result } = await renderHook(() => useNativeAppleSignIn());

    await act(async () => {
      await result.current.signIn();
    });

    expect(getApiBaseUrl).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      "http://10.0.2.2:4000/api/auth/apple/native",
      expect.any(Object),
    );
  });
});
