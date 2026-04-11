import * as Sentry from "@sentry/react-native";
import type { ComponentType } from "react";
import { vexo } from "vexo-analytics";
import { getRuntimeEnv, isDev } from "./config/runtime-env";

export function initIntegrations(): void {
  if (isDev()) {
    return;
  }

  const env = getRuntimeEnv();

  if (env?.sentryDsn) {
    Sentry.init({
      dsn: env.sentryDsn,
      sendDefaultPii: true,
      environment: env.appEnv,
    });
  }

  if (env?.vexoProjectId) {
    vexo(env.vexoProjectId);
  }
}

export function getWrappedLayout<T extends ComponentType<unknown>>(
  Layout: T,
): T | ReturnType<typeof Sentry.wrap> {
  const env = getRuntimeEnv();

  if (isDev() || !env?.sentryDsn) {
    return Layout;
  }
  return Sentry.wrap(Layout) as T;
}
