import { afterEach } from "bun:test";

import { createI18n } from "./core/i18n/i18n";
import { hasWindow } from "./shared/lib/runtime-guards";

/** Configures the DOM-backed unit-test environment without affecting WebView E2E runs. */
if (process.env.BUN_WEBVIEW_E2E === "1") {
  // Bun.WebView journeys must retain Bun's native Web API constructors.
} else {
  /** Configures the browser-like test environment and shared test globals. */
  // Register happy-dom globals - this MUST run before any test imports
  const { GlobalRegistrator } = require("@happy-dom/global-registrator");

  GlobalRegistrator.register();

  // jest-dom v7 imports Testing Library's DOM helpers at module load time, so
  // register the browser globals before loading it.
  require("@testing-library/jest-dom");

  // Initialize i18n for tests
  const testI18n = createI18n("en");
  // Make it globally available for react-i18next
  // SAFETY: test setup intentionally exposes the initialized i18n instance on the global object
  // so hooks/components under test can read the same singleton react-i18next expects.
  (global as any).i18n = testI18n;

  // Set up environment variables for tests
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
  process.env.NEXT_PUBLIC_WEB_URL = "http://localhost:3001";

  // Clean up after each test to prevent DOM pollution
  afterEach(() => {
    try {
      // Reset innerHTML as the most reliable way to clear everything
      if (document.body) {
        document.body.innerHTML = "";
      }
    } catch {
      // Ignore cleanup errors - they shouldn't block test progression
    }
  });

  // Mock ResizeObserver
  // SAFETY: the mock class matches the browser API surface these tests rely on.
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;

  // Mock IntersectionObserver
  // SAFETY: the mock class matches the browser API surface these tests rely on.
  global.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;

  // Mock scrollIntoView
  Element.prototype.scrollIntoView = () => {};

  function configureBrowserMocks(): void {
    if (!hasWindow()) return;

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    });

    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        href: "http://localhost:3001/",
        pathname: "/",
        search: "",
        hash: "",
        origin: "http://localhost:3001",
        protocol: "http:",
        host: "localhost:3001",
        hostname: "localhost",
        port: "3001",
        reload: () => {},
        replace: () => {},
        assign: () => {},
      },
    });
  }

  configureBrowserMocks();

  // Global mocks for common hooks that need to work in test environment
  const { vi } = require("bun:test");

  vi.mock("@/shared/hooks/use-is-hydrated", () => ({
    useIsHydrated: () => true,
  }));

  vi.mock("@/shared/hooks/use-responsive", () => ({
    useResponsive: () => ({ isMobile: false, isTablet: false, isWeb: true }),
    useIsDesktop: () => true,
  }));

  // CSS modules are handled natively by Bun's test setup
}
