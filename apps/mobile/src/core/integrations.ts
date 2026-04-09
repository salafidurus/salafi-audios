import * as Sentry from "@sentry/react-native";
import type { ComponentType } from "react";
import { vexo } from "vexo-analytics";
import { getRuntimeEnv, isDev } from "./config/env";

export function initIntegrations(): void {
  if (isDev()) {
    return;
  }

  const mobileEnv = getRuntimeEnv();

  if (mobileEnv?.sentryDsn) {
    Sentry.init({
      dsn: mobileEnv.sentryDsn,
      sendDefaultPii: true,
      environment: mobileEnv.appEnv,
    });
  }

  if (mobileEnv?.vexoProjectId) {
    vexo(mobileEnv.vexoProjectId);
  }
}

export function getWrappedLayout<T extends ComponentType<unknown>>(
  Layout: T,
): T | ReturnType<typeof Sentry.wrap> {
  const mobileEnv = getRuntimeEnv();

  if (isDev() || !mobileEnv?.sentryDsn) {
    return Layout;
  }
  return Sentry.wrap(Layout) as T;
}

