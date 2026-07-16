import { vi, type Mock } from "vitest";
import { NextResponse, type NextRequest } from "next/server";
import { proxy } from "./proxy";

vi.mock("next/server", () => ({
  NextResponse: {
    redirect: vi.fn<any>(),
    next: vi.fn<any>(),
  },
}));

const mockRedirect = NextResponse.redirect as Mock;
const mockNext = NextResponse.next as Mock;

function makeRequest(pathname: string, cookieValue?: string): NextRequest {
  return {
    nextUrl: { pathname },
    cookies: {
      get: (_name: string) =>
        cookieValue !== undefined ? { name: _name, value: cookieValue } : undefined,
    },
    url: `http://localhost${pathname}`,
  } as unknown as NextRequest;
}

describe("proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedirect.mockReturnValue({ type: "redirect" });
    mockNext.mockReturnValue({ type: "next" });
  });

  describe("auth-required paths", () => {
    it.each(["/explore/following", "/admin", "/admin/dashboard"])(
      "redirects unauthenticated request to %s → /sign-in",
      (pathname) => {
        proxy(makeRequest(pathname, undefined));
        expect(mockRedirect).toHaveBeenCalled();
        expect(mockNext).not.toHaveBeenCalled();
      },
    );

    it("redirects to /sign-in carrying the original path in the `from` query", () => {
      proxy(makeRequest("/explore/following", undefined));
      const redirectedTo = mockRedirect.mock.calls[0]![0] as URL;
      expect(redirectedTo.pathname).toBe("/sign-in");
      expect(redirectedTo.searchParams.get("from")).toBe("/explore/following");
    });

    it.each(["/account/profile", "/admin/dashboard"])(
      "allows authenticated request to %s",
      (pathname) => {
        proxy(makeRequest(pathname, "some-session-token"));
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockRedirect).not.toHaveBeenCalled();
      },
    );
  });

  describe("auth-optional and public paths", () => {
    it.each([
      "/account",
      "/account/profile",
      "/explore",
      "/live",
      "/library",
      "/search",
      "/settings",
      "/",
    ])("allows unauthenticated access to %s", (pathname) => {
      proxy(makeRequest(pathname, undefined));
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe("auth paths", () => {
    it("redirects authenticated user away from /sign-in", () => {
      proxy(makeRequest("/sign-in", "some-session-token"));
      expect(mockRedirect).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("allows unauthenticated user to /sign-in", () => {
      proxy(makeRequest("/sign-in", undefined));
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });
});
