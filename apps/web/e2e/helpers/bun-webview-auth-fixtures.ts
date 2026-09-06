import { endpoints } from "@sd/core-contracts";

import type { BrowserJourney } from "./bun-webview-harness";

/** Represents the backend-derived capability profiles used by web journeys. */
export type AuthRole = "listener" | "scoped-admin" | "superadmin";
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/** Selects the deterministic session and mutation outcomes for one journey. */
export type AuthFixtureOptions = {
  /** API origin used by the built browser client, normally localhost:4000. */
  apiOrigin?: string;
  /** Capability profile returned by the account and session endpoints. */
  role?: AuthRole;
  /** Delay applied to session verification to exercise the loading/timeout UI. */
  sessionDelayMs?: number;
  /** HTTP status returned by the session endpoint. */
  sessionStatus?: 200 | 500;
  /** HTTP status returned by the sign-out endpoint. */
  signOutStatus?: 200 | 500;
};

type PausedRequest = {
  requestId: string;
  request: { method: string; url: string };
};

type AuthFixtureServer = ReturnType<typeof Bun.serve>;

const users = {
  listener: { id: "listener-1", name: "Listener", email: "listener@example.com" },
  "scoped-admin": { id: "scoped-admin-1", name: "Scoped Admin", email: "scoped@example.com" },
  superadmin: { id: "superadmin-1", name: "Superadmin", email: "superadmin@example.com" },
} satisfies Record<AuthRole, { id: string; name: string; email: string }>;

const rules = {
  listener: [],
  "scoped-admin": [
    ["read", "Scholar"],
    ["read", "Listing"],
  ],
  superadmin: [["manage", "all"]],
} satisfies Record<AuthRole, readonly unknown[][]>;

function jsonResponse(body: JsonValue, status: number, origin: string) {
  return {
    responseCode: status,
    responseHeaders: [
      { name: "content-type", value: "application/json" },
      { name: "access-control-allow-origin", value: origin },
      { name: "access-control-allow-credentials", value: "true" },
      { name: "access-control-allow-methods", value: "GET, POST, PATCH, OPTIONS" },
      { name: "access-control-allow-headers", value: "content-type" },
    ],
    body: Buffer.from(JSON.stringify(body)).toString("base64"),
  };
}

function sessionFor(role: AuthRole) {
  const user = users[role];
  return {
    session: {
      id: `session-${user.id}`,
      userId: user.id,
      expiresAt: "2030-01-01T00:00:00.000Z",
    },
    user: {
      ...user,
      emailVerified: true,
      image: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  };
}

/** Narrows a fixture header to one of the supported deterministic auth roles. */
function isAuthRole(value: string | null): value is AuthRole {
  return value !== null && value in users;
}

/** Returns a JSON response for the local API fixture server. */
function localJsonResponse(body: JsonValue, status: number, origin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": origin,
      "access-control-allow-credentials": "true",
      "access-control-allow-methods": "GET, POST, PATCH, OPTIONS",
      "access-control-allow-headers":
        "content-type, x-e2e-auth-role, x-e2e-session-status, x-e2e-sign-out-status",
    },
  });
}

/**
 * Installs deterministic Better Auth and account responses for one isolated
 * browser journey. Only the application endpoints needed by auth/account
 * journeys are intercepted; unrelated requests continue to the production
 * web server. The returned cleanup disables interception before the view is
 * closed so a later journey cannot inherit the fixture.
 */
