jest.mock("expo-constants", () => ({ default: { expoConfig: null } }));

import { parseNativeRuntimeExtra } from "./runtime-env";

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
