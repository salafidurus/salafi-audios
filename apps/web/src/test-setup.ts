import "@testing-library/jest-dom";
import { afterEach } from "bun:test";
import { createI18n } from "./core/i18n/i18n";

// Register happy-dom globals - this MUST run before any test imports
const { GlobalRegistrator } = require("@happy-dom/global-registrator");
GlobalRegistrator.register();

// Initialize i18n for tests
const testI18n = createI18n("en");
// Make it globally available for react-i18next
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
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Mock matchMedia
if (typeof window !== "undefined") {
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
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Mock scrollIntoView
Element.prototype.scrollIntoView = () => {};

// Mock window.location
if (typeof window !== "undefined") {
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
