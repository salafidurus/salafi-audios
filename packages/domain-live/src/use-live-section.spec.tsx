import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLiveSection } from "./use-live-section";
import { httpClient } from "@sd/core-contracts";

// Mock the httpClient
vi.mock("@sd/core-contracts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@sd/core-contracts")>();
  return {
    ...actual,
    httpClient: vi.fn<(request: { url: string; method: string; params?: any }) => Promise<any>>(),
  };
});

const mockHttpClient = vi.mocked(httpClient);

describe("useLiveSection", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("fetches active sessions initially without a since parameter, then uses fetchedAt for the next poll", async () => {
    // Initial fetch mock
    mockHttpClient.mockResolvedValueOnce({
      sessions: [
        { id: "1", title: "Active Session 1", status: "live", updatedAt: "2026-06-17T12:00:00Z" },
      ],
      deletedIds: [],
      fetchedAt: "2026-06-17T13:00:00Z",
    });

    const { result } = renderHook(
      () => useLiveSection("/live/sessions/active", ["live", "active"], 1000),
      { wrapper },
    );

    // Should start with loading state and empty sessions
    expect(result.current.isLoading).toBe(true);
    expect(result.current.sessions).toEqual([]);

    // Wait for the query to resolve and the merge effect to flush into sessions.
    // sessions is populated by a useEffect that runs a render after isLoading
    // flips, so assert on it with waitFor rather than reading it synchronously.
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await waitFor(() =>
      expect(result.current.sessions).toEqual([
        { id: "1", title: "Active Session 1", status: "live", updatedAt: "2026-06-17T12:00:00Z" },
      ]),
    );

    expect(mockHttpClient).toHaveBeenCalledTimes(1);
    expect(mockHttpClient).toHaveBeenLastCalledWith({
      url: "/live/sessions/active",
      method: "GET",
      params: undefined,
    });

    // Mock next polling response
    mockHttpClient.mockResolvedValueOnce({
      sessions: [
        { id: "2", title: "Active Session 2", status: "live", updatedAt: "2026-06-17T13:05:00Z" },
      ],
      deletedIds: [],
      fetchedAt: "2026-06-17T13:05:00Z",
    });

    // Trigger a refetch
    await act(async () => {
      await queryClient.refetchQueries();
    });

    // Wait for sessions to be updated
    await waitFor(() => expect(result.current.sessions).toHaveLength(2));

    // Sessions should now merge the two results
    expect(result.current.sessions).toEqual([
      { id: "1", title: "Active Session 1", status: "live", updatedAt: "2026-06-17T12:00:00Z" },
      { id: "2", title: "Active Session 2", status: "live", updatedAt: "2026-06-17T13:05:00Z" },
    ]);

    expect(mockHttpClient).toHaveBeenCalledTimes(2);
    expect(mockHttpClient).toHaveBeenLastCalledWith({
      url: "/live/sessions/active",
      method: "GET",
      params: { since: "2026-06-17T13:00:00Z" },
    });
  });
});
