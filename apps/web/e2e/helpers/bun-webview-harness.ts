import { mkdtempSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

/** Default public port for the Bun.WebView proxy when no isolated port is set. */
export const DEFAULT_E2E_PORT = 3008;
const DEFAULT_READY_TIMEOUT_MS = 120_000;
const DEFAULT_READY_INTERVAL_MS = 100;
const ARTIFACT_ROOT = resolve(process.cwd(), "test-results", "bun-webview");

/** A serialized console call captured from the Chromium page. */
export type BrowserConsoleEntry = {
  type: string;
  args: unknown[];
};

/** Resolved ports, origins, and startup options for one web E2E process. */
export type E2EConfig = {
  /** Public proxy port exposed to the browser. */
  port: number;
  /** Browser-facing origin for the isolated journey. */
  origin: string;
  /** Backend origin used when the production app makes API requests. */
  apiOrigin: string;
  /** Maximum time allowed for the proxy to become ready. */
  readyTimeoutMs: number;
  /** Whether the caller has already built the production app. */
  skipBuild: boolean;
};

/** Browser state and diagnostics owned by one isolated test journey. */
export type BrowserJourney = {
  /** Chromium view used to navigate and evaluate the application. */
  view: Bun.WebView;
  /** Origin served by the journey's public proxy. */
  origin: string;
  /** Console calls captured until the view is closed. */
  console: BrowserConsoleEntry[];
  /** Temporary browser profile removed after the journey closes. */
  profileDirectory: string;
};

/** Defines the CSS viewport used by an isolated browser journey. */
export type BrowserViewport = {
  /** Viewport width in CSS pixels. */
  width: number;
  /** Viewport height in CSS pixels. */
  height: number;
};

/** Configures the viewport used by one isolated browser journey. */
export type BrowserJourneyOptions = {
  /** Optional viewport width; defaults to 1280 pixels. */
  width?: number;
  /** Optional viewport height; defaults to 800 pixels. */
  height?: number;
};

/** Supported locale values used to establish deterministic browser journeys. */
export type BrowserJourneyLocale = "en" | "ar";

/** Running Next.js process and public proxy owned by one E2E file. */
export type WebServer = {
  /** Child process serving the production Next.js build. */
  process: Bun.Subprocess;
  /** Public proxy origin used by browser journeys. */
  origin: string;
  /** Stops both the proxy and the child process. */
  stop: () => Promise<void>;
};

/** Configuration for the shared server lifecycle used by one journey file. */
export type WebServerOptions = {
  /** Default public proxy port when `BUN_E2E_PORT` is not set. */
  defaultPort?: number;
};

function positiveInteger(value: string | undefined): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 65534 ? parsed : undefined;
}

function requestWithNodeHttp(url: URL, method: string, request?: Request): Promise<Response> {
  return new Promise((resolveRequest, rejectRequest) => {
    const headers: Record<string, string> = {};
    request?.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const clientRequest = httpRequest(url, { method, headers }, (response) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => chunks.push(chunk));
      response.on("end", () => {
        const responseHeaders = new Headers();
        for (const [key, value] of Object.entries(response.headers)) {
          if (Array.isArray(value)) responseHeaders.set(key, value.join(", "));
          else if (value !== undefined) responseHeaders.set(key, value);
        }
        resolveRequest(
          new Response(Buffer.concat(chunks), {
            status: response.statusCode ?? 500,
            headers: responseHeaders,
          }),
        );
      });
    });
    clientRequest.on("error", rejectRequest);

    if (request && method !== "GET" && method !== "HEAD") {
      void request.arrayBuffer().then((body) => {
        clientRequest.end(Buffer.from(body));
      }, rejectRequest);
    } else {
      clientRequest.end();
    }
  });
}

/**
 * Reads the isolated web E2E port, falling back when the value is invalid.
 * Invalid configuration is deliberately made deterministic so parallel
 * worktrees can override it explicitly rather than silently selecting a port.
 */
export function getE2EPort(env: Record<string, string | undefined>): number {
  return positiveInteger(env.BUN_E2E_PORT) ?? DEFAULT_E2E_PORT;
}

