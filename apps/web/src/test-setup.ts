import { GlobalRegistrator } from "@happy-dom/global-registrator";
import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll } from "bun:test";

// Register happy-dom globals
GlobalRegistrator.register();

// Make test functions global so they don't need to be imported
(globalThis as any).describe = describe;
(globalThis as any).it = it;
(globalThis as any).expect = expect;
(globalThis as any).beforeEach = beforeEach;
(globalThis as any).afterEach = afterEach;
(globalThis as any).afterAll = afterAll;
(globalThis as any).beforeAll = beforeAll;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Mock matchMedia
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

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Mock scrollIntoView
Element.prototype.scrollIntoView = () => {};
