const mockRefetch = jest.fn().mockResolvedValue(undefined);
const mockSessionAtomGet = jest.fn(() => ({ refetch: mockRefetch }));

jest.mock("better-auth/react", () => ({
  createAuthClient: jest.fn(() => ({
    $store: { atoms: { session: { get: mockSessionAtomGet } } },
    $Infer: { Session: {} },
  })),
}));

jest.mock("@better-auth/expo/client", () => ({
  expoClient: jest.fn(() => ({})),
}));

jest.mock("expo-constants", () => ({ default: { expoConfig: { scheme: "test-scheme" } } }));

jest.mock("expo-secure-store", () => ({}));

// Required (not statically imported) so it resolves after the mock consts
// above are assigned - a static import would be hoisted above them.
const { refreshSession } = require("./auth-client") as typeof import("./auth-client");

describe("refreshSession", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("triggers the session atom's own refetch", async () => {
    await refreshSession();

    expect(mockSessionAtomGet).toHaveBeenCalled();
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("does not throw when the session atom is unavailable", async () => {
    mockSessionAtomGet.mockReturnValueOnce(
      undefined as unknown as ReturnType<typeof mockSessionAtomGet>,
    );

    await expect(refreshSession()).resolves.toBeUndefined();
  });
});
