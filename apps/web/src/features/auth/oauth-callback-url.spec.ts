import { buildOAuthCallbackURL } from "./oauth-callback-url";

describe("buildOAuthCallbackURL", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      NEXT_PUBLIC_API_URL: "http://localhost:4000",
      NEXT_PUBLIC_WEB_URL: "http://localhost:3000",
    };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("points the callback at the API OAuth bridge", () => {
    const url = buildOAuthCallbackURL("/library");
    expect(url.startsWith("http://localhost:4000/auth-bridge/oauth-complete?redirect=")).toBe(true);
  });

  it("embeds the encoded web callback target carrying the post-login path", () => {
    const url = buildOAuthCallbackURL("/library");
    const redirect = new URL(url).searchParams.get("redirect");
    expect(redirect).toBe("http://localhost:3000/auth/callback?redirect=%2Flibrary");
  });

  it("round-trips the post-login path through both layers of encoding", () => {
    const url = buildOAuthCallbackURL("/feed/following");
    const bridgeRedirect = new URL(url).searchParams.get("redirect")!;
    const webNext = new URL(bridgeRedirect).searchParams.get("redirect");
    expect(webNext).toBe("/feed/following");
  });
});
