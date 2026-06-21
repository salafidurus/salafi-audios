import { vi, type Mock } from "vitest";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { proxy } from "./proxy";

vi.mock("next/server", () => ({
  NextResponse: {
    redirect: vi.fn(),
    next: vi.fn(),
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

  describe("protected paths", () => {
    it.each(["/account", "/feed/following", "/settings", "/admin", "/admin/dashboard"])(
      "redirects unauthenticated request to %s → /sign-in",
      (pathname) => {
        proxy(makeRequest(pathname, undefined));
        expect(mockRedirect).toHaveBeenCalled();
        expect(mockNext).not.toHaveBeenCalled();
      },
    );

    it.each(["/account", "/admin/dashboard"])("allows authenticated request to %s", (pathname) => {
      proxy(makeRequest(pathname, "some-session-token"));
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

  describe("public paths", () => {
    it("allows unauthenticated access to /", () => {
      proxy(makeRequest("/", undefined));
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