/** Derives a unique journey port from the shared worktree base port. */
export function getE2EJourneyPort(
  defaultPort: number | undefined,
  env: Record<string, string | undefined>,
): number {
  if (defaultPort === undefined || env.BUN_E2E_PORT === undefined) {
    return defaultPort ?? getE2EPort(env);
  }
  return getE2EPort(env) + defaultPort - DEFAULT_E2E_PORT;
}

/** Returns a filesystem-safe directory name for one failed journey. */
export function getDiagnosticDirectory(testName: string): string {
  const slug = testName
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 120);
  return resolve(ARTIFACT_ROOT, slug || "unnamed-test");
}

/**
 * Resolves browser and API origins from environment variables.
 * `BUN_E2E_PORT` controls the isolated browser-facing proxy, while
 * `BUN_E2E_API_ORIGIN` controls the backend origin used by the built app.
 * Invalid numeric values fall back to deterministic defaults.
 */
export function getE2EConfig(env: Record<string, string | undefined> = process.env): E2EConfig {
  const port = getE2EPort(env);
  const origin = `http://127.0.0.1:${port}`;
  return {
    port,
    origin,
    apiOrigin: env.BUN_E2E_API_ORIGIN ?? env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
    readyTimeoutMs: positiveInteger(env.BUN_E2E_READY_TIMEOUT_MS) ?? DEFAULT_READY_TIMEOUT_MS,
    skipBuild: env.BUN_E2E_SKIP_BUILD === "1",
  };
}

/** Starts the already-built Next.js app and owns its process until stopped. */
export async function startWebServer(config: E2EConfig = getE2EConfig()): Promise<WebServer> {
  const upstreamPort = config.port + 1;
  const child = Bun.spawn(["bun", "--bun", "next", "start", "--port", String(upstreamPort)], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NEXT_PUBLIC_API_URL: config.apiOrigin.replace(`:${config.port}`, `:${upstreamPort}`),
      NEXT_PUBLIC_WEB_URL: config.origin,
      FALLBACK_TEST_MODE: "1",
    },
    stdout: "inherit",
    stderr: "inherit",
  });
  let adapter: ReturnType<typeof Bun.serve>;
  try {
    adapter = Bun.serve({
      port: config.port,
      async fetch(request) {
        const url = new URL(request.url);
        url.port = String(upstreamPort);
        const method = request.method === "OPTIONS" ? "GET" : request.method;
        let response: Response;
        try {
          response = await requestWithNodeHttp(url, method, request);
        } catch {
          return new Response("upstream unavailable", { status: 503 });
        }
        if (request.method !== "OPTIONS") return response;
        const headers = new Headers(response.headers);
        headers.set("access-control-allow-origin", "*");
        headers.set("access-control-allow-methods", "GET,HEAD,OPTIONS");
        return new Response(response.body, {
          status: response.status,
          headers,
        });
      },
    });
  } catch (error) {
    child.kill("SIGINT");
    await child.exited;
    throw error;
  }

  return {
    process: child,
    origin: config.origin,
    stop: async () => {
      await adapter.stop(true);
      child.kill("SIGINT");
      await child.exited;
    },
  };
}

/** Creates a lazily started server lifecycle for a Bun test file. */
export function createWebE2EServer(options: WebServerOptions = {}) {
  const env = { ...process.env };
  if (options.defaultPort !== undefined) {
    env.BUN_E2E_PORT = String(getE2EJourneyPort(options.defaultPort, process.env));
  }
  const config = getE2EConfig(env);
  let server: WebServer | undefined;

  return {
    config,
    start: async () => {
      server = await startWebServer(config);
      await waitForWebReady(config.origin, { timeoutMs: config.readyTimeoutMs });
    },
    stop: async () => {
      await server?.stop();
    },
  };
}

