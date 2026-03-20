import * as Sentry from "@sentry/react-native";
import type { ComponentType } from "react";
import { vexo } from "vexo-analytics";
import { isDev, mobileEnv } from "./env.native";

export function initIntegrations(): void {
  if (isDev) {
    return;
  }

  if (mobileEnv.sentryDsn) {
    Sentry.init({
      dsn: mobileEnv.sentryDsn,
      sendDefaultPii: true,
      environment: mobileEnv.appEnv,
    });
  }

  if (mobileEnv.vexoProjectId) {
    vexo(mobileEnv.vexoProjectId);
  }
}

export function getWrappedLayout<T extends ComponentType<unknown>>(
  Layout: T,
): T | ReturnType<typeof Sentry.wrap> {
  if (isDev || !mobileEnv.sentryDsn) {
    return Layout;
  }
  return Sentry.wrap(Layout) as T;
}
