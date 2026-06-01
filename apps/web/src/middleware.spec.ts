import { NextRequest, NextResponse } from "next/server";
import { middleware } from "./middleware";

jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn(),
    next: jest.fn(),
  },
}));

const mockRedirect = NextResponse.redirect as jest.Mock;
const mockNext = NextResponse.next as jest.Mock;

function makeRequest(cookieValue?: string): NextRequest {
  return {
    cookies: {
      get: (name: string) => (cookieValue !== undefined ? { name, value: cookieValue } : undefined),
    },
    url: "http://localhost/admin/dashboard",
  } as unknown as NextRequest;
}

describe("middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedirect.mockReturnValue({ type: "redirect" });
    mockNext.mockReturnValue({ type: "next" });
  });

  it("calls NextResponse.next() when session cookie is present", () => {
    const request = makeRequest("some-session-token");
    middleware(request);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redirects to /sign-in when session cookie is absent", () => {
    const request = makeRequest(undefined);
    middleware(request);
    expect(mockRedirect).toHaveBeenCalledWith(new URL("/sign-in", request.url));
    expect(mockNext).not.toHaveBeenCalled();
  });
});