/** Waits for the production web server to answer before opening a browser. */
export async function waitForWebReady(
  origin: string,
  options: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_READY_TIMEOUT_MS;
  const intervalMs = options.intervalMs ?? DEFAULT_READY_INTERVAL_MS;
  const deadline = Date.now() + timeoutMs;
  let lastError = "no response";

  while (Date.now() < deadline) {
    try {
      const response = await requestWithNodeHttp(new URL(`${origin}/`), "HEAD");
      if (response.status >= 200 && response.status < 500) return;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await Bun.sleep(intervalMs);
  }

  throw new Error(`Web server was not ready at ${origin} within ${timeoutMs}ms: ${lastError}`);
}

/** Waits for a named application condition without recreating browser auto-waiting. */
export async function waitForBrowserCondition(
  view: Bun.WebView,
  description: string,
  condition: string,
  options: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_READY_TIMEOUT_MS;
  const intervalMs = options.intervalMs ?? DEFAULT_READY_INTERVAL_MS;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await view.evaluate<boolean>(condition)) return;
    await Bun.sleep(intervalMs);
  }

  throw new Error(`Application condition was not met within ${timeoutMs}ms: ${description}`);
}

function serializeConsoleArgs(args: unknown[]): unknown[] {
  return args.map((value) => {
    try {
      const serialized = JSON.stringify(value);
      return serialized === undefined ? String(value) : JSON.parse(serialized);
    } catch {
      return String(value);
    }
  });
}

/**
 * Creates an isolated Chromium view and records page console calls.
 * The temporary profile keeps cookies and local storage isolated from other
 * journeys; `withBrowserJourney` removes it after the callback completes.
 */
export function createBrowserJourney(
  origin: string,
  options: BrowserJourneyOptions = {},
): BrowserJourney {
  const consoleEntries: BrowserConsoleEntry[] = [];
  const profileDirectory = mkdtempSync(join(tmpdir(), "salafi-durus-bun-webview-"));
  const view = new Bun.WebView({
    backend: { type: "chrome", url: false },
    dataStore: { directory: profileDirectory },
    width: options.width ?? 1280,
    height: options.height ?? 800,
    console: (type, ...args) => {
      consoleEntries.push({ type, args: serializeConsoleArgs(args) });
    },
  });
  return { view, origin, console: consoleEntries, profileDirectory };
}

/**
 * Establishes a clean, deterministic browser state before a journey navigates
 * to its route. Bun.WebView profiles are isolated on disk, but the browser
 * backend can retain origin state across views, so each journey explicitly
 * resets storage and sets the locale it intends to exercise.
 */
export async function initializeBrowserJourney(
  view: Bun.WebView,
  origin: string,
  locale: BrowserJourneyLocale = "en",
): Promise<void> {
  await view.navigate(origin);
  await view.evaluate(`(() => {
    document.cookie = ${JSON.stringify(`locale=${locale}; path=/; max-age=31536000; SameSite=Lax`)};
    localStorage.clear();
    sessionStorage.clear();
    return true;
  })()`);
}

/** Writes the required failure evidence for a journey before its view closes. */
export async function captureFailureDiagnostics(
  journey: BrowserJourney,
  testName: string,
  error: Error,
): Promise<string> {
  const directory = getDiagnosticDirectory(testName);
  await mkdir(directory, { recursive: true });
  const dom = await journey.view
    .evaluate<string>("document.documentElement.outerHTML")
    .catch(() => "");
  const screenshot = await journey.view
    .screenshot({ encoding: "buffer" })
    .catch(() => Buffer.alloc(0));
  const failure = `${error.name}: ${error.message}\n${error.stack ?? ""}`;

  await Promise.all([
    writeFile(resolve(directory, "test-name.txt"), testName),
    writeFile(resolve(directory, "url.txt"), journey.view.url),
    writeFile(resolve(directory, "dom.html"), dom),
    writeFile(resolve(directory, "console.json"), JSON.stringify(journey.console, null, 2)),
    writeFile(resolve(directory, "error.txt"), failure),
    writeFile(resolve(directory, "screenshot.png"), screenshot),
  ]);
  return directory;
}

/** Runs one journey and guarantees browser cleanup after success or failure. */
export async function withBrowserJourney<T>(
  testName: string,
  origin: string,
  callback: (journey: BrowserJourney) => Promise<T>,
  options?: BrowserJourneyOptions,
): Promise<T> {
  const journey = createBrowserJourney(origin, options);
  try {
    return await callback(journey);
  } catch (error) {
    await captureFailureDiagnostics(
      journey,
      testName,
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  } finally {
    journey.view.close();
    await rm(journey.profileDirectory, { recursive: true, force: true });
  }
}
