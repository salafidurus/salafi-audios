import { parseNativeRuntimeExtra } from "./runtime-env";

jest.mock("expo-constants", () => ({ default: { expoConfig: null } }));

describe("parseNativeRuntimeExtra", () => {
  it("returns parsed runtime config when apiUrl is valid", () => {
    expect(
      parseNativeRuntimeExtra({
        appEnv: "development",
        apiUrl: "https://api.example.com",
      }),
    ).toEqual({
      appEnv: "development",
      apiUrl: "https://api.example.com",
    });
  });

  it("returns null when runtime config is invalid", () => {
    expect(
      parseNativeRuntimeExtra({
        appEnv: "development",
        apiUrl: "not-a-url",
      }),
    ).toBeNull();
  });
});

describe("getApiBaseUrl", () => {
  const devGlobal = globalThis as unknown as { __DEV__: boolean };
  const originalDev = devGlobal.__DEV__;

  afterEach(() => {
    devGlobal.__DEV__ = originalDev;
  });

  function loadWithConfig(options: { apiUrl?: string; platform: "ios" | "android"; dev: boolean }) {
    jest.resetModules();
    devGlobal.__DEV__ = options.dev;

    jest.doMock("expo-constants", () => ({
      __esModule: true,
      default: { expoConfig: { extra: options.apiUrl ? { apiUrl: options.apiUrl } : {} } },
    }));
    jest.doMock("react-native/Libraries/Utilities/Platform", () => ({
      __esModule: true,
      default: {
        OS: options.platform,
        select: (spec: Record<string, unknown>) => spec[options.platform] ?? spec.default,
      },
    }));

    return require("./runtime-env") as typeof import("./runtime-env");
  }

  it("returns the configured apiUrl unchanged on iOS in dev", () => {
    const { getApiBaseUrl } = loadWithConfig({
      apiUrl: "http://localhost:4000",
      platform: "ios",
      dev: true,
    });
    expect(getApiBaseUrl()).toBe("http://localhost:4000");
  });

  it("rewrites localhost to 10.0.2.2 on Android in dev", () => {
    const { getApiBaseUrl } = loadWithConfig({
      apiUrl: "http://localhost:4000",
      platform: "android",
      dev: true,
    });
    expect(getApiBaseUrl()).toBe("http://10.0.2.2:4000");
  });

  it("rewrites 127.0.0.1 to 10.0.2.2 on Android in dev", () => {
    const { getApiBaseUrl } = loadWithConfig({
      apiUrl: "http://127.0.0.1:4000",
      platform: "android",
      dev: true,
    });
    expect(getApiBaseUrl()).toBe("http://10.0.2.2:4000");
  });

  it("leaves non-loopback hosts unchanged on Android in dev", () => {
    const { getApiBaseUrl } = loadWithConfig({
      apiUrl: "https://api.salafidurus.com",
      platform: "android",
      dev: true,
    });
    expect(getApiBaseUrl()).toBe("https://api.salafidurus.com");
  });

  it("does not rewrite localhost on Android outside of dev", () => {
    const { getApiBaseUrl } = loadWithConfig({
      apiUrl: "http://localhost:4000",
      platform: "android",
      dev: false,
    });
    expect(getApiBaseUrl()).toBe("http://localhost:4000");
  });

  it("returns undefined when apiUrl is not configured", () => {
    const { getApiBaseUrl } = loadWithConfig({ platform: "android", dev: true });
    expect(getApiBaseUrl()).toBeUndefined();
  });
});

describe("getGoogleWebClientId", () => {
  function loadWithExtra(extra: Record<string, unknown>) {
    jest.resetModules();
    jest.doMock("expo-constants", () => ({
      __esModule: true,
      default: { expoConfig: { extra } },
    }));

    return require("./runtime-env") as typeof import("./runtime-env");
  }

  it("returns the configured Google web client id", () => {
    const { getGoogleWebClientId } = loadWithExtra({
      googleWebClientId: "web-client-id.apps.googleusercontent.com",
    });
    expect(getGoogleWebClientId()).toBe("web-client-id.apps.googleusercontent.com");
  });

  it("returns undefined when not configured", () => {
    const { getGoogleWebClientId } = loadWithExtra({});
    expect(getGoogleWebClientId()).toBeUndefined();
  });
});
