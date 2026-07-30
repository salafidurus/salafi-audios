import { useNativeGoogleSignIn } from "./use-native-google-sign-in";

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
  },
}));

jest.mock("@/core/auth", () => ({
  authClient: {
    signIn: {
      social: jest.fn(),
    },
  },
  refreshSession: jest.fn(),
}));

jest.mock("@/core/config/runtime-env", () => ({
  getGoogleWebClientId: jest.fn(() => "web-client-id.apps.googleusercontent.com"),
}));

describe("useNativeGoogleSignIn", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("exports useNativeGoogleSignIn hook", () => {
    expect(typeof useNativeGoogleSignIn).toBe("function");
  });

  it("configures with the runtime-resolved web client id and exchanges the idToken", async () => {
    const { GoogleSignin } = require("@react-native-google-signin/google-signin");
    const { authClient } = require("@/core/auth");

    GoogleSignin.hasPlayServices.mockResolvedValue(true);
    GoogleSignin.signIn.mockResolvedValue({
      type: "success",
      data: { idToken: "test-id-token" },
    });
    authClient.signIn.social.mockResolvedValue({ error: null });

    const { renderHook, act } = require("@testing-library/react-native");
    const { result } = await renderHook(() => useNativeGoogleSignIn());

    await act(async () => {
      await result.current.signIn();
    });

    expect(GoogleSignin.configure).toHaveBeenCalledWith({
      webClientId: "web-client-id.apps.googleusercontent.com",
    });
    expect(GoogleSignin.hasPlayServices).toHaveBeenCalledWith({
      showPlayServicesUpdateDialog: true,
    });
    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: "google",
      idToken: { token: "test-id-token" },
    });
    expect(require("@/core/auth").refreshSession).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("sets an error when no idToken is returned", async () => {
    const { GoogleSignin } = require("@react-native-google-signin/google-signin");
    const { authClient } = require("@/core/auth");

    GoogleSignin.hasPlayServices.mockResolvedValue(true);
    GoogleSignin.signIn.mockResolvedValue({
      type: "success",
      data: { idToken: null },
    });

    const { renderHook, act } = require("@testing-library/react-native");
    const { result } = await renderHook(() => useNativeGoogleSignIn());

    await act(async () => {
      await result.current.signIn();
    });

    expect(authClient.signIn.social).not.toHaveBeenCalled();
    expect(result.current.error).toBe("No ID token returned from Google");
    expect(result.current.isLoading).toBe(false);
  });

  it("does not set an error when the user cancels the picker", async () => {
    const { GoogleSignin } = require("@react-native-google-signin/google-signin");
    const { authClient } = require("@/core/auth");

    GoogleSignin.hasPlayServices.mockResolvedValue(true);
    GoogleSignin.signIn.mockResolvedValue({ type: "cancelled", data: null });

    const { renderHook, act } = require("@testing-library/react-native");
    const { result } = await renderHook(() => useNativeGoogleSignIn());

    await act(async () => {
      await result.current.signIn();
    });

    expect(authClient.signIn.social).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("sets an error when the backend rejects the idToken", async () => {
    const { GoogleSignin } = require("@react-native-google-signin/google-signin");
    const { authClient } = require("@/core/auth");

    GoogleSignin.hasPlayServices.mockResolvedValue(true);
    GoogleSignin.signIn.mockResolvedValue({
      type: "success",
      data: { idToken: "test-id-token" },
    });
    authClient.signIn.social.mockResolvedValue({ error: { message: "Invalid audience" } });

    const { renderHook, act } = require("@testing-library/react-native");
    const { result } = await renderHook(() => useNativeGoogleSignIn());

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.error).toBe("Invalid audience");
    expect(result.current.isLoading).toBe(false);
  });
});