export async function installAuthFixtures(
  journey: BrowserJourney,
  options: AuthFixtureOptions = {},
): Promise<() => Promise<void>> {
  const apiOrigin = new URL(
    options.apiOrigin ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  ).origin;
  const role = options.role;
  const sessionDelayMs = options.sessionDelayMs ?? 0;
  const sessionStatus = options.sessionStatus ?? 200;
  const signOutStatus = options.signOutStatus ?? 200;
  const session = role ? sessionFor(role) : { session: null, user: null };
  const webOrigin = journey.origin;
  const pendingPausedRequests = new Set<Promise<void>>();
  let fixtureServer: AuthFixtureServer | undefined;

  const apiUrl = new URL(apiOrigin);
  if (apiUrl.port !== "" && (apiUrl.hostname === "localhost" || apiUrl.hostname === "127.0.0.1")) {
    fixtureServer = Bun.serve({
      port: Number(apiUrl.port || 80),
      reusePort: true,
      async fetch(request) {
        const url = new URL(request.url);
        const fixtureRole = request.headers.get("x-e2e-auth-role");
        const fixtureSession = isAuthRole(fixtureRole) ? sessionFor(fixtureRole) : session;
        const fixtureProfileRole = isAuthRole(fixtureRole) ? fixtureRole : role;
        const fixtureSessionStatus =
          request.headers.get("x-e2e-session-status") === "500" ? 500 : sessionStatus;
        const fixtureSignOutStatus =
          request.headers.get("x-e2e-sign-out-status") === "500" ? 500 : signOutStatus;

        if (request.method === "OPTIONS") return localJsonResponse({}, 204, webOrigin);
        if (url.pathname === "/api/auth/get-session") {
          if (sessionDelayMs > 0) await Bun.sleep(sessionDelayMs);
          return localJsonResponse(
            fixtureSessionStatus === 200
              ? fixtureSession
              : { error: { message: "Provider failed" } },
            fixtureSessionStatus,
            webOrigin,
          );
        }
        if (url.pathname === "/api/auth/sign-out") {
          return localJsonResponse(
            fixtureSignOutStatus === 200
              ? { success: true }
              : { error: { message: "Provider failed" } },
            fixtureSignOutStatus,
            webOrigin,
          );
        }
        if (url.pathname === endpoints.account.profile && fixtureProfileRole) {
          const user = users[fixtureProfileRole];
          return localJsonResponse(
            {
              ...user,
              avatarUrl: null,
              displayName: user.name,
              emailVerified: true,
              roles: fixtureProfileRole === "superadmin" ? ["superadmin"] : [],
              rules: rules[fixtureProfileRole],
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
            200,
            webOrigin,
          );
        }
        if (url.pathname === endpoints.admin.users.list) {
          return localJsonResponse({ users: [], nextCursor: null, hasMore: false }, 200, webOrigin);
        }
        return localJsonResponse({}, 404, webOrigin);
      },
    });
    await journey.view.cdp("Network.setExtraHTTPHeaders", {
      headers: {
        "x-e2e-auth-role": role ?? "anonymous",
        "x-e2e-session-status": String(sessionStatus),
        "x-e2e-sign-out-status": String(signOutStatus),
      },
    });
  }

  const handlePaused = async (event: Event) => {
    // SAFETY: Bun.WebView's Fetch.requestPaused event always exposes the CDP payload as `data`.
    const { requestId, request } = (event as Event & { data: PausedRequest }).data;
    const url = new URL(request.url);
    let response;

    if (url.pathname === "/api/auth/get-session") {
      if (sessionDelayMs > 0) await Bun.sleep(sessionDelayMs);
      response = jsonResponse(
        sessionStatus === 200 ? session : { error: { message: "Provider failed" } },
        sessionStatus,
        webOrigin,
      );
    } else if (url.pathname === "/api/auth/sign-out") {
      response = jsonResponse(
        signOutStatus === 200 ? { success: true } : { error: { message: "Provider failed" } },
        signOutStatus,
        webOrigin,
      );
    } else if (url.pathname === endpoints.account.profile && role) {
      const user = users[role];
      response = jsonResponse(
        {
          ...user,
          avatarUrl: null,
          displayName: user.name,
          emailVerified: true,
          roles: role === "superadmin" ? ["superadmin"] : [],
          rules: rules[role],
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        200,
        webOrigin,
      );
    } else if (url.pathname === endpoints.admin.users.list) {
      response = jsonResponse({ users: [], nextCursor: null, hasMore: false }, 200, webOrigin);
    } else {
      response = jsonResponse({}, 404, webOrigin);
    }

    try {
      await journey.view.cdp("Fetch.fulfillRequest", { requestId, ...response });
    } catch {
      // The delayed-session timeout journey intentionally closes before its
      // delayed interception callback resolves.
    }
  };

  const onPaused = (event: Event) => {
    const pending = handlePaused(event);
    pendingPausedRequests.add(pending);
    void pending.then(
      () => pendingPausedRequests.delete(pending),
      () => pendingPausedRequests.delete(pending),
    );
  };

  journey.view.addEventListener("Fetch.requestPaused", onPaused);
  await journey.view.cdp("Fetch.enable", {
    patterns: [
      { urlPattern: `${apiOrigin}/api/auth/*` },
      { urlPattern: `${apiOrigin}${endpoints.account.profile}` },
      { urlPattern: `${apiOrigin}${endpoints.admin.users.list}*` },
    ],
  });

  if (role) {
    await journey.view.navigate(webOrigin);
    await journey.view.evaluate(
      `document.cookie = "better-auth.session_token=fixture-session; Path=/"`,
    );
  }

  return async () => {
    journey.view.removeEventListener("Fetch.requestPaused", onPaused);
    await Promise.allSettled(pendingPausedRequests);
    await journey.view.cdp("Fetch.disable").catch(() => undefined);
    await journey.view.cdp("Network.setExtraHTTPHeaders", { headers: {} }).catch(() => undefined);
    await fixtureServer?.stop(true);
  };
}

/** Runs a journey with auth interception and always disables its CDP fixture. */
export async function withAuthFixtures<T>(
  journey: BrowserJourney,
  options: AuthFixtureOptions,
  callback: () => Promise<T>,
): Promise<T> {
  await journey.view.navigate("about:blank");
  const cleanup = await installAuthFixtures(journey, options);
  try {
    return await callback();
  } finally {
    await cleanup();
  }
}
