import { configureApiClient, httpClient } from "./http";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Build a minimal Response-like object for fetch mocking. */
function jsonResponse(body: unknown, status = 200, statusText = "OK"): Response {
  const headers = new Headers({ "content-type": "application/json" });
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers,
    text: () => Promise.resolve(JSON.stringify(body)),
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

function textResponse(body: string, status = 200): Response {
  const headers = new Headers({ "content-type": "text/plain" });
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "OK",
    headers,
    text: () => Promise.resolve(body),
    json: () => Promise.reject(new Error("not json")),
  } as unknown as Response;
}

/* ------------------------------------------------------------------ */
/*  Shared spy                                                        */
/* ------------------------------------------------------------------ */
let fetchSpy: jest.SpiedFunction<typeof global.fetch>;

beforeEach(() => {
  fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ ok: true }));
});

afterEach(() => {
  fetchSpy.mockRestore();
});

/* ------------------------------------------------------------------ */
/*  Tests                                                             */
/* ------------------------------------------------------------------ */

describe("httpClient – unconfigured", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("throws when called before configureApiClient", async () => {
    // Use isolated module loading so config is reset to null for this test only.
    let fresh: typeof httpClient;
    await jest.isolateModulesAsync(async () => {
      const httpModule = await import("./http");
      fresh = httpModule.httpClient;
    });
    await expect(fresh!({ url: "/test", method: "GET" })).rejects.toThrow(/not configured/i);
  });
});

describe("httpClient – configured", () => {
  const BASE = "https://api.example.com";

  beforeEach(() => {
    configureApiClient({ baseUrl: BASE });
  });

  /* ---------- URL construction ---------- */

  it("constructs the correct full URL from baseUrl + url", async () => {
    await httpClient({ url: "/items", method: "GET" });
    const calledUrl = fetchSpy.mock.calls[0][0] as string;
    expect(calledUrl).toBe(`${BASE}/items`);
  });

  it("appends scalar query params", async () => {
    await httpClient({
      url: "/items",
      method: "GET",
      params: { page: 1, search: "test" },
    });
    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get("page")).toBe("1");
    expect(calledUrl.searchParams.get("search")).toBe("test");
  });

  it("appends array query params", async () => {
    await httpClient({
      url: "/items",
      method: "GET",
      params: { ids: ["a", "b", "c"] },
    });
    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.getAll("ids")).toEqual(["a", "b", "c"]);
  });

  it("omits undefined and null params", async () => {
    await httpClient({
      url: "/items",
      method: "GET",
      params: { a: undefined, b: null, c: "keep" },
    });
    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.has("a")).toBe(false);
    expect(calledUrl.searchParams.has("b")).toBe(false);
    expect(calledUrl.searchParams.get("c")).toBe("keep");
  });

  it("omits null/undefined items inside array params", async () => {
    await httpClient({
      url: "/items",
      method: "GET",
      params: { ids: [null, "x", undefined, "y"] },
    });
    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.getAll("ids")).toEqual(["x", "y"]);
  });

  /* ---------- Headers ---------- */

  it("sets Content-Type header to application/json", async () => {
    await httpClient({ url: "/items", method: "GET" });
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });

  it("injects Authorization header when getAccessToken returns a string", async () => {
    configureApiClient({
      baseUrl: BASE,
      getAccessToken: () => "tok_123",
    });
    await httpClient({ url: "/secure", method: "GET" });
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)["Authorization"]).toBe("Bearer tok_123");
  });

  it("omits Authorization header when getAccessToken returns undefined", async () => {
    configureApiClient({
      baseUrl: BASE,
      getAccessToken: () => undefined,
    });
    await httpClient({ url: "/public", method: "GET" });
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)["Authorization"]).toBeUndefined();
  });

  it("omits Authorization header when getAccessToken returns null", async () => {
    configureApiClient({
      baseUrl: BASE,
      getAccessToken: () => null,
    });
    await httpClient({ url: "/public", method: "GET" });
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)["Authorization"]).toBeUndefined();
  });

  it("omits Authorization header when getAccessToken is not provided", async () => {
    configureApiClient({ baseUrl: BASE });
    await httpClient({ url: "/public", method: "GET" });
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)["Authorization"]).toBeUndefined();
  });

  /* ---------- Body ---------- */

  it("serialises body as JSON", async () => {
    await httpClient({ url: "/items", method: "POST", body: { name: "test" } });
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.body).toBe(JSON.stringify({ name: "test" }));
  });

  it("uses data as fallback when body is not provided", async () => {
    await httpClient({ url: "/items", method: "POST", data: { name: "test" } });
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.body).toBe(JSON.stringify({ name: "test" }));
  });

  /* ---------- Error handling ---------- */

  it("throws on network error", async () => {
    fetchSpy.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await expect(httpClient({ url: "/items", method: "GET" })).rejects.toThrow(
      /network request failed/i,
    );
  });

  it("throws on 4xx responses", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ message: "Not Found" }, 404, "Not Found"));
    await expect(httpClient({ url: "/missing", method: "GET" })).rejects.toThrow(/API 404/);
  });

  it("throws on 5xx responses", async () => {
    fetchSpy.mockResolvedValueOnce(
      jsonResponse({ message: "Internal" }, 500, "Internal Server Error"),
    );
    await expect(httpClient({ url: "/broken", method: "GET" })).rejects.toThrow(/API 500/);
  });

  /* ---------- Response parsing ---------- */

  it("returns parsed JSON for application/json responses", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ id: 1, title: "hello" }));
    const result = await httpClient<{ id: number; title: string }>({
      url: "/items/1",
      method: "GET",
    });
    expect(result).toEqual({ id: 1, title: "hello" });
  });

  it("returns plain text for non-JSON content types", async () => {
    fetchSpy.mockResolvedValueOnce(textResponse("plain text body"));
    const result = await httpClient<string>({ url: "/text", method: "GET" });
    expect(result).toBe("plain text body");
  });
});
