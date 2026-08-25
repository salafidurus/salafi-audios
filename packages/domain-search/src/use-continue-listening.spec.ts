import { HttpError } from "@sd/core-contracts/http";
import { describe, expect, it, vi, beforeEach } from "bun:test";

import { useContinueListening } from "./use-continue-listening";

const useApiQuery = vi.fn();
const httpClient = vi.fn();

vi.mock("@sd/core-contracts", () => {
  const actual = require("@sd/core-contracts");
  return { ...actual, useApiQuery, httpClient };
});

describe("useContinueListening", () => {
  beforeEach(() => {
    useApiQuery.mockReset();
    httpClient.mockReset();
    useApiQuery.mockReturnValue({ data: null });
  });

  it("disables the protected query when Home has no authenticated user", () => {
    useContinueListening({ enabled: false });

    expect(useApiQuery).toHaveBeenCalledWith(expect.anything(), expect.any(Function), {
      enabled: false,
    });
  });

  it("normalizes a defensive unauthorized response to an empty projection", async () => {
    let queryFn: (() => Promise<unknown>) | undefined;
    useApiQuery.mockImplementationOnce((_key: unknown, fn: () => Promise<unknown>) => {
      queryFn = fn;
      return { data: null };
    });
    httpClient.mockRejectedValueOnce(new HttpError(401, "Unauthorized", ""));

    useContinueListening();

    expect(queryFn).toBeDefined();
    await expect(queryFn?.()).resolves.toBeNull();
  });
});
