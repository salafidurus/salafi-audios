import type { ComponentType } from "react";

export function initIntegrations(): void {
  // Web integrations are initialized in web app infrastructure.
}

export function getWrappedLayout<T extends ComponentType<unknown>>(Layout: T): T {
  return Layout;
}
