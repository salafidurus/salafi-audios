import { initApiClient, endpoints, queryKeys } from "@sd/core-contracts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "bun:test";
import React from "react";

import { useToggleSaved } from "./library.api";

// Register happy-dom globals before tests run — this package has no
// app-level test harness (unlike apps/web), so this hook test sets it up inline.
// Guarded because bun runs every *.spec.ts* file in this package in one process,
// and another spec file may have already registered it.
const { GlobalRegistrator } = require("@happy-dom/global-registrator");

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another spec file in this run.
}

// Stubs global fetch rather than mocking "@sd/core-contracts" itself, since
// bun runs every spec file in this package in one process — mocking the
// whole module would clobber the real endpoints/queryKeys sibling specs need.
const originalFetch = global.fetch;
let fetchMock: ReturnType<typeof vi.fn>;

function renderWithQueryClient() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
  const { result } = renderHook(() => useToggleSaved(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
  return { result, invalidateQueries };
}

describe("useToggleSaved", () => {
  beforeEach(() => {
    initApiClient({ baseUrl: "http://localhost" });
    fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("POSTs to the save endpoint when saved is true", async () => {
    const { result } = renderWithQueryClient();

    result.current.mutate({ listingId: "l1", saved: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const [url, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`http://localhost${endpoints.library.saveListing("l1")}`);
    expect(requestInit.method).toBe("POST");
  });

  it("DELETEs from the save endpoint when saved is false", async () => {
    const { result } = renderWithQueryClient();

    result.current.mutate({ listingId: "l1", saved: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(requestInit.method).toBe("DELETE");
  });

  it("invalidates the saved library queries on success", async () => {
    const { result, invalidateQueries } = renderWithQueryClient();

    result.current.mutate({ listingId: "l1", saved: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.library.saved.all() });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.library.saved.infinite(),
    });
  });
});
