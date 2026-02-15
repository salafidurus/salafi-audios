import { jest } from "@jest/globals";
import type { WebPublicEnv } from "@sd/env";

describe("env utils", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("getWebEnv returns and caches the value", async () => {
    const mockEnv = {
      NEXT_PUBLIC_API_URL: "https://api.example.com",
      ASSET_CDN_BASE_URL: "https://cdn.example.com",
    } as WebPublicEnv;

    jest.doMock("@sd/env", () => ({
      getWebPublicEnv: jest.fn().mockReturnValue(mockEnv),
    }));

    const { getWebEnv } = await import("./env");

    const first = getWebEnv();
    const second = getWebEnv();

    expect(first).toBe(mockEnv);
    expect(second).toBe(mockEnv);
  });

  it("tryGetWebEnv returns env when available", async () => {
    const mockEnv = {
      NEXT_PUBLIC_API_URL: "https://api.example.com",
    } as WebPublicEnv;

    jest.doMock("@sd/env", () => ({
      getWebPublicEnv: jest.fn().mockReturnValue(mockEnv),
    }));

    const { tryGetWebEnv } = await import("./env");

    const result = tryGetWebEnv();

    expect(result).toBe(mockEnv);
  });

  it("tryGetWebEnv returns null when getWebPublicEnv throws", async () => {
    jest.doMock("@sd/env", () => ({
      getWebPublicEnv: jest.fn().mockImplementation(() => {
        throw new Error("Missing env");
      }),
    }));

    const { tryGetWebEnv } = await import("./env");

    const result = tryGetWebEnv();

    expect(result).toBeNull();
  });
});
